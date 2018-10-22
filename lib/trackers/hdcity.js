"use strict"

var FeedParser = require('feedparser'),
  request = require('request'),
  rp = require('request-promise'),
  types = require('../types'),
  hdcityutils = require('./hdcity-utils'),
  fs = require('fs');

class HdcityTracker {
  constructor(config) {
    this.url = config.url
    console.log("Tracker: HDCity")
  }

  /*
  Recogemos el archivo xml del RSS del tracker
  @return: objeto con la lista de elementos del RSS sin filtrar
   */
  latest() {
    var req = request(this.url);
    var feedparser = new FeedParser({ addmeta: false });
    console.log('RSS URL: ' + this.url);
    return new Promise((resolve, reject) => {
      req.on('error', reject)
      feedparser.on('error', reject)
      var result = []
      req.on('response', function (res) {
        // console.log('ok')
        var stream = this;
        if (res.statusCode != 200) {
          console.log(res)
          return this.emit('error', new Error('Bad status code'));
        }
        stream.pipe(feedparser);
      })

      feedparser.on('data', function (data) {
        //  console.log(data)
        var seasonEpisode = hdcityutils.stringToSeasonAndEpisode(data.title) || {}
        var info = {
          id: hdcityutils.getIdFromUrl(data.link),
          title: hdcityutils.cleanTitle(data.title),
          titleAll: data.title,
          url: data.link,
          link: data['rss:enclosure']['@'].url,
          date: data.pubDate,
          type: types.SHOW,
          season: seasonEpisode.season,
          episode: seasonEpisode.episode
        }
        result.push(info)
      })

      feedparser.on('end', () => resolve(result));
    })
  }

  decodeTorrent(torrentURL) {
    // console.log(torrentURL)

    let options = {
      method: 'GET',
      uri: torrentURL,
      resolveWithFullResponse: true,
      encoding: 'base64'
    }
    return rp(options)
      .then((page) => {
        // console.log(page.body)

        return page.body
      })
      .catch((err) => {
        console.log(err)
      })
  }
}

module.exports = function (config) {
  return new HdcityTracker(config)
}

