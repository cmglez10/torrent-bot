"use strict"

const FeedParser = require('feedparser'),
  request = require('request'),
  trackerUtils = require('./utils');

class HDSpaceTracker {
  constructor(config) {
    this.url = config.url
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
        console.log(data)
        var seasonEpisode = trackerUtils.stringToSeasonAndEpisode(data.title) || {}
        var info = {
          tracker: 'HD Space',
          id: trackerUtils.getIdFromUrl(data.link),
          title: trackerUtils.cleanTitle(data.title),
          titleAll: data.title,
          link: data.enclosures[0].url,
          url: data.link,
          date: new Date(data.pubDate),
          season: seasonEpisode.season,
          episode: seasonEpisode.episode
        }
        result.push(info)
      })

      feedparser.on('end', () => resolve(result));
    })
  }
}

module.exports = function (config) {
  return new HDSpaceTracker(config)
}

