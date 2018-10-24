var TelegramBot = require('node-telegram-bot-api');
var templater = require('../templater')

module.exports = function (config) {
  var telegramBot = new TelegramBot(config.token, { polling: true })
  var _onRequestAddTorrent = function () { }

  var service = {
    sendTorrentInfo: function (data) {
      return this.sendPhoto(config.userId, data.image)
        .then(() => {
          return telegramBot.sendMessage(config.userId, templater.build(data.type, data),
            {
              parse_mode: 'HTML',
            })
        })
        .then(() => {
          return telegramBot.sendMessage(config.userId, "<a href='" + data.link + "'>Descargar torrent</a>",
            {
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [{ text: "Añadir al Transmission", callback_data: ((data.path) ? data.path : ".") }]
                ]
              }
            })
        })
    },
    sendPhoto: function (userId, photo) {
      if (!photo) {
        photo = 'http://www.filmaffinity.com/imgs/movies/noimgfull.jpg'
      }
      return telegramBot.sendPhoto(userId, photo)
    },
    onRequestAddTorrent: function (cb) {
      _onRequestAddTorrent = cb
    },
    sendMessage: function (txt, options) {
      return telegramBot.sendMessage(config.userId, txt, options)
    }
  }


  // This event is triggered when a button is pressed in telegram bots
  telegramBot.on('callback_query', function (msg) {
    console.log('on callback_query');
    if (!msg.data || msg.from.id !== config.userId) return
    // console.log('callback msg: ' + JSON.stringify(msg, null, 2))
    var data = (msg.data != ".") ? msg.data : undefined;
    // console.log(msg.message.entities[0].url);
    _onRequestAddTorrent(msg.message.entities[0].url, data);
  });

  telegramBot.on('message', function(msg){
      console.log(JSON.stringify(msg))
  });

  telegramBot.on('polling_error', (error) => {
    console.log('polling_error' + JSON.stringify(error));  // => 'EFATAL'
  });

  return service
}


// c7a0cfda278729a57771984bb9afbbadfd42a485