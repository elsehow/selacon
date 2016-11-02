let kefir = require('kefir')
let join = require('path').join
let mkdirp = require('mkdirp')
let stat = require('fs').stat
let writeF = require('fs').writeFile
// returns markdown image
let search = require('../lib/image-search')
// returns list of { day, links} from Pocket API response
let postlist = require('./postlist.js')
// keys for image search
let keys = require('../keys.json')
let auth = {
  cx:keys.cx,
  key:keys['google-api-key'],
}

/*
  -----------------------------
  string templates
  -----------------------------
  */
function href (url, txt) {
  return `<a href="${url}" target="_blank">${txt}</a>`
}

function link_md (url, title, excerpt, img_md) {
  return `
${img_md}

${href(url, title)}. ${excerpt}
`
}

function post_md (day, links_md_arr) {
  return `---
title: ""
published: ${day}
---
${links_md_arr.join('\n')}
`
}

/*
  -----------------------------
  data marshalling methods
  -----------------------------
*/

function img_mdS (query, pull_images=true) {
  if (!pull_images)
    return kefir.constant('')
  return kefir.fromNodeCallback(callback => {
    search(query, auth, callback)
  })
}

// returns markdown
function linkToStrS (pull_images) {

  return function (l) {

    let title = l.resolved_title ?
        l.resolved_title : l.resolved_url

    return img_mdS(l.resolved_url, pull_images)
      .map(img_md => link_md(l.resolved_url,
                             title,
                             l.excerpt,
                             img_md))
  }
}

// returns kefir stream of markdown
function postToStr (p, pull_images) {
  let linkSs = p.links.map(linkToStrS(pull_images))
  return kefir.combine(linkSs, function (...links) {
    return post_md(p.day, links)
  })
}

/*
  -----------------------------
  disk-writing methods
  -----------------------------
*/

function writePost (path, p, opts) {

  function errorCb (err) {
    console.warn('ERR', err)
  }

  function writeCb (err) {
    if (err) errorCb(err)
    else if (opts.debug)
      console.log("writing", path)
  }

  function writeFile (str) {
    return writeF(path, str, writeCb)
  }

  postToStr(p, opts.images)
    .onValue(writeFile)
    .onError(errorCb)
  return
}

function checkAndWrite (path, p, opts) {
  stat(path, function (err, res) {
    if (opts.no_overwrite && res)
      return
    return writePost(path, p, opts)
  })
}

// write a post to disk, if we need to
function write (p, opts) {
  let fn = `${p.day}-${p.day}.md`
  let path = join(opts.outdir, fn)
  return checkAndWrite(path, p, opts)
}

/*
  -----------------------------
  this method is exposed

  takes a pocket api response (obj)
  returns a list of html strings - one per page
  -----------------------------
*/
function markupper (api_resp, opts) {
  let posts = postlist(api_resp)
  // write each post to disk (if needed)
  mkdirp(opts.outdir, function (err) {
    if (err) throw err
    posts.forEach(p =>
                  write(p, opts))
  })
}

module.exports = markupper
