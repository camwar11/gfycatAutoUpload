import * as fs from 'fs';
import { Config } from '../../config';
import { ApiConfig, GfycatClient } from './GfycatClient';
import { FileWatcher } from './FileWatcher';

let apiConfig: ApiConfig = {
    clientId: Config.id,
    clientSecret: Config.secret,
    userName: Config.userName,
    password: Config.password
};

let authenticator = new GfycatClient(apiConfig);
console.log('pre auth');

let watcher = new FileWatcher('C:\\Users\\cam11\\Videos\\Rocket League', (path) => {
    let stream = fs.createReadStream(path);
    authenticator.UploadVideo('NewAutoUpload', stream)
    .then(() => {
        console.log('Done');
    })
    .catch((reason) => {
        console.error(reason);
    });
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
