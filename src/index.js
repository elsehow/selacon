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
    return jstime
        .toLocaleDateString(
            "en-US")
}

function day (story) {
    return format(time(story))
}

function link (s) {
    let title = s.resolved_title ?
        s.resolved_title : s.resolved_url
    return `
    [${title}](${s.resolved_url}). ${s.excerpt}
    `
}

// a post, in markdown
function post (p) {
    return `
    title: ${p.day}
    date: ${p.day}
    --------------
    ${p.links.map(link).join('\n')}
    `
}

function postList (links, day) {
    return { day: day, links: links }
}

function latest (post1, post2) {
    let later =
        new Date(post1.day) >=
        new Date(post2.day)
    return later ? 1 : -1
}

function hasLinks (p) {
    return p.links.length
}

function write (opts) {
    let stat = require('fs').stat
    let writeF = require('fs').writeFile
    return function (p) {
        let fn = `${p.day.replace(new RegExp('/', 'g'),'-')}.md`
        let path = join(opts.outdir, fn)
        // TODO don't ovewrite file
        stat(path, function (err, res) {
            if (opts.no_overwrite && res)
                return
            writeF(path, post(p), function (err) {
                if (err) throw err
                if (opts.debug) console.log("writing", path)
            })
        })
        return
    }
}

// takes a pocket api response (obj)
// returns a list of html strings - one per page
function markupper (api_resp, opts) {
    let stories =
        map(api_resp.list, identity)
    let posts =
        map(group(stories, day),
            postList)
        .sort(latest)
        .filter(hasLinks)
        .reverse()
        // .map(post)
    mkdirp(opts.outdir, function (err) {
        if (err) throw err
        posts.forEach(write(opts))
    })
}

module.exports = markupper
