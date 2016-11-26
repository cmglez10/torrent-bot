"use strict"

var FeedParser = require('feedparser'),
   request = require('request'),
   rp = require('request-promise'),
   types = require('../types'),
   utils = require('../utils'),
   hdcityutils = require('./hdcity-utils')

class HdcityTracker {
   constructor(config) {
      this.url = config.url

      console.log("Tracker: HDCity")
   }

   latest() {
      var req = request(this.url),
         feedparser = new FeedParser({addmeta: false})

      return new Promise((resolve, reject)=> {
         req.on('error', reject)
         feedparser.on('error', reject)
         var result = []

         req.on('response', function (res) {
            var stream = this;
            if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
            stream.pipe(feedparser);
         })

         feedparser.on('data', function (data) {
             // console.log(data)

            //var id = data.link.match(/torrent\/([^)]+)\//)[1]
            // var attrs = utils.attrStringToMap(data.description)
            // var seasonEpisode = utils.stringToSeasonAndEpisode(data.title) || {}
            var info = {
               id: hdcityutils.getIdFromUrl(data.link),
               title: hdcityutils.cleanTitle(data.title),
               link: data['rss:enclosure']['@'].url,
               date: data.pubDate,
               type: types.SHOW
            }
            // console.log(JSON.stringify(info,null,2))
            result.push(info)

            // console.log("\n\n------------------------------------------------\n\n")
         })

         feedparser.on('end', () => resolve(result));
      })
   }

}

module.exports = function (config) {
   return new HdcityTracker(config)
}

