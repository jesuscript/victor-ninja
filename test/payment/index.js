var util = require("../../lib/util");

module.exports = function(testApp){
  describe("payment", function(){
    var opts = {};
    
    beforeEach(function(done){
      testApp.fixture.registerUser({
        email: "bob@bob.com",
        password: "password"
      }).then(function(user){
        return testApp.request.signInAs(opts.bob = user);
      }).then(function(){
        done();
      });
    });
    
    util.requireSpecsInDir(__dirname, [__filename], [testApp, opts]);
  });
};
