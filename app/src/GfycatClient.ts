import * as fs from "fs";
import * as http from "http";
import { IHeaders, IHttpResponse, IRequestHandler } from "typed-rest-client/Interfaces";
import * as HttpClient from "typed-rest-client/HTTPClient";
import { Config } from "../../config";
import * as FormData from "form-data";

export interface ApiConfig {
    clientId: string;
    clientSecret: string;
    userName: string;
    password: string;
}

class PasswordGrantPayload {
    grant_type = "password";

    constructor(public client_id: string, public client_secret: string, public username: string, public password: string) {
    }
}

class RefreshTokenPayload {
    grant_type = "refresh";
    constructor(public client_id: string, public client_secret: string, public refresh_token: string) {
    }
}

interface TokenResponsePayload {
    token_type: string;
    refresh_token_expires_in: number;
    refresh_token: string;
    scope: string;
    resource_owner: string;
    expires_in: number;
    access_token: string;
}

interface Title {
    title: string;
}

interface UploadKeyResponse {
    gfyname: string;
    secret: string;
    uploadType: string;
    isOk: boolean;
}

class HTTPError {
    constructor(public errorCode: HttpClient.HttpCodes, message: string) {
    }

    public static isHttpError(object: any): object is HTTPError {
        return (<HTTPError>object).errorCode !== undefined;
    }
}

enum RequestType {
    POST,
    Upload
}

export class GfycatClient {
    private _httpClient: HttpClient.HttpClient;
    private static readonly _baseURL = "https://api.gfycat.com/v1/";
    private _authenticator: Authenticator;
    private _accessToken: string;

    constructor(private Config: ApiConfig) {
        this._authenticator = new Authenticator(GfycatClient._baseURL, this, Config);
        this._httpClient = new HttpClient.HttpClient("GfycatUploader", [this._authenticator]);
    }

    public Authenticate(): Promise<void> {
        let self = this;
        return this._authenticator.Authenticate().then((token) => {
            console.log("Got access token: " + token);
        }).catch((reason) => {
            console.error("Auth failed " + reason);
        });
    }

    public UploadVideo(title: string, stream: NodeJS.ReadableStream): Promise<void> {
        let self = this;
        return this.Post<UploadKeyResponse>(GfycatClient._baseURL + "gfycats", { "title": title })
        .then((value) => {
            console.log(value);

            let data: FormData = new FormData();
            data.append("key", value.gfyname);
            data.append("file", stream, {fileName: value.gfyname});

            return self.SendStream<void>("https://" + value.uploadType, data);
        });
    }

    public Post<T>(url: string, payload: any, autoAuth: boolean = true, httpClient: HttpClient.HttpClient = this._httpClient): Promise<T> {
        return this.Request<T>(RequestType.POST, url, payload, true, autoAuth, httpClient);
    }

    public SendStream<T>(url: string, stream: NodeJS.ReadableStream, autoAuth: boolean = true,
                        httpClient: HttpClient.HttpClient = this._httpClient) {
        return this.Request<T>(RequestType.Upload, url, stream, false, autoAuth, httpClient);
    }

    private Request<T>(type: RequestType, url: string, payload: any, jsonifyPayload: boolean = true,
            autoAuth: boolean = true, httpClient: HttpClient.HttpClient = this._httpClient): Promise<T> {
        let self = this;
        return new Promise<T>((resolve, reject) => {
            let data = jsonifyPayload ? JSON.stringify(payload) : payload;
            let starter: Promise<void>;
            if (autoAuth === true) {
                starter = self._authenticator.Authenticate();
            } else {
                starter = Promise.resolve();
            }

            let request: Promise<HttpClient.HttpClientResponse>;
            switch (type) {
                case RequestType.POST:
                    request = starter.then(() => { return httpClient.post(url, data); });
                    break;
                case RequestType.Upload:
                    request = starter.then(() => { return httpClient.sendStream("POST", url, data); });
                    break;
                default:
                    throw Error("Unknown request type: " + type);
            }

            return request.then((response) => {
                if (response.message.statusCode !== HttpClient.HttpCodes.OK) {
                    if (response.message.statusCode === HttpClient.HttpCodes.Unauthorized && autoAuth) {
                        return self._authenticator.Authenticate();
                    }

                    let errorMessage = new HTTPError(<HttpClient.HttpCodes>response.message.statusCode, response.message.statusMessage);
                    reject(errorMessage);
                    return;
                }

                let value = response.message;
                response.readBody().then((body) => {
                    let result = JSON.parse(body);
                    let parsedResponse = result as T;

                    if (parsedResponse === undefined) {
                        reject("Response was not in expected format.");
                        return;
                    }

                    resolve(parsedResponse);
                });
            });
        });
    }
}

class Authenticator implements IRequestHandler {
    private _authResponse: TokenResponsePayload;
    private _passwordGrantPayload: PasswordGrantPayload;
    private _lastResponseTime: number;
    private _httpClient = new HttpClient.HttpClient("GfycatUploader");

    constructor(private _baseURL: string, private _gfycatClient: GfycatClient, private _apiConfig: ApiConfig) {
        this._baseURL = this._baseURL + "oauth/token";
        this._passwordGrantPayload = new PasswordGrantPayload(_apiConfig.clientId, _apiConfig.clientSecret,
            _apiConfig.userName, _apiConfig.password);
        this._lastResponseTime = Number.MIN_SAFE_INTEGER;
    }

    public Authenticate(): Promise<void> {
        let currentTime = Date.now();
        if (this.NeedsAuthentication()) {
            return this.GetAccessToken().then((token) => {
                console.log("Authenticated");
            });
        } else if (this.NeedsRefresh()) {
            return this.RefreshToken().then((token) => {
                console.log("Refreshed Authentication");
            }).catch((reason) => {
                if (HTTPError.isHttpError(reason)) {
                    return this.GetAccessToken().then((token) => {
                        console.log("Authenticated");
                    });
                } else {
                    return Promise.reject(reason);
                }
            });
        } else {
            return Promise.resolve();
        }
    }

    private NeedsAuthentication(): boolean {
        return this._lastResponseTime === Number.MIN_SAFE_INTEGER ||
            this._lastResponseTime + this._authResponse.refresh_token_expires_in <= Date.now();
    }

    private NeedsRefresh(): boolean {
        return this._lastResponseTime + this._authResponse.expires_in <= Date.now();
    }

    public prepareRequest(options: http.RequestOptions): void {
        if (this.NeedsAuthentication() || this.NeedsRefresh()) {
            throw new Error("Needs auth.");
        }

        options.headers.Authorization = "Bearer " + this._authResponse.access_token;
    }

    public canHandleAuthentication(res: IHttpResponse): boolean {
        // This isn't supported yet in the HTTPClient library.
        return false;
    }

    public handleAuthentication(httpClient: HttpClient.HttpClient, protocol: any,
        options: any, objs: any, finalCallback: any): Promise<void> {
        return this.Authenticate();
    }

    private GetAccessToken(): Promise<string> {
        let self = this;
        return this._gfycatClient.Post<TokenResponsePayload>(this._baseURL, this._passwordGrantPayload, false, this._httpClient)
        .then((value) => {
            self._authResponse = value;
            self._lastResponseTime = Date.now();
            return value.access_token;
        });
    }

    private RefreshToken(): Promise<string> {
        let self = this;
        let refreshPayload = new RefreshTokenPayload(this._apiConfig.clientId, this._apiConfig.clientSecret,
            this._authResponse.refresh_token);

        return this._gfycatClient.Post<TokenResponsePayload>(this._baseURL, refreshPayload, false, this._httpClient)
        .then((value) => {
            self._authResponse = value;
            self._lastResponseTime = Date.now();
            return value.access_token;
        });
    }
}
