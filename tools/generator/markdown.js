(function(){
  'use strict';
  var stream, marked, highlight;
  stream = require('stream');
  marked = require('marked');
  highlight = require('pygmentize-bundled');
  marked.setOptions({
    highlight: function(code, lang, cb){
      highlight({
        lang: lang,
        format: 'html'
      }, code, function(err, res){
        cb(err, res && res.toString());
      });
    }
  });
  module.exports = function(){
    var buffer, trans;
    buffer = '';
    trans = new stream.Transform;
    trans._transform = function(chunk, enc, cb){
      buffer = buffer + chunk;
      cb();
    };
    trans._flush = function(cb){
      marked(buffer, function(err, content){
        if (err) {
          trans.emit('error', err);
        } else {
          trans.push(content);
        }
        cb();
      });
      buffer = null;
    };
    return trans;
  };
}).call(this);
