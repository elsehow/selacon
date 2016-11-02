let group = require('lodash.groupby')
let chunk = require('lodash.chunk')

/*
  function postlist (api_resp) { }

  turn Pocket API response into a list
  (link format comes from Pocket API)

    [ {
        day: '2016-10-13',
        links: [{ resolved_url, resolved_title, excerpt, ... }]
      },
    ...
    ]

  */

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

function latest (post1, post2) {
  let later =
      new Date(post1.day) >=
      new Date(post2.day)
  return later ? 1 : -1
}

function hasLinks (post) {
  return post.links.length
}

function postlist (api_resp) {

  let links =
      map(api_resp.list, identity)

  let posts =
      map(group(links, day), post)
      .sort(latest)
      .filter(hasLinks)
      .reverse()

  return posts
}
module.exports = postlist
