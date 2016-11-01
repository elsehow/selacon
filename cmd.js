let keys = require('./keys.json')
let getter = require('./lib/pocket-getter')
let key = keys["pocket-api-key"]
let token = keys["pocket-access-token"]
let markupper = require('.')

opts = {
  posts_per_page:5,
  outdir: 'jekyll-blog/_posts/',
  no_overwrite: true,
  debug: true,
  images: true,
}

getter(key, token, function (err, resp) {
  if (err) throw err
  markupper(resp, opts)
  console.log('writing markdown...')
})
