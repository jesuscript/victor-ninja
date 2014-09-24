var requesto = require("requesto"),
    when = require("when"),
    _ = require("lodash");

module.exports = function(auth,baseUrl,trustedFortuneClient){
  var self = {
    signInAs: function(user){
      return trustedFortuneClient.createUserAuthenticationToken({
        username: user.email,
        password: user.password
      }).then(function(data){
        self.userAuthToken = data["user-authentication-tokens"][0].token;
      });
    },
    reset: function(){
      self.userAuthToken = undefined;
    }
  };
  
  var httpMethods =  _.reduce(requesto, function(memo,method,name){
    memo[name] = function(){
      var args = _.map(arguments, function(arg){
        if(_.isPlainObject(arg)){
          return _.extend(arg, {
            url: arg.url && (baseUrl + arg.url),
            oauth: {
              consumer_key: auth.key,
              consumer_secret: auth.secret
            },
            headers:{
              userauthtoken: self.userAuthToken
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

  return _.extend(self, httpMethods);
};
