import { Settings } from './controllers/settingsController';
import * as fs from 'fs';
import { Config } from '../../config';
import { ApiConfig, GfycatClient } from './GfycatClient';
import { FileWatcher } from './FileWatcher';
import * as storage from 'node-persist';

export class Wrapper {

    private static _watchers = new Array<FileWatcher>();

    private _apiConfig: ApiConfig;
    constructor(public _settings: Settings) {
        this._apiConfig = {
            clientId: Config.id,
            clientSecret: Config.secret,
            userName: this._settings.userName,
            password: this._settings.password
        };
    }

    public updateSettings(settings: Settings) {
        this._settings = settings;
        this._apiConfig = {
            clientId: Config.id,
            clientSecret: Config.secret,
            userName: this._settings.userName,
            password: this._settings.password
        };
        this.restart();
    }

    public restart() {
        let watcher = Wrapper._watchers.pop();

        while (watcher !== undefined) {
            watcher.dispose();
            watcher = Wrapper._watchers.pop();
        }

        this.start();
    }

    public start(): void {
        let authenticator = new GfycatClient(this._apiConfig);
        console.log('pre auth');

        let watcher = new FileWatcher(this._settings.path, (path) => {
            let stream = fs.createReadStream(path);
            authenticator.UploadVideo('NewAutoUpload', stream)
            .then(() => {
                console.log('Done');
            })
            .catch((reason) => {
                console.error(reason);
            });
        });

        Wrapper._watchers.push(watcher);
    }
}

