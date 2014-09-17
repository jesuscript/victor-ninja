var _ = require("lodash");

module.exports = _.extend({
  console: _.clone(console),
  requireSpecs: function(dir, specs){
    _.each(specs, function(spec){ require(dir + "/" + spec)(this); },this);
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
