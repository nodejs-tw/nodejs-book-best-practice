(function(){
  'use strict';
  var stream, yaml;
  stream = require('stream');
  yaml = require('js-yaml');
  module.exports = function(options){
    var buffer, contentIdentifier, metaEnd, trans, emitMeta;
    options || (options = {});
    buffer = '';
    contentIdentifier = options.identifier || '---';
    metaEnd = false;
    trans = new stream.Transform;
    emitMeta = function(){
      var meta, e;
      if (buffer) {
        try {
          meta = yaml.safeLoad(buffer);
          trans.emit('meta', meta);
        } catch (e$) {
          e = e$;
          trans.emit('error', e);
          trans.emit('meta', {});
        }
        buffer = '';
      } else {
        trans.emit('meta', {});
      }
    };
    trans._transform = function(chunk, enc, cb){
      var thisData, contentData;
      chunk = chunk.toString();
      thisData = [];
      contentData = [];
      if (metaEnd) {
        this.push(chunk);
      } else {
        chunk.split('\n').forEach(function(str){
          if (metaEnd) {
            return contentData.push(str);
          } else if (str.trim() === contentIdentifier) {
            metaEnd = true;
            buffer = buffer + thisData.join('\n');
            return emitMeta();
          } else {
            return thisData.push(str);
          }
        });
        contentData = contentData.join('\n');
        if (contentData) {
          this.push(contentData);
        }
      }
      cb();
    };
    trans._flush = function(cb){
      this.emit('meta', {});
      if (!metaEnd) {
        this.push(buffer);
      }
      buffer = null;
      cb();
    };
    return trans;
  };
}).call(this);
