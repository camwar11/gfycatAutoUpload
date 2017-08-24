import * as express from 'express';
import { SettingsController } from '../controllers/settingsController';

var settingsRouter = express.Router();
let settingsController = new SettingsController();

/* GET users listing. */
settingsRouter.get('/', settingsController.create_get);
settingsRouter.post('/', settingsController.create_post);

export {settingsRouter};
