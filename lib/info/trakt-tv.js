"use strict"

var rp = require('request-promise')

class TrakTV {
   constructor(clientId, clientSecret) {
      this.clientId = clientId
      this.clientSecret = clientSecret
      this.url = 'https://api.trakt.tv'
   }

   _get(path, qs) {
      return rp({
         method: 'GET',
         url: this.url + path,
         qs: qs,
         json: true,
         headers: {
            'trakt-api-version': '2',
            'trakt-api-key': this.clientId
         }
      })
   }

   _movieDescription(info) {

      return this
         ._get('/search/movie', {
            query: info.title,
            fields: 'title'
         })
         .then((movies) => {
            if(!movies.length)
               throw new Error("No movie found")

            movies = _.map(movies, (hit) => {
               return hit.movie;
            })

            var movie
            if(movies.length > 1 && info.year) {
               movie = _.find(movies, function(movie) {
                  return movie.year == info.year
               })
            } else {
               movie = movies[0]
            }

            if(!movie) {
               return ""
            }

            return this._get(`/movies/${movie.ids.slug}/translations/es`)
               .then(results => {
                  var hit = _.find(results, result => !!result.overview)
                  return hit ? hit.overview : ""
               })
         })

   }

    _fillShow(info) {
        return this
            ._get('/search/show', {
                query: info.titleSearch
            })
            .then((shows) => {
                // console.log(info.titleSearch)
                // console.log(JSON.stringify(shows,null,2))
                if(!shows.length)
                    throw new Error("No show found")

                let show
                if(shows.length > 1 ) {
                    show = shows[0]
                    // console.log(JSON.stringify(show,null,2))
                }

                if(!show) {
                    return ""
                }

                let tvdbId= show.tvdb
                


            })
    }

    fill(info) {
      let action;

      if(info.type === types.SHOW) {
        // console.log(info.title)
          this._fillShow(info)
      } else {
         return
      }

   }
}


module.exports = function (config) {
   return new TrakTV(config.clientId, config.clientSecret)
}
