let test = require('tape')
let search = require('..')
let keys = require('../../../keys.json')
let auth = {
  cx:keys.cx,
  key:keys['google-api-key'],
}

test('returns images', t => {
  search('lecture', auth, function (err, resp) {
    t.notOk(err,
            'no err')
    console.log(resp)
    t.end()
  })
  // console.log('imported', mod)
})

