var config = require('./config')
var Promise = require('bluebird')
global.Promise = Promise
fs = require('fs');
request = require('request')
rp = require('request-promise')

var gateway = require('./lib/gateways/' + config.gateway.type)(config.gateway)
var seedbox = require('./lib/seedboxs/' + config.seedbox.type)(config.seedbox, gateway)
var tracker = require('./lib/trackers/' + config.tracker.type)(config.tracker, gateway)

let options = {
   method: 'GET',
   uri: "https://hdcity.li/download.php?id=4c86c1d6f044206da533f9d99d1ac270cc734578&f=The%20five%201x02%20BDRip%201080p%20%5BDual%2BSub%5D%5BHDTEAM%5D.torrent&auth=MjczYmJmYTdlZi05MjQ5MjQtNTZkMTA0NjVhNC00MjAyNDQ=",
   resolveWithFullResponse: true,
   encoding: 'ascii'
}

rp(options)
   .then((page)=> {

      let body = Buffer.from(page.body)
      let base64 = body.toString('base64')

      seedbox.addTorrent(base64)

   })
   .catch((err) => {
      console.log(err)
   })

//
// fs.readFile("",'ascii',function(err,data) {
//    fs.writeFile('file.txt', data, function (err) {
//       if (err) return console.log(err);
//       // console.log('Hello World > helloworld.txt');
//    });
//    let base64 = Buffer.from(data).toString('base64')
//    // console.log(base64)
//    // fs.writeFile('base64.txt', base64, function (err) {
//    //    if (err) return console.log(err);
//    //    // console.log('Hello World > helloworld.txt');
//    // });
//    seedbox.addTorrent(base64)
// });

