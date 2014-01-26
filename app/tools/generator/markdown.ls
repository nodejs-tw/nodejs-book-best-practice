'use strict'

require! {
  stream
  marked
  highlight: \pygmentize-bundled
}

marked.setOptions {
  highlight: (code, lang, cb) !->
    highlight {lang: lang, format: \html}, code, (err, res) !->
      cb err, res && res.toString!
}

module.exports = ->
  buffer = ''
  trans = new stream.Transform

  trans._transform = (chunk, enc, cb) !->
    buffer := buffer + chunk
    cb!

  trans._flush = (cb) !->
    marked buffer, (err, content) !->
      if err
        trans.emit \error, err
      else
        trans.push content
      cb!
    buffer := null

  trans
