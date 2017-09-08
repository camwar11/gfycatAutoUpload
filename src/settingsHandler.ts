import { ipcMain } from 'electron';
import * as keyTar from 'keytar';

export const SETTINGS_CHANGED = 'settings-changed';
export const GET_USERNAME = 'get-username';

export interface GfycatClientSettings {
    userName: string;
    password: string;
}

interface IpcEvent {
    sender: {send: (channel: string, ...args: any[]) => void};
    returnValue: any;
}

export class SettingsHandler {
    private readonly SERVICE_NAME = 'GfycatAutoUploader';
    private _settings: GfycatClientSettings;

    constructor() {
        ipcMain.on(SETTINGS_CHANGED, (event: IpcEvent, arg: GfycatClientSettings) => {
            this._settings = arg;
            keyTar.setPassword(this.SERVICE_NAME, arg.userName, arg.password);
        });

        ipcMain.on(GET_USERNAME, (event: IpcEvent, arg: any) => {
            event.returnValue = this._settings ? this._settings.userName : '';
        });
    }

    getSettings(): Promise<GfycatClientSettings> {
        // We don't really want to keep the password around in memory forever
        // so just get it on demand.
        return this.getPassword()
            .then((value) => {
                return {...this._settings, password: value};
            });
    }

    getPassword(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!this._settings || !this._settings.userName) {
                reject('Username does not exist');
            }

            return keyTar.getPassword(this.SERVICE_NAME, this._settings.userName);
        });
    }
}
