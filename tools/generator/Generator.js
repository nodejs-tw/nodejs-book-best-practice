(function(){
  'use strict';
  var fs, glob, util, events, EventEmitter, meta, markdown, Generator;
  fs = require('fs');
  glob = require('glob');
  util = require('util');
  events = require('events');
  EventEmitter = require('events').EventEmitter;
  meta = require('./meta');
  markdown = require('./markdown');
  Generator = module.exports = function(){
    return EventEmitter.call(this);
  };
  util.inherits(Generator, EventEmitter);
  Generator.create = function(){
    return new Generator;
  };
  Generator.prototype.generate = function(pattern, data){
    var process, getFileStream, globCb;
    data || (data = {});
    process = bind$(this, 'process');
    getFileStream = bind$(this, 'getFileStream');
    globCb = function(err, files){
      return files.forEach(function(file){
        var fileData, fileStream;
        fileData = {
          file: file
        };
        fileData.__proto__ = data;
        fileStream = getFileStream(file);
        fileStream.data = fileData;
        return process(fileStream);
      });
    };
    glob(pattern, globCb);
    return this;
  };
  Generator.prototype.process = function(fileStream){
    var stream;
    stream = fileStream.pipe(meta()).on('meta', function(meta){
      stream.meta = meta;
    }).pipe(markdown());
    stream.data = fileStream.data;
    this.emit('stream', stream);
    return this;
  };
  Generator.prototype.getFileStream = function(file){
    return fs.createReadStream(file, {
      encoding: 'utf8'
    });
  };
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
}).call(this);
