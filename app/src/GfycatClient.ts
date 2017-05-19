import * as HttpClient from "typed-rest-client/HTTPClient";
import { Config } from "../../config";

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
    client_id: string;
    client_secret: string;
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

export class GfycatClient {
    private _httpClient: HttpClient.HttpClient;
    private static readonly _baseURL = "https://api.gfycat.com/v1/";
    private _authenticator: Authenticator;
    private _accessToken: string;

    constructor(private Config: ApiConfig) {
        this._httpClient = new HttpClient.HttpClient("GfycatUploader");
        this._authenticator = new Authenticator(GfycatClient._baseURL, this._httpClient, Config);
    }

    public Authenticate() {
        this._authenticator.GetAccessToken().then((token) => {
            console.log(token);
        },
        (reason) => {
            console.error("Auth failed " + reason);
        });
    }
}

class Authenticator {
    private _authResponse: TokenResponsePayload;
    private _passwordGrantPayload: PasswordGrantPayload;

    constructor(private _baseURL: string, private _httpClient: HttpClient.HttpClient, private _apiConfig: ApiConfig) {
        this._baseURL = this._baseURL + "oauth/token";
        this._passwordGrantPayload = new PasswordGrantPayload(_apiConfig.clientId, _apiConfig.clientSecret,
            _apiConfig.userName, _apiConfig.password);
    }

    public GetAccessToken(): Promise<string> {
        let self = this;
        return new Promise<string>((resolve, reject) => {
            let data = JSON.stringify(self._passwordGrantPayload);
            self._httpClient.post(self._baseURL, data).then((response) => {
                if (response.message.statusCode !== HttpClient.HttpCodes.OK) {
                    reject("Http request returned status code " + response.message.statusCode);
                    return;
                }

                let value = response.message;
                response.readBody().then((body) => {
                    let result = JSON.parse(body);
                    let parsedResponse = result as TokenResponsePayload;

                    if (parsedResponse === undefined) {
                        reject("Response was not in expected format.");
                        return;
                    }
                    self._authResponse = parsedResponse;
                    resolve(parsedResponse.access_token);
                });
            },
            (reason) => {reject(reason); });
        });
    }
}
