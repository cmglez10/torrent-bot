/*******
 rename to config.js
 *******/

var generateFilter = require('./lib/filters/byValue')
var types = require('./lib/types')
var qualities = require('./lib/qualities')

module.exports =
{
   database: {
      uri: '<URL>:<PORT>/<DATABASE>',
      user: '<USER>',
      password: '<PASSWORD>'
   },
   refreshInterval: 60 * 60 * 1000, // En milisegundos
   seedbox: {
      type: 'transmission',
      user: "<transmission user>",
      pass: "<transmission pass>",
      rpc: "http://<transmission host>:<transmission port>/transmission/rpc"
   },
   tracker: {
      type: 'hdcity',
      url: "<tracker rss url>"
   },
   gateway: {
      type: 'telegram',
      token: '<telegram token>',
      userId: 0 // <telegram userId>
   },
    // TViso API is not working
   /*info: {
      type: 'tviso',
      idapi: '<tviso idAPI>',
      secret: '<tviso secret>'
   }*/
   info: {
      type: 'trakt-tv'
   }
}
