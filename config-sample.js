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
    trackers: [{
      name: 'hdcity',
      url: '<tracker rss url>'
    }, {
      name: 'hachede',
      url: '<tracker rss url>'
    }, {
      name: 'hdspain',
      url: 'https://www.hd-spain.com/index.php?sec=listado',
      cookies: [{
        name: 'loggnA',
        value: '<cookie_value>'
      },{
        name: 'loggnB',
        value: '<cookie_value>'
      },{
        name: 'lognnI',
        value: '<cookie_value>'
      },{
        name: 'navpreferences',
        value: '<cookie_value>'
      }]
    }],
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
      clientId: '<trakt-tv clientId>',
      clientSecret: '<trakt-tv clientSecret>'
    }
  }
