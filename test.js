var config = require('./config')
var Promise = require('bluebird')
global.Promise = Promise
fs = require('fs');

var gateway = require('./lib/gateways/' + config.gateway.type)(config.gateway)
var seedbox = require('./lib/seedboxs/' + config.seedbox.type)(config.seedbox, gateway)
var tracker = require('./lib/trackers/' + config.tracker.type)(config.tracker, gateway)


fs.readFile("./Truman.torrent",'ascii',function(err,data) {
   let base64 = Buffer.from(data).toString('base64')
   seedbox.addTorrent(base64)
});

