import { Authenticator } from "./Authentication";

let authenticator = new Authenticator("https://api.gfycat.com");
console.log("pre auth");
authenticator.Authenticate();