let keys = require('../../../keys.json')
let test = require('tape')

let key = keys["pocket-api-key"]
let token = keys["pocket-access-token"]
let getter = require('..')


test('get pocket', t => {
  getter(key, token, function (err, res) {
    t.notOk(err)
    t.ok(t, res)
    t.end()
  })
})
//console.log('imported', mod)
