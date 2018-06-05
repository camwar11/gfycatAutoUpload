import {GfycatClientSettings} from '../../settingsHandler';
import * as fs from 'fs';
import { Config } from '../../../config';
import { ApiConfig, GfycatClient } from './gfycatClient';
import { FileWatcher } from './fileWatcher';
import * as path from 'path';
import { ISimpleEvent, SimpleEventDispatcher } from 'strongly-typed-events';

export interface VideoEvent {
    title: string;
    message: string;
}

export class GfycatClientWrapper {

    private _watchers = new Array<FileWatcher>();
    private _apiConfig: ApiConfig;
    private _newVideoHandler: SimpleEventDispatcher<VideoEvent>;
    private _uploadedVideoHandler: SimpleEventDispatcher<VideoEvent>;

    constructor(public _settings: GfycatClientSettings) {
        if (_settings === undefined) {
            _settings = {
                userName: '',
                password: () => Promise.resolve(''),
                apiId: '',
                apiSecret: () => Promise.resolve(''),
                paths: []
            };
        }
        this._apiConfig = {
            userName: _settings.userName,
            password: _settings.password,
            clientId: _settings.apiId,
            clientSecret: _settings.apiSecret
        };

        this._newVideoHandler = new SimpleEventDispatcher();
        this._uploadedVideoHandler = new SimpleEventDispatcher();
    }

    public get onNewVideoFound(): ISimpleEvent<VideoEvent> {
        return this._newVideoHandler.asEvent();
    }

    public get onVideoUploaded(): ISimpleEvent<VideoEvent> {
        return this._uploadedVideoHandler.asEvent();
    }

    public updateSettings(settings: GfycatClientSettings) {
        this._settings = settings;
        this._apiConfig = {
            clientId: this._apiConfig.clientId,
            clientSecret: this._apiConfig.clientSecret,
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
        let watcher = this._watchers.pop();

        while (watcher !== undefined) {
            watcher.dispose();
            watcher = this._watchers.pop();
        }
    }

    public start(): void {
        console.log('start called');
        let authenticator = new GfycatClient(this._apiConfig);
        console.log('pre auth');

        if (this._settings === undefined || this._settings.paths === undefined) {
            return;
        }

        let self = this;

        this._settings.paths.forEach((watchPath) => {
            let watcher = new FileWatcher(watchPath, (filePath) => {
                self._newVideoHandler.dispatch({ title: 'Upload started', message: filePath});

                let stream = fs.createReadStream(filePath);

                authenticator.UploadVideo(path.basename(filePath, path.extname(filePath)), stream)
                .then((gfycatName) => {
                    self._newVideoHandler.dispatch({ title: 'Upload finished', message: `Encoding started for ${gfycatName}`});

                    authenticator.WaitOnUploadComplete(gfycatName)
                    .then((done) => {
                        if (done) {
                            self._newVideoHandler.dispatch({ title: 'Upload finished', message: `https://gfycat.com/${gfycatName}`});
                        }
                    });

                    console.log('Done');
                })
                .catch((reason) => {
                    console.error(reason);
                });
            });
            this._watchers.push(watcher);
        });
    }
}

