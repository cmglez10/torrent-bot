var config = require('./config')
var Promise = require('bluebird')
global.Promise = Promise

Promise.config({
  cancellation: true
});

var gateway = require('./lib/gateways/' + config.gateway.type)(config.gateway)
var seedbox = require('./lib/seedboxs/' + config.seedbox.type)(config.seedbox, gateway)
var info = require('./lib/info/' + config.info.type)(config.info)
var utils = require('./lib/utils');
var trackers = [];
config.trackers.forEach((trackerConfig) => {
  const trackerCode = require('./lib/trackers/' + trackerConfig.name)(trackerConfig, gateway);
  trackers.push({
    name: trackerConfig.name,
    code: trackerCode,
    lastUpdate: undefined
  });
});

var filterUtils = require('./lib/filters/utils')
const filters = filterUtils.parseFilters(config.filters)

var types = require('./lib/types')
var _ = require('lodash')
global._ = _
global.types = types


// Movidas de mongoose
var mongoose = require('mongoose');
global.mongoose = mongoose;
// mongoose.set('debug', true);

mongoose.connect('mongodb://' + config.database.user + ':' + config.database.password + '@' + config.database.uri, { useNewUrlParser: true })
  .then((db) => {
    console.log("Connection established with MongoDB");
  })
  .catch(() => {
    console.error.bind(console, 'connection error:')
  });

//-- Schemas
var filterSchema = mongoose.Schema({
  name: String,
  type: String,
  tracker: String,
  path: String,
  image: String,
  terms: [String]
});

var Filter = mongoose.model('Filter', filterSchema, 'Filter');
global.Filter = Filter;

//Filter.create({type:"cesar"});
//-- Fin Schemas
// -- FIN Mongoose

sendNewTorrents()
setInterval(sendNewTorrents, config.refreshInterval)

function sendNewTorrents() {
  console.log(new Date().toString() + " - BUSCANDO NUEVOS TORRENTS")
  trackers.forEach((tracker) => {
    tracker.code
      .latest()
      .then(result => {
        //filtro para quedarme sólo con los posteriores a la fecha de ultima actualización
        result = _.filter(result, i => !(tracker.lastUpdate && i.date < lastUpdate))

        //Buscamos los filtros de hdcity para pasarlos a la función que aplica filtros
        Filter.find().or([{ tracker: tracker.name }, { tracker: '*' }])
          .then(filters => {
            // console.log(JSON.stringify(filters))
            result = utils.applyFilters(result, filters)
            // console.log("resultado filtrado:")
            // console.log(result)
            result = _.sortBy(result, ['date'])

            Promise
              .all(_.map(result, o => info.fill(o)))
              .then(() => {
                Promise.each(result, function (info) {
                  console.log(info.title)
                  return gateway.sendTorrentInfo(info)
                })
              })
              tracker.lastUpdate = new Date();
          })
          .catch(err => {
            console.log("Error find: " + err);
          })
      })
  })
}

gateway.onRequestAddTorrent(function (msg, path) {
  // console.log('onRequestAddTorrent: ' + msg);
  utils.decodeTorrent(msg)
    .then((torrent) => {
      console.log("Added: " + msg)
      return seedbox.addTorrent(torrent, path)
    })
}
)
