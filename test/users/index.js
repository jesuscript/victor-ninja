var proxyquire = require("proxyquire"),
    when = require("when");

module.exports = function(util){
  describe("users", function(){
    var credentials = {
      username: "bob@bob.com",
      password: "password"
    };

    //TODO: replace with a proper register user fixture and mock legacy app
    proxyquire("../../routing-service/lib/legacy-integration-service/routes",{
      "./controllers/users": {
        postUser: function(request){
          //console.log("post", request.body, typeof request.body);
          //return when.resolve(JSON.parse(request.body));
          return when.resolve(request.body);
        }
      }
    });
    
    beforeEach(function(done){
      util.create("user",{
        email: credentials.username,
        password: credentials.password,
        dateEmailVerification: new Date()
      }).then(function(){
        done();
      });
    });

    afterEach(function(){
      //TODO: unproxy
    });
    it("should be able to authenticate", function(done){
      util.request.post({
        url: "/user-authentication-tokens",
        json: {
          "user-authentication-tokens": [credentials]
        }
      }).then(function(res){
        res.body["user-authentication-tokens"].should.be.an.Array;
        res.body["user-authentication-tokens"].length.should.be.equal(1);
        res.body["user-authentication-tokens"][0].token.should.be.a.String;
        done();
      });
    });
  });
};

