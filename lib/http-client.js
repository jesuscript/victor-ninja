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
      arguments[0] = _.extend(_.isPlainObject(arguments[0]) ? arguments[0] : {},{
        url: baseUrl + (_.isString(arguments[0]) ? arguments[0] : arguments[0].url),
        oauth: {
          consumer_key: auth.key,
          consumer_secret: auth.secret
        },
        headers:{
          userauthtoken: self.userAuthToken
        }
      });

      return method.apply(memo, arguments);
    };
    return memo;
  }, {});

  return _.extend(self, httpMethods);
};
