let google = require('googleapis');
let customsearch = google.customsearch('v1');

function search (q, auth, cb) {
  customsearch.cse.list({
    q: q,
    auth: auth.key,
    cx: auth.cx,
    searchType: 'image',
  }, function (err, resp) {
    if (err) return cb(err)
    cb(null, resp)
  })
}

function first (response) {
  return response.items[0]
}

function markdown (result) {
  return `[![](${result['link']})](${result['image']['contextLink']})`
}

function markdownImage (query, auth, cb) {
  search(query, auth, function (err, res) {
    if (err) return cb(err)
    try {
      cb(null, markdown(first(res)))
    } catch (e) {
      cb(null, '')
    }
  })
}

module.exports = markdownImage
