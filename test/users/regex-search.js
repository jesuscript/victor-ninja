var when = require("when"),
    userSearch = require("../../routing-service/lib/user-service/components/user-search.js"),
    _ = require("lodash");

module.exports = function(testApp, testOpt){
  describe("regex search", function(){
    var users;

    beforeEach(function(done){
      
      testApp.fixture.create("users",[
        {firstName: "John", lastName: "Doe"},
        {firstName: "Johnny", lastName: "Doe"},
        {firstName: "Johnny", lastName: "Depp"},
        {firstName: "Johanna", lastName: "Mason"},
        {firstName: "Jamie", lastName: "Oliver"}
      ]).then(function(data){
        users = data.users;
        
        return userSearch(testApp.fortuneClient).updateAll();
      }).done(done);
    });

    it("returns correct numbers of results", function(done){
      testApp.request.get("/users",{ qs: { search: "J" } }).then(function(res){
        res.body.users.length.should.be.equal(5);

        return testApp.request.get("/users",{ qs: { search: "Jo" } });
      }).then(function(res){
        res.body.users.length.should.be.equal(4);

        return testApp.request.get("/users",{ qs: { search: "John" } });
      }).then(function(res){
        res.body.users.length.should.be.equal(3);

        return testApp.request.get("/users",{ qs: { search: "Johnny" } });
      }).then(function(res){
        res.body.users.length.should.be.equal(2);

        return testApp.request.get("/users",{ qs: { search: "Johnny De" } });
      }).then(function(res){
        testJohnny(res);

        return testApp.request.get("/users",{ qs: { search: "Johnny Derp?" } });
      }).then(function(res){
        res.body.users.length.should.be.equal(0);
      }).then(done);
    });

    it("is case insensitive", function(done){
      testApp.request.get("/users",{qs:{search: "JoHnNy dEpP"}}).then(function(res){
        testJohnny(res);
      }).then(done);
    });

    it("ignores spaces", function(done){
      testApp.request.get("/users",{qs:{search: "Joh nny de pp"}}).then(function(res){
        testJohnny(res);
      }).then(done);
    });

    it("works if users update names", function(done){
      var oliver;
      
      testApp.request.get("/users",{qs:{search: "Oliver"}}).then(function(res){
        res.body.users.length.should.be.equal(1);
        oliver = res.body.users[0];

        return testApp.request.patch("/users/"+oliver.id,{
          json: [{
            path: "/users/0/lastName",
            op: "replace",
            value: "Dornan"
          }]
        });
      }).then(function(){
        return testApp.request.get("/users",{qs:{search: "Oliver"}});
      }).then(function(res){
        res.body.users.length.should.be.equal(0);

        return testApp.request.get("/users",{qs:{search: "Dornan"}});
      }).then(function(res){
        res.body.users.length.should.be.equal(1);
      }).then(done);
    });

    function testJohnny(res){
      res.body.users.length.should.be.equal(1);

      var depp = res.body.users[0];

      depp.firstName.should.be.equal("Johnny");
      depp.lastName.should.be.equal("Depp");
    }
  });

};
