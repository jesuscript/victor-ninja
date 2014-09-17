var requesto = require("requesto"),
    _ = require("lodash");

module.exports = function(auth,baseUrl){
  var methods =  _.reduce(requesto, function(memo,method,name){
    memo[name] = function(){
      var args = _.map(arguments, function(arg){
        if(_.isPlainObject(arg)){
          return _.extend(arg, {
            url: arg.url && (baseUrl + arg.url),
            oauth: {
              consumer_key: auth.key,
              consumer_secret: auth.secret
            }
          });
        }else if(_.isString(arg)){
          return baseUrl + arg.url;
        }else{
          return arg;
        }
      });

      return method.apply(memo, args);
    };
    return memo;
  }, {});

  return _.extend(methods, {
    //TODO
  });
};
