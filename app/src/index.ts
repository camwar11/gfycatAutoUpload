import { Config } from "../../config";
import { ApiConfig, GfycatClient } from "./GfycatClient";

let apiConfig: ApiConfig = {
    clientId: Config.id,
    clientSecret: Config.secret,
    userName: Config.userName,
    password: Config.password
};

let authenticator = new GfycatClient(apiConfig);
console.log("pre auth");
authenticator.Authenticate();
