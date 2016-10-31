let group = require('lodash.groupby')
let chunk = require('lodash.chunk')

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

// returns html
function link (s) {

    function title () {
        return `
        <a class="title"
           href="${s.resolved_url}">
            ${s.resolved_title}
        </a>
        `
    }

    function excerpt () {
        return `
        <span class="excerpt">
            ${s.excerpt}
        </span>
        `
    }

    return `
    <div class = "link">
        ${title()}
        ${excerpt()}
    </div>
    `
}

function post (p) {
    function daystr () {
        return `
        <span class="day">
            ${p.day}
        </span>`
    }
    return `<div class="post">
        ${daystr()}
        ${p.links.map(link).join('')}
        </div>
        `

}

// map a fn (val, key) over keys in obj
function map (obj, fn) {
    return Object.keys(obj)
        .map(k => fn(obj[k], k))
}

function identity (x) { return x }

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

function page (opts) {

    return function (posts, i, list) {

    function newer (msg) {
        if (i==0)
            return ``
        let url = `${i-1}.html`
        if (i==1)
            url = 'index.html'
        return `
            <a href="${url}">${msg}</a>
        `
    }

    function older (msg) {
        if (i==list.length)
            return
        let url = `${i+1}.html`
        return `
            <a href="${url}">${msg}</a>
            `
    }

    function nav () {
        return `
        ${older('Older')}|${newer('Newer')}
        `
    }

    return `
      <html>
      <head>
      <link rel="stylesheet"
            type="text/css"
            href="${opts.css}"
      <meta name="viewport"
            content="width=device-width,
                     initial-scale=1.0">
      </head>
      <div id ="container">
          ${nav()}
          ${map(posts, post).join('')}
          ${nav()}
      </div>
      <html>
    `
    }
}

// takes a pocket api response (obj)
// returns a list of html strings - one per page
function markupper (api_resp, opts) {
    let stories =
        map(api_resp.list, identity)
    let posts =
        map(
            group(stories, day),
            postList)
        .sort(latest)
        .filter(hasLinks)
        .reverse()
    let pages =
        chunk(posts,
              opts.posts_per_page)
        .map(page(opts))
    pages.forEach((p,i) => {
        let fn = `${i}.html`
        if (i==0)
            fn = 'index.html'
        // HACK
        let write = require('fs').writeFileSync
        write(fn, p)
    })
}

module.exports = markupper

