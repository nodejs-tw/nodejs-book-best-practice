'use strict'

require! {
  stream
  yaml: \js-yaml
}

module.exports = (options || {}) ->
  buffer = ''
  contentIdentifier = options.identifier || '---'
  metaEnd = false
  trans = new stream.Transform

  emitMeta = !->
    if buffer
      try
        meta = yaml.safeLoad buffer
        trans.emit \meta, meta
      catch
        trans.emit \error, e
        trans.emit \meta, {}
      buffer := ''
    else
      trans.emit \meta, {}

  trans._transform = (chunk, enc, cb) !->
    chunk = chunk.toString!
    thisData = []
    contentData = []
    if metaEnd
      @push chunk
    else
      chunk.split '\n' .forEach (str) ->
        if metaEnd
          contentData.push str
        else if str.trim! == contentIdentifier
          metaEnd := true
          buffer := buffer + thisData.join '\n'
          emitMeta!
        else
          thisData.push str
      contentData = contentData.join '\n'
      if contentData
        @push contentData
    cb!

  trans._flush = (cb) !->
    @emit \meta {}
    if !metaEnd
      @push buffer
    buffer := null
    cb!

  trans
