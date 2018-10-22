var config = require('./config')
var Promise = require('bluebird')
global.Promise = Promise

Promise.config({
    cancellation: true
  });
  
var gateway = require('./lib/gateways/' + config.gateway.type)(config.gateway)
var seedbox = require('./lib/seedboxs/' + config.seedbox.type)(config.seedbox, gateway)
var tracker = require('./lib/trackers/' + config.tracker.type)(config.tracker, gateway)
var info    = require('./lib/info/' + config.info.type)(config.info)

var filterUtils = require('./lib/filters/utils')
const filters = filterUtils.parseFilters(config.filters)

var types = require('./lib/types')
var _ = require('lodash')
global._ = _
global.types = types


// Movidas de mongoose
var mongoose = require('mongoose');
global.mongoose = mongoose;

mongoose.connect('mongodb://'+config.database.user+':'+config.database.password+'@'+config.database.uri, { useNewUrlParser: true })
    .then((db) => {
        console.log("Connection established with MongoDB");
    })
    .catch (() => {
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

var lastUpdate;
function sendNewTorrents() {
   console.log(new Date().toISOString()+" - BUSCANDO NUEVOS TORRENTS")
   tracker
      .latest()
      .then(result => {
         //filtro para quedarme sólo con los posteriores a la fecha de ultima actualización
         result = _.filter(result, i => !(lastUpdate && i.date < lastUpdate))

         //Buscamos los filtros de hdcity para pasarlos a la función que aplica filtros
         Filter.find({tracker: "hdcity"}, function (err, filters){
            // console.log(JSON.stringify(filters))
            result = applyFilters(result, filters)
            // console.log("resultado filtrado:")
            // console.log(result)
            result = _.sortBy(result, ['date'])

            Promise
               .all(_.map(result, o => info.fill(o)))
               .then(()=>{
                  Promise.each(result, function(info){
                     console.log(info.title)
                     return gateway.sendTorrentInfo(info)
                  })
               })
            lastUpdate = new Date()
         })
      })
}

/*
   Devuelve sólo aquellos registros de infoArray que pasan algún filtro de filters
 */
function applyFilters(infoArray, filters) {
    return _.filter(infoArray, function (info) {
        var title = cleanTermToSearch(info.titleAll)
        var res = false

        //Miramos a ver si coincide con alguno de los filtros
        filters.forEach((filter) => {
            var partialres = true

            //Debe coincidir con todos los términos del filtro
            filter.terms.forEach((term) => {
                var clenanedterm = cleanTermToSearch(term)
                if (!_.includes(title, clenanedterm)) partialres = false
            })
            if (partialres){
               res = true
               info.titleSearch = filter.name;
               info.path = filter.path;
               info.image = filter.image;
            }
        })
        return res
    })
}

function cleanTermToSearch(term){
   var unescapeterm = unescape(term)
    return unescapeterm.toLowerCase()
}



gateway.onRequestAddTorrent(function (msg, path) {
   tracker.decodeTorrent(msg)
      .then((torrent) => {
         console.log("Added: " + msg)
         return seedbox.addTorrent(torrent, path)
      })
   }
)
