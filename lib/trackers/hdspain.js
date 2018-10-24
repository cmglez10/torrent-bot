"use strict"

const  rp = require('request-promise'),
  utils = require('./utils'),
  tough = require('tough-cookie');
const $ = require('cheerio');

const columns = {
  title: 3,
  download: 7,
  size: 13,
  date: 15
}
const BASE_URL = 'https://www.hd-spain.com/'

class HDSpainTracker {
  constructor(config) {
    this.url = config.url
    this.cookies = config.cookies;
  }

  /*
    Debemos hacer scrapping de la propia página de resultados del tracker ya que no tiene RSS
    @return: objeto con la lista de elementos de la primera página de resultados del tracker sin filtrar
  */
  latest() {
    var cookiejar = rp.jar();

    this.cookies.forEach(cookieConfig => {
      let cookie = new tough.Cookie({
        key: cookieConfig.name,
        value: cookieConfig.value,
        domain: 'www.hd-spain.com',
        expires: new Date('2039-01-20')
      });
      cookiejar.setCookie(cookie, 'https://www.hd-spain.com');
    });

    var options = {
      uri: this.url,
      jar: cookiejar // Tells rp to include cookies in jar that match uri
    };

    return rp(options)
      .then(function (body) {
        const torrentsInfo = [];
        const tabletorrentsCheerio = $('table#listado > tbody > tr', body);
        const length = tabletorrentsCheerio.length;
        for (let i = 1; i < length; i++) {
          // Title column
          const titleTD = tabletorrentsCheerio[i].children[columns.title].children;
          const titleLink = titleTD.find((element) => {
            return element.type == 'tag' && element.name == 'a' && element.attribs.id && element.attribs.id.substr(0, 3) == 'tit';
          })
          const torrentId = titleLink.attribs.id.substr(3)
          const torrentTitle = titleLink.children[0].data;
          const torrentUrl = BASE_URL + titleLink.attribs.href;

          // Download Column
          const downloadTD = tabletorrentsCheerio[i].children[columns.download];
          const torrentLink = BASE_URL + downloadTD.children[0].attribs.href;

          // Date Column
          const dateTD = tabletorrentsCheerio[i].children[columns.date];
          const torrentDate = new Date(dateTD.attribs.title);

          var seasonEpisode = utils.stringToSeasonAndEpisode(torrentTitle) || {}
          const info = {
            tracker: 'HD-Spain',
            id: torrentId,
            title: utils.cleanTitle(torrentTitle),
            titleAll: torrentTitle,
            url: torrentUrl,
            link: torrentLink,
            date: torrentDate,
            season: seasonEpisode.season,
            episode: seasonEpisode.episode
          }
          torrentsInfo.push(info)
        }
        return torrentsInfo;
      })
      .catch(function (err) {
        console.error(err);
      });
  }
}

module.exports = function (config) {
  return new HDSpainTracker(config)
}

