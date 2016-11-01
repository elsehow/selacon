let group = require('lodash.groupby')
let chunk = require('lodash.chunk')
let join = require('path').join
let mkdirp = require('mkdirp')

// map a fn (val, key) over keys in obj
function map (obj, fn) {
    return Object.keys(obj)
        .map(k => fn(obj[k], k))
}

function identity (x) {
    return x
}

function time (story) {
    return new Date(
        1000*
            parseInt(
                story.time_added))
}

function format (jstime) {
    return jstime.getFullYear()
        + "-" +
        (jstime.getMonth() + 1)
        + "-" +
        jstime.getDate()
}

function day (story) {
    return format(time(story))
}

function post (links, day) {
    return { day: day, links: links }
}

function href (url, txt) {
  return `<a href="${url}" target="_blank">${txt}</a>`
}

function linkToStr (l) {
    let title = l.resolved_title ?
        l.resolved_title : l.resolved_url
    return `
  ${href(l.resolved_url, title)}. ${l.excerpt}
`
}

// a post, in markdown
function postToStr (p) {
    return `---
title: ""
published: ${p.day}
---
${p.links.map(linkToStr).join('\n')}
`

}

function latest (post1, post2) {
    let later =
        new Date(post1.day) >=
        new Date(post2.day)
    return later ? 1 : -1
                                       }

function hasLinks (post) {
    return post.links.length
}

// returns a function (post)
function write (opts) {

    let stat = require('fs').stat
    let writeF = require('fs').writeFile

    function writePost (path, p) {
        let str = postToStr(p)
        writeF(path, str, function (err) {
            if (err) throw err
            if (opts.debug) console.log("writing", path)
        })
        return
    }

    function checkAndWrite (path, p) {
        stat(path, function (err, res) {
            if (opts.no_overwrite && res)
                return
            return writePost(path, p)
        })
    }

    return function (p) {
        let fn = `${p.day}-${p.day}.md`
        let path = join(opts.outdir, fn)
        return checkAndWrite(path, p)
    }
}

// takes a pocket api response (obj)
// returns a list of html strings - one per page
function markupper (api_resp, opts) {

    let stories =
        map(api_resp.list, identity)

    let posts =
        map(group(stories, day), post)
        .sort(latest)
        .filter(hasLinks)
        .reverse()

    mkdirp(opts.outdir, function (err) {
        if (err) throw err
        posts.forEach(write(opts))
    })
}

module.exports = markupper
