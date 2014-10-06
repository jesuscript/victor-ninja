var _ = require("lodash"),
    when = require("when"),
    sinon = require("sinon"),
    util = require("./util"),
    fixtures = require("../fixtures");


/*TODO: build fixture based on resource metadata
 * Number: uid (add refreshCounters method)
 * String: field name + uid
 * check stringjs
 */

module.exports = function(client,request){
  var self = {
    registerAndSignIn: function(){
      return self.registerUser({
        email: "bob@bob.com",
        password: "password"
      }).then(function(user){
        //console.log(user);
        return request.signInAs(user);
      });
    },
    registerUser: function(fields){
      return sandboxed(function(sandbox){
        sandbox.stub(
          require("../routing-service/lib/legacy-integration-service/controllers/users"),
          "postUser"
        ).returns(function(request){
          return when.resolve(request.body);
        });

        return self.create("user", _.extend(fields, {
          dateEmailVerification: new Date(),//TODO: remove
          verifiedAt: new Date()
        }));
      }).then(function(data){
        return _.extend(data.users[0], fields);
      });
    },
    create: function(name,fields){
      var resource = _.find(client.resources, function(resource){ //OPTIMISE the lookup
        return resource.name === name;
      });

      return client.create(resource.route, assembleFixture(resource,fields));
    }
  };

  function assembleFixture(schema, customFields){
    return _.extend(fixtures[schema.name], customFields);
  }

  function sandboxed(cb){
    var sandbox = sinon.sandbox.create();

    return when.resolve(cb(sandbox)).then(function(data){
      sandbox.restore();
      return data;
    });
  }

  return self;
};
