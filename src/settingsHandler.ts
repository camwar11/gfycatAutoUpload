import { ipcMain } from 'electron';
import * as keyTar from 'keytar';
import * as _ from 'lodash';
import Store = require('electron-store');
import { SimpleEventDispatcher, ISimpleEventHandler } from 'strongly-typed-events';

export const SETTINGS_CHANGED = 'settings-changed';
export const GET_SETTINGS = 'get-settings';
export const RETURN_SETTINGS = 'return-settings';

export interface GfycatClientSettingsFromRender extends SettingsBase {
    password: string;
    apiSecret: string;
}

export interface SettingsBase {
    userName: string;
    apiId: string;
    paths: string[];
}

export interface GfycatClientSettings extends SettingsBase {
    password: () => Promise<string>;
    apiSecret: () => Promise<string>;
}

interface IpcEvent {
    sender: {send: (channel: string, ...args: any[]) => void};
    returnValue: any;
}

export class SettingsHandler {
    private readonly SERVICE_NAME = 'GfycatAutoUploader';
    private readonly SETTINGS = 'settings';

    private _settings: GfycatClientSettings;
    private _emitter: SimpleEventDispatcher<GfycatClientSettings>;

    private _store: Store;

    constructor() {
        this._emitter = new SimpleEventDispatcher<GfycatClientSettings>();
        this._store = new Store();

        const savedSettings = this.retrieveSavedSettings();

        if (savedSettings) {
            this._settings = { ...savedSettings, password: this.getPassword.bind(this), apiSecret: this.getAPISecret.bind(this)};
        }

        ipcMain.on(SETTINGS_CHANGED, (event: IpcEvent, arg: GfycatClientSettingsFromRender) => {
            console.log('settings changed');
            keyTar.setPassword(this.SERVICE_NAME, arg.userName, arg.password);
            keyTar.setPassword(this.SERVICE_NAME, arg.apiId, arg.apiSecret);
            this._store.set(this.SETTINGS, {userName: arg.userName, apiId: arg.apiId, paths: arg.paths});
            this._settings = { ...arg, password: this.getPassword.bind(this), apiSecret: this.getAPISecret.bind(this)};
            this._emitter.dispatch(this._settings);
        });

        let self = this;
        ipcMain.on(GET_SETTINGS, (event: IpcEvent, arg: any) => {
            this._settings.password().then((password) => {
                self._settings.apiSecret().then((secret) => {
                    let newSettings: GfycatClientSettingsFromRender = {...self._settings, password: password, apiSecret: secret};
                    event.sender.send(RETURN_SETTINGS, newSettings);
                });
            });
        });
    }

    private retrieveSavedSettings() {
        return this._store.get(this.SETTINGS) as SettingsBase;
    }

    getSettings(): GfycatClientSettings {
        return this._settings;
    }

    // We don't really want to keep the password around in memory forever
    // so just get it on demand.
    getPassword(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!this._settings || !this._settings.userName) {
                reject('Username does not exist');
            }

            keyTar.getPassword(this.SERVICE_NAME, this._settings.userName).then((value) => {
                resolve(value);
            })
            .catch((err) => {
                reject(err);
            });
        });
    }

    getAPISecret(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!this._settings || !this._settings.apiId) {
                reject('ApiId does not exist');
            }

            keyTar.getPassword(this.SERVICE_NAME, this._settings.apiId).then((value) => {
                resolve(value);
            })
            .catch((err) => {
                reject(err);
            });
        });
    }

    subscribeToSettingsChanged(listener: ISimpleEventHandler<GfycatClientSettings>) {
        this._emitter.sub(listener);
    }

    unsubscribeToSettingsChanged(listener: ISimpleEventHandler<GfycatClientSettings>) {
        this._emitter.unsub(listener);
    }

    removeAllListeners() {
        this._emitter.clear();
    }
}
