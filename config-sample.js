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
      user: 'cmglez10',
      password: 'karate24'
   },
   refreshInterval: 60 * 60 * 1000, // En milisegundos
   seedbox: {
      type: 'transmission',
      user: "<transmission user>",
      pass: "<transmission pass>",
      rpc: "http://<transmission host>:<transmission port>/transmission/rpc"
   },
   tracker: {
      type: 'elitetorrent',
      url: "<tracker rss url>"
   },
   gateway: {
      type: 'telegram',
      token: '<telegram token>',
      userId: 0 // <telegram userId>
   },
   info: {
      type: 'trakt-tv',
      clientId: '<trakt.tv API clientId>',
      clientSecret: '<trakt.tv API clientSecret>'
   }
}
