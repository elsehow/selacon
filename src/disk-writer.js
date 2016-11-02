let join = require('path').join
let mkdirp = require('mkdirp')
let stat = require('fs').stat
let writeF = require('fs').writeFile

/*
  -----------------------------
  disk-writing methods
  -----------------------------
*/

// calls back on cb if we should write to path
function check (path, opts, cb) {
  stat(path, function (err, res) {
    if (opts.no_overwrite && res)
      return
    return cb()
  })
}

function writePost (fn, path, p, opts) {

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

  fn(p, opts)
    .onValue(writeFile)
    .onError(errorCb)

  return
}

// write a post to disk, if we need to
function write (writePostFn, opts) {
  return function (p) {
    let fn = `${p.day}-${p.day}.md`
    let path = join(opts.outdir, fn)
    // check only calls back if we *should*
    // write post `p` at `path`
    return check(path, opts, () => {
      // side-effecty method to write post to disk
      writePost(writePostFn, path, p, opts)
    })
  }
}

function diskWriter (sortedPosts, postWritingFn, opts) {
  // write each post to disk (if needed)
  mkdirp(opts.outdir, function (err) {
    if (err) throw err
    sortedPosts.forEach(write(postWritingFn, opts))
  })
}

module.exports = diskWriter
