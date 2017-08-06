"use strict"

var rp = require('request-promise')

class Tviso {

   constructor(idapi, secret) {
      this.uri = "https://api.tviso.com";
      this.idapi = idapi;
      this.secret = secret;
      this.token = '';
      this.login();
   }


   /*
    Login in Tviso API first time, while node starts
    */
   login() {
      var opts = {
         method: 'GET',
         uri: this.uri + '/auth_token?id_api=' + this.idapi + '&secret=' + this.secret,
         json: true
      }
      return rp(opts)
         .then((data) => {
             console.log("TVISO login. result: " + JSON.stringify(data,null,2))

             this.token = data.auth_token;
            console.log("TVISO API connected. Token: " + this.token)
            return this.token;
         })
         .catch((err) => {
            console.log("Error while logining to tviso")
            console.log(JSON.stringify(err))
         })
   }

   _request(uri, params, body) {
      console.log("auth_token: "+this.token)
      var options = {
         method: 'GET',
         uri: this.uri + uri,
         json: body || true,
         qs : {
            auth_token : this.token
         },
         headers: {
            "content-type": "application/json",
            Accept: "application/json",
            Authorization: this.token,
            "Accept-Language" : "es"
         }
      };

      var request = _.merge(options, params || {})
      // console.log(request)
      return rp(request)
         .then(function (response) {
            return response;
         })
         .catch((err) => {
            console.log("Error while fetching request to tviso")
            console.log(JSON.stringify(err))
         })


   }


   findSeries(search) {
      var params = {
         qs : {
            q : search
         }
      }
      return this._request('/v2/media/search',params)
   }

   getSerieBasic(tvisoId) {
      var params = {
         qs : {
            idm : tvisoId,
            mediaType : 1 //Es una serie
         }
      }
      return this._request('/v2/media/basic_info',params)
   }

   getSerieFull(tvisoId) {
      var params = {
         qs : {
            idm : tvisoId,
            mediaType : 1 //Es una serie
         }
      }
      return this._request('/v2/media/full_info',params)
   }

   getEpisodeFull(tvisoId) {
      var params = {
         qs : {
            idm : tvisoId,
            mediaType : 5 //Es un episodio
         }
      }
      return this._request('/v2/media/full_info',params)
   }

   getSerieByImdb(imdbId) {
      var params = {
         qs : {
            imdb : imdbId
         }
      }
      return this._request('/v2/media/find/external',params)
   }


   _fillShow(info) {
      // console.log("TViso _fillShow: " + JSON.stringify(info, null, 2))
      return this.findSeries(info.titleSearch)
         .then((results) => {
             console.log("TViso _fillShow result: " + JSON.stringify(results, null, 2))

             if (results.results.length){
               info.image = results.results[0].artwork.posters.small;
            }
            return info;
         })


   }


   fill(info) {
      if(info.type === types.MOVIE) {
         return
      } else  if(info.type === types.SHOW){
         return this._fillShow(info);
      }

   }
}


module.exports = function (config) {
   return new Tviso(config.idapi, config.secret)
}
