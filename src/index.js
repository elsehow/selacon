/*
  -----------------------------

  function blogger (api_resp, opts) { }

  takes a pocket api response (obj)
  returns a list of html strings - one per page

  opts is like

  {
      outdir: 'jekyll-blog/_posts/',
      no_overwrite: false,
      debug: true,
      images: false,
  }

  -----------------------------
*/
let apiRespToPostlist = require('./api-resp-to-postlist.js')
let postToMdS = require('./post-to-mdS.js')
let diskWriter = require('./disk-writer.js')
function blogger (api_resp, opts) {
  // returns list of { day, links} from Pocket API response
  // method for writing each post
  let posts = apiRespToPostlist(api_resp)
  diskWriter(posts, postToMdS, opts)
}

module.exports = blogger
