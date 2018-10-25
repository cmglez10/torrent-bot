"use strict"

/**
 * Created by cmglez10 on 26/11/2016.
 */


const _ = require('lodash')
const qualities = require('./qualities')
const config = require('../../config')
const tough = require('tough-cookie');
const rp = require('request-promise')

module.exports = {
   attrStringToMap,
   stringToSeasonAndEpisode,
   // stringToQuality,º
   cleanTitle,
   getIdFromUrl,
   addCookies
}

/*
Returns torrent Id from torrent Url (not download url)
 */
function getIdFromUrl(url){
   return url.split("=").pop()
}

function attrStringToMap(str) {
   let separator = /(\||\n)/
   var attrs = {}
   var rawAttrs = str.split(separator)

   rawAttrs.forEach((rawAttr)=>{
      let separator = ':'
      rawAttr = rawAttr.split(separator)
      let name = _.camelCase(_.deburr(rawAttr[0]))
      if(rawAttr[1]) {
         rawAttr.shift()
         attrs[name] = rawAttr.join(separator).trim()
      }
   })

   return attrs
}

function stringToSeasonAndEpisode(title) {
   var season, episode

   var seasonEpisode = title.match(/\d+x\d+/)
   if(seasonEpisode) {
      let result = seasonEpisode[0].toLowerCase().split('x')
      season = result[0]
      episode = result[1]
   }

   if(!seasonEpisode) {
      seasonEpisode = title.match(/s\d+e\d+/i)
      if(!seasonEpisode)
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
   _.forOwn(qualities, (value)=>{
      if(new RegExp(value, 'i').test(toTest)) {
         quality = value
         return false
      }
   })

   if(!quality)
      quality = qualities.OTHER

   return quality
}

function cleanTitle(title) {
   try {
      var str = title

      //Elimino lo que está entre corchetes

      var i = str.indexOf('[');
      var j = str.indexOf(']');

      while (i != -1 && j != -1) {
         str = str.substr(0, i) + str.substr(j + 1)
         var i = str.indexOf('[');
         var j = str.indexOf(']');

      }

      return unescapeHTML(str.trim())
   } catch (err) {
      return title
   }
}

function unescapeHTML(term){
   term = term.replace("&aacute;","á").replace("&eacute;","é").replace("&iacute;","í").replace("&oacute;","ó")
      .replace("&uacute;","ú").replace("&Aacute;","Á").replace("&Eacute;","É").replace("&Iacute;","Í")
      .replace("&Oacute;","Ó").replace("&Uacute;","Ú").replace("&ntilde;","ñ").replace("&Ntilde;","n");
   return term;
}

function addCookies(tracker = 'hdspain') {
    var cookiejar = rp.jar();

    const trackerConf = config.trackers.find((t) => {
        return t.name == tracker;
    });

    trackerConf.cookies.forEach(cookieConfig => {
      let cookie = new tough.Cookie({
        key: cookieConfig.name,
        value: cookieConfig.value,
        domain: 'www.hd-spain.com',
        expires: new Date('2039-01-20')
      });
      cookiejar.setCookie(cookie, 'https://www.hd-spain.com');
    });
    return cookiejar;
}
