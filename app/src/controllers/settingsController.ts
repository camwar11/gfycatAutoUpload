import { wrapper } from '../server';
import { RequestHandler } from 'express';
import * as storage from 'node-persist';

export class Settings {
    userName: string;
    password: string;
    path: string;
}

export class SettingsController {
    create_get: RequestHandler = function(req, response, next) {
        let settings: Settings = wrapper._settings;
        response.render('settings_form', { title: 'User Settings', settings: settings });
    };

    create_post: RequestHandler = function(req, res, next) {

        //Create a genre object with escaped and trimmed data.
        let settings = new Settings();
        settings.userName = req.body.userName;
        settings.password = req.body.password;
        settings.path = req.body.path;

        if (settings.userName === undefined || settings.userName === '' || settings.password === undefined || settings.password === ''
            || settings.path === undefined || settings.path === '') {
            res.render('settings_form', {title: 'User Settings', errors: [{msg: 'Either name, password, or path was not specified.'}] });
            return;
        }

        storage.setItemSync('settings', settings);
        wrapper.updateSettings(settings);

        res.render('settings_form', {title: 'Success', errors: [{msg: 'Success'}] });
    };
}
