function get (key, token, cb) {
  let pocket = require('pocket-sdk')
  pocket.init(key)
  pocket.get({
    access_token: token,
  }, cb)
}

module.exports = get
