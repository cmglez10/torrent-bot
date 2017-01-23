var config = require('./config')
var Promise = require('bluebird')
global.Promise = Promise

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

mongoose.connect('mongodb://'+config.database.user+':'+config.database.password+'@'+config.database.uri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
   console.log("Connection established with MongoDB");
});

//-- Schemas
var filterSchema = mongoose.Schema({
   name: String,
   type: String,
   tracker: String,
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
         result = _.filter(result, i => !(lastUpdate && i.date < lastUpdate))

         Filter.find({tracker: "hdcity"}, function (err, filters){
            console.log(JSON.stringify(filters))
            result = applyFilters(result, filters)
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
            if (partialres) res = true
        })
        return res
    })
}

function cleanTermToSearch(term){
    return term.toLowerCase()
}

gateway.onRequestAddTorrent(function (msg) {
   tracker.decodeTorrent(msg)
      .then((torrent) => {
         // console.log("Added: " + msg)
         return seedbox.addTorrent(torrent)
      })
   }
)
