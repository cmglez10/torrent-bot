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
      type: 'trakt-tv',
      clientId: '5d019829b09612b23b4dbe5ab5026f4d81f37638363637541d7fd3bc64b750e0',
      clientSecret: '2d938ed974d1fe32c9b80fe6a1b34969062c7d8891a3d3f6f3be658b1eb190cd'
   }
}
