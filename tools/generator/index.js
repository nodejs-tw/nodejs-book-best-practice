(function(){
  'use strict';
  var fs, path, jade, mkdirp, Generator, config, script;
  fs = require('fs');
  path = require('path');
  jade = require('jade');
  mkdirp = require('mkdirp');
  Generator = require('./Generator');
  config = require('../../config.json');
  script = {};
  script.main = function(){
    console.log();
    this.init(function(){
      console.log('  執行');
      console.log();
      this.generateAll();
    });
  };
  script.init = function(cb){
    var _mkdir;
    console.log('  初始化');
    this.basedir = path.join(__dirname, '../..');
    this.generator = Generator.create();
    this['enum'] = this.getTypes();
    this.types = this.cleanTypes(process.argv.slice(2));
    if (!this.types.length) {
      this.types = this['enum'].slice();
    }
    this.generator.on('stream', bind$(this, 'onStream'));
    _mkdir = bind$(this, 'mkdir');
    cb = cb.bind(this);
    this.loadTemplates(function(){
      return _mkdir(function(){
        return cb();
      });
    });
  };
  script.getTypes = function(){
    return Object.keys(config.generator || {});
  };
  script.cleanTypes = function(types){
    var newArr, e;
    newArr = [];
    e = this['enum'];
    types.forEach(function(type){
      if (!!~indexOf(type)) {
        newArr.push(type);
      }
    });
    return newArr;
  };
  script.loadTemplates = function(cb){
    var len, templates;
    len = this.types.length;
    templates = this.templates = {};
    this.types.forEach(function(type){
      var file;
      file = config.generator[type].template;
      if (file) {
        fs.readFile(file, function(err, content){
          if (!err) {
            templates[type] = content;
          }
          if (!--len) {
            cb();
          }
        });
      } else {
        len--;
      }
    });
  };
  script.mkdir = function(cb){
    var len, exit;
    len = this.types.length;
    exit = bind$(this, 'exit');
    this.types.forEach(function(type){
      var des;
      des = config.generator[type].destination;
      if (des) {
        mkdirp(des, function(err){
          if (err) {
            exit(err);
          }
          if (!--len) {
            cb();
          }
        });
      } else {
        len--;
      }
    });
  };
  script.generateAll = function(){
    this.types.forEach(bind$(this, 'generate'));
  };
  script.generate = function(type){
    var pattern;
    pattern = path.join(this.basedir, config.generator[type].source);
    this.generator.generate(pattern, {
      type: type
    });
  };
  script.onStream = function(stream){
    var template, type, source, srcdir, desdir, filepath, failed;
    console.log("    開始: " + stream.data.file);
    template = this.templates[stream.data.type] || '';
    type = config.generator[stream.data.type];
    source = type.source.split('*');
    srcdir = path.join(this.basedir, source[0]);
    desdir = path.join(this.basedir, type.destination);
    if (srcdir[srcdir.length - 1] === path.sep) {
      srcdir = srcdir.substr(0, srcdir.length - 1);
    }
    filepath = stream.data.file.replace(srcdir, desdir).replace(/\.md$/, '.html');
    failed = function(err){
      console.log("    失敗: " + filepath + ". (" + err.message + ")");
    };
    stream.on('readable', function(){
      var data, content, html;
      content = '';
      while (data = this.read()) {
        content += data;
      }
      stream.meta.content = content;
      html = jade.render(template, {
        article: stream.meta,
        filename: path.join(__dirname, '../../templates/template.jade')
      });
      mkdirp(path.dirname(filepath), function(err){
        if (err) {
          failed(err);
        } else {
          fs.writeFile(filepath, html, function(err){
            if (err) {
              failed(err);
            } else {
              console.log("    成功: " + filepath);
            }
          });
        }
      });
    });
  };
  script.exit = function(err){
    if (err) {
      console.log("Error: " + err.message);
      process.exit(1);
    } else {
      process.exit(0);
    }
  };
  script.main();
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
}).call(this);
