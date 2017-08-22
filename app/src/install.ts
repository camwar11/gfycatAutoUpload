var Service = require('node-windows').Service;
import * as path from 'path';

// Create a new service object
var svc = new Service({
  name: 'Gfycat Uploader',
  description: 'Automatically uploads videos to Gfycat.com',
  script: path.join(__dirname, 'index.js')
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function(){
  svc.start();
});

svc.install();
