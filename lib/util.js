var _ = require("lodash"),
    fs = require("fs");

module.exports = _.extend({
  console: _.clone(console),
  requireSpecs: function(dir, specs, argArray){
    if(_.isArray(dir)){
      argArray = specs;
      specs = dir;
      dir = null;
    }
    _.each(specs, function(spec){
      require( (dir ? (dir + "/") : "") + spec).apply(null, argArray);
    });
  },
  modulesInDir: function(dir, except){
    return _.filter(_.map(fs.readdirSync(dir), function(m){//map
      return dir + "/" + m;
    }), function(m){
      return !except || (_.isArray(except) ? except.indexOf(m) === -1 : m !== except);
    });
  },
  requireSpecsInDir: function(dir, except, argArray){
    return this.requireSpecs(this.modulesInDir(dir,except), argArray);
  },
  disableConsole: function(){
    _.each(console, function(fn,k){
      console[k] = function(){};
    });
  },
  enableConsole: function(){
    var self = this;
    
    _.each(this.console, function(fn,k){
      console[k] = fn;
    });
  }
}, console);
