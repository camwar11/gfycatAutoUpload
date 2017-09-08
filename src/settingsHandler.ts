import { ipcMain } from 'electron';
import * as keyTar from 'keytar';
import * as _ from 'lodash';

export const SETTINGS_CHANGED = 'settings-changed';
export const GET_USERNAME = 'get-username';

export interface GfycatClientSettingsFromRender extends SettingsBase {
    password: string;
}

interface SettingsBase {
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
    private _settings: GfycatClientSettings;
    private _listeners: Array<(GfycatClientSettings) => void>;

    constructor() {
        this._listeners = new Array<(GfycatClientSettings) => void>();
        let self = this;

        ipcMain.on(SETTINGS_CHANGED, (event: IpcEvent, arg: GfycatClientSettingsFromRender) => {
            console.log('settings changed');
            keyTar.setPassword(self.SERVICE_NAME, arg.userName, arg.password);
            self._settings = { ...arg, password: self.getPassword};
            // self._listeners.forEach((val) => {
            //     val(self._settings);
            // });
        });

        ipcMain.on(GET_USERNAME, (event: IpcEvent, arg: any) => {
            event.returnValue = this._settings ? this._settings.userName : '';
        });
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

    subscribeToSettingsChanged(listener: (GfycatClientSettings) => void) {
        this._listeners.push(listener);
    }

    unsubscribeToSettingsChanged(listener: (GfycatClientSettings) => void) {
        _.remove(this._listeners, (item) => {
            return item === listener;
        });
    }

    removeAllListeners() {
        this._listeners = new Array<(GfycatClientSettings) => void>();
    }
}
