import * as HttpClient from 'typed-rest-client/HTTPClient';
import { Config } from "../../config";

export class Authenticator {
    private _HttpClient: HttpClient.HttpClient;
    private _clientId: string;
    private _clientSecret: string;

    constructor(private baseURL: string){
        this._HttpClient = new HttpClient.HttpClient("GfycatUploader");
        this._clientId = Config.id;
        this._clientSecret = Config.secret;        
    }

    public Authenticate(){
        let data = {
            "grant_type": "client_credentials",
            "client_id": this._clientId,
            "client_secret": this._clientSecret
        };

        console.log("attempting to auth "+ JSON.stringify(data));
        this._HttpClient.post(this.baseURL + "/v1/oauth/token", JSON.stringify(data)).then((response) => {
            let value = response.message;
            response.readBody().then((body) => console.log(body));
            console.log("Got response.");
        })
    }
}
