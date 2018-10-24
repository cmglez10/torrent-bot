"use strict"

/**
 * Created by highfredo on 25/10/2016.
 */


const _ = require('lodash')
const qualities = require('./qualities')
const rp = require('request-promise')


module.exports = {
  attrStringToMap,
  stringToSeasonAndEpisode,
  stringToQuality,
  cleanTitle,
  decodeTorrent
}

function attrStringToMap(str) {
  let separator = /(\||\n)/
  var attrs = {}
  var rawAttrs = str.split(separator)

  rawAttrs.forEach((rawAttr) => {
    let separator = ':'
    rawAttr = rawAttr.split(separator)
    let name = _.camelCase(_.deburr(rawAttr[0]))
    if (rawAttr[1]) {
      rawAttr.shift()
      attrs[name] = rawAttr.join(separator).trim()
    }
  })

  return attrs
}

function stringToSeasonAndEpisode(title) {
  var season, episode

  var seasonEpisode = title.match(/\d+x\d+/)
  if (seasonEpisode) {
    let result = seasonEpisode[0].toLowerCase().split('x')
    season = result[0]
    episode = result[1]
  }

  if (!seasonEpisode) {
    seasonEpisode = title.match(/s\d+e\d+/i)
    if (!seasonEpisode)
      return
    let result = seasonEpisode[0].toLowerCase().split(/(s|e)/i)
    season = result[2]
    episode = result[4]
  }

  return {
    season: Number(season),
    episode: Number(episode),
  }
}

function stringToQuality(str) {

  var toTest = str.replace(/-/g, "")

  var quality;
  _.forOwn(qualities, (value) => {
    if (new RegExp(value, 'i').test(toTest)) {
      quality = value
      return false
    }
  })

  if (!quality)
    quality = qualities.OTHER

  return quality
}

function cleanTitle(title) {
  var str = title

  var i = str.lastIndexOf('(');
  if (i != -1) {
    str = str.substr(0, i)
  }

  i = str.lastIndexOf('-');
  if (i != -1) {
    str = str.substr(0, i).trim()
  }

  return str.trim()
}

function decodeTorrent(torrentURL) {
  console.log('decodeTorrent');

  let options = {
    method: 'GET',
    uri: torrentURL,
    resolveWithFullResponse: true,
    encoding: 'base64'
  }
  console.log('options: ');
  console.log(options);

  return rp(options)
    .then((page) => {

      console.log("Torrent got from tracker")
      console.log(page.body)

      return page.body
    })
    .catch((err) => {
      console.log("Error getting torrent from tracker: " + JSON.stringify(err))
    })
}