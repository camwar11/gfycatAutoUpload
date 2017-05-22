import * as fs from 'fs';
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

let stream = fs.createReadStream("C:\\Users\\cam11\\Videos\\Overwolf\\Replay HUD\\Rocket League 05-21-2017 2-10-35-125.mp4");

authenticator.UploadVideo("test", stream)
.then(() => {
    console.log("Done");
})
.catch((reason) => {
    console.error(reason);
});

// authenticator.Authenticate().then(() => {
//     console.log("Done");
// })
// .then(() => {
//     authenticator.UploadVideo("test");
// })
// .then(() => {
//     console.log("Done");
// })
// .catch((reason) => {
//     console.error(reason);
// });
