import { Settings } from './controllers/settingsController';
import { Wrapper } from './';
import * as express from 'express';
import * as path from 'path';
import * as favicon from 'serve-favicon';
import * as logger from 'morgan';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import {indexRouter} from './routes/index';
import {settingsRouter} from './routes/settings';
import * as storage from 'node-persist';

interface ExpressError extends Error {
  status?: number;
}

var app = express();

storage.initSync();
let settings: Settings = storage.getItemSync('settings');
export let wrapper: Wrapper = new Wrapper(settings);
wrapper.start();

// view engine setup
app.set('views', path.join(__dirname, '../../..', 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secretSecretsAreNoFun'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/settings', settingsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err: ExpressError = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(<express.ErrorRequestHandler> function (err: ExpressError, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;