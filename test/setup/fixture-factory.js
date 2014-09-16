var util = require("../util"),
    _ = require("lodash");


/*TODO: build fixture based on resource metadata
 * Number: uid (add refreshCounters method)
 * String: field name + uid
 */

var fixtures = {
  user: function(fields){
    return _.extend({
      "phone":"1234",
      "password":"password",
      "firstName":"",
      "country":"af",
      "title":"Mr",
      "languageCode":"en-GB",
      "email":"hoanglonguk+1231@gmail.com",
      "charterFrequency":{"min":1,"max":10},
      "lastName":"Asddas"
    }, fields);
  }
};

module.exports = function(client){
  return {
    create: function(name,fields){
      var resource = _.find(client.resources, function(resource){ //OPTIMISE the lookup
        return resource.name === name;
      });
      return client.create(resource.route, fixtures[name](fields));
    }
  };
};
