"use strict"

var rp = require('request-promise')

class TransmissionFetch {
   constructor(username, pass, rpc, gateway) {
      this.rpc = rpc;
      this.auth = new Buffer(username + ':' + pass).toString('base64') //btoa(username + ':' + pass);
      this.key = false;
      this.gateway = gateway
   }

   _fetch(data) {
      var headers = {};
      headers.authorization = 'Basic ' + this.auth;
      if (this.key) {
         headers['x-transmission-session-id'] = this.key;
      }

      let options = {
          method: 'POST',
          uri: this.rpc,
          headers: headers,
          json: data
      }
      // console.log(JSON.stringify(options,null,2))
      return rp(options).catch((err) => {
         if (err.statusCode === 409) {
            this.key = err.response.headers['x-transmission-session-id'];
            return this._fetch(data);
         }
         else{
            console.log(JSON.stringify(err))
         }

         throw err;
      })
   }

   addMagnet(magnetLink) {
      var data = {
         "method": "torrent-add",
         "arguments": {
            "paused": false,
            "filename": magnetLink
         }
      };
      return this._fetch(data)
          .then(()=>{
             this.gateway.sendMessage("Torrent añadido")
          })
   }

   addTorrent(torrent) {
      // console.log(torrent)
      var data = {
         "method": "torrent-add",
         "arguments": {
            "paused": false,
            "metainfo": torrent
         }
      };
      return this._fetch(data)
          .then((response)=>{
              console.log("Response Transimission")
              console.log(JSON.stringify(response,null,2))
             this.gateway.sendMessage("Torrent añadido")
          })
          .catch((err) => {
             console.log(err)
             throw (err)
          })
   }
}

module.exports = function (params, gateway) {
   return new TransmissionFetch(params.user, params.pass, params.rpc, gateway)
}
