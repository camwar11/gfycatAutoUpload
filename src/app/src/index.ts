import {GfycatClientSettings} from '../../settingsHandler';
import * as fs from 'fs';
import { Config } from '../../../config';
import { ApiConfig, GfycatClient } from './GfycatClient';
import { FileWatcher } from './FileWatcher';

export class Wrapper {

    private static _watchers = new Array<FileWatcher>();

    private _apiConfig: ApiConfig;
    constructor(public _settings: GfycatClientSettings) {
        if (_settings === undefined) {
            _settings = {
                userName: Config.userName,
                password: () => Promise.resolve(''),
                paths: []
            };
        }
        this._apiConfig = {
            clientId: Config.id,
            clientSecret: Config.secret,
            userName: _settings.userName,
            password: _settings.password
        };
    }

    public updateSettings(settings: GfycatClientSettings) {
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
        this.shutdown();
        this.start();
    }

    public shutdown() {
        let watcher = Wrapper._watchers.pop();

        while (watcher !== undefined) {
            watcher.dispose();
            watcher = Wrapper._watchers.pop();
        }
    }

    public start(): void {
        let authenticator = new GfycatClient(this._apiConfig);
        console.log('pre auth');

        if (this._settings === undefined || this._settings.paths === undefined) {
            return;
        }

        this._settings.paths.forEach((watchPath) => {
            let watcher = new FileWatcher(watchPath, (path) => {
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
        });
    }
}

