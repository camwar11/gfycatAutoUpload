import { ipcMain } from 'electron';
import * as keyTar from 'keytar';
import * as _ from 'lodash';
import Store = require('electron-store');

export const SETTINGS_CHANGED = 'settings-changed';
export const GET_SETTINGS = 'get-settings';

export interface GfycatClientSettingsFromRender extends SettingsBase {
    password: string;
}

export interface SettingsBase {
    userName: string;
    paths: string[];
}

export interface GfycatClientSettings extends SettingsBase {
    password: () => Promise<string>;
}

interface IpcEvent {
    sender: {send: (channel: string, ...args: any[]) => void};
    returnValue: any;
}

export class SettingsHandler {
    private readonly SERVICE_NAME = 'GfycatAutoUploader';
    private readonly SETTINGS = 'settings';

    private _settings: GfycatClientSettings;
    private _listeners: Array<(val: GfycatClientSettings) => void>;

    private _store: Store;

    constructor() {
        this._listeners = new Array<(val: GfycatClientSettings) => void>();
        this._store = new Store();

        let self = this;

        const savedSettings = this.retrieveSavedSettings();

        if (savedSettings) {
            this._settings = { ...savedSettings, password: this.getPassword };
        }

        ipcMain.on(SETTINGS_CHANGED, (event: IpcEvent, arg: GfycatClientSettingsFromRender) => {
            console.log('settings changed');
            keyTar.setPassword(self.SERVICE_NAME, arg.userName, arg.password);
            this._store.set(this.SETTINGS, {userName: arg.userName, paths: arg.paths});
            self._settings = { ...arg, password: self.getPassword};
            self._listeners.forEach((val) => {
                val(self._settings);
            });
        });

        ipcMain.on(GET_SETTINGS, (event: IpcEvent, arg: any) => {
            event.returnValue = this._settings ? {userName: this._settings.userName, paths: this._settings.paths} : null;
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

            return keyTar.getPassword(this.SERVICE_NAME, this._settings.userName);
        });
    }

    subscribeToSettingsChanged(listener: (val: GfycatClientSettings) => void) {
        this._listeners.push(listener);
    }

    unsubscribeToSettingsChanged(listener: (val: GfycatClientSettings) => void) {
        _.remove(this._listeners, (item) => {
            return item === listener;
        });
    }

    removeAllListeners() {
        this._listeners = new Array<(val: GfycatClientSettings) => void>();
    }
}
