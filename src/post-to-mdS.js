/*

  function postToMdS (p, opts) { }

  This method turns each post {day, links: [] }
  Into a stream of 1 markdown string.

  */

let kefir = require('kefir')
// keys for image search
let keys = require('../keys.json')
let auth = {
  cx:keys.cx,
  key:keys['google-api-key'],
}
// returns markdown image
let search = require('../lib/image-search')

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

// returns stream of markdown strings
function img_mdS (query, pullImages=false) {
  if (!pullImages)
    return kefir.constant('')
  return kefir.fromNodeCallback(callback => {
    search(query, auth, callback)
  })
}

// returns stream of markdown strings
function linkToStrS (pullImages=false) {

  return function (l) {

    let title = l.resolved_title ?
        l.resolved_title : l.resolved_url

    return img_mdS(l.resolved_url, pullImages)
      .map(img_md => link_md(l.resolved_url,
                             title,
                             l.excerpt,
                             img_md))
  }
}

// returns stream of markdown strings
function postToMdS (p, opts) {
  let linkSs = p.links.map(linkToStrS(opts.images))
  return kefir.combine(linkSs, function (...links) {
    return post_md(p.day, links)
  })
}

module.exports = postToMdS
