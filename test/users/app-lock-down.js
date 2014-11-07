module.exports = function(testApp,testOpt){
  describe("app lock-down", function(){
    var creds = {
      username: "someguy@somedomain.com",
      password: "whatever"
    };
    
    beforeEach(function(){
      process.env.REJECT_NON_APP_APPROVED_USERS=true;
      process.env.AUTO_APPROVE_CODES="VIC001;victory";
    });

    var testErrorResponse = function(res){
    };
    
    var countTokens = function(){
      return testApp.fortuneClient.getUserAuthenticationTokens().then(function(data){
        return data["user-authentication-tokens"].length;
      });
    };

    var signIn = function(){
      return testApp.request.post("/user-authentication-tokens", {
        json: {
          "user-authentication-tokens": [creds]
        }
      });
    };
    
    describe("for users without a ref code", function(){
      var authResponse, user, tokenCount;

      
      beforeEach(function(done){
        testApp.fixture.create("users", {
          email: creds.username,
          password: creds.password,
          additionalDetails: {
            iosConsumerStatus: "approved" // to check that this gets cleared
          }
        }).then(function(data){
          user = data.users[0];

          return countTokens();
        }).then(function(count){
          tokenCount = count;
          
          return signIn();
        }).done(function(res){
          authResponse = res;
          done();
        });
      });
      
      it("rejects authentication requests", function(){
        authResponse.statusCode.should.be.equal(403);
        authResponse.body.should.have.property("errors");
        authResponse.body.errors.length.should.be.equal(1);
        var error = authResponse.body.errors[0];
        error.should.be.ok;
        error.status.should.be.equal(403);
        error.code.should.be.equal("waitlist");
        error.title.should.be.equal("Waiting List");
      });

      it("does not create a user-authentication-token", function(done){
        (authResponse.body["user-authentication-tokens"] === undefined).should.be.true;
        
        testApp.fortuneClient.getUser(user.id.toString()).then(function(data){
          if(data.users[0].links){
            data.users[0].links.authenticationTokens.length.should.be.equal(0);
          }
          return countTokens();
        }).then(function(count){
          count.should.be.equal(tokenCount);
        }).done(done);
      });

      it("allows sending a refcode separately", function(done){
        testApp.request.post("/users/refcode", {
          json: {
            username: creds.username,
            password: creds.password,
            refcode: "victory"
          }
        }).then(function(res){
          res.statusCode.should.be.equal(200);

          return signIn();
        }).done(function(res){
          res.statusCode.should.be.equal(201);
          res.body.should.have.property("user-authentication-tokens");
          res.body["user-authentication-tokens"].length.should.be.equal(1);

          done();
        });
      });

      it("rejects the refcode if credentials were wrong", function(done){
        testApp.request.post("/users/refcode", {
          json: {
            username: creds.username,
            password: "wrong password",
            refcode: "victory"
          }
        }).then(function(res){
          res.statusCode.should.be.equal(401);
          res.body.should.have.property("errors");
          var error = res.body.errors[0];
          error.title.should.be.equal("Sign in Error");
        }).done(done);
      });
    });

    describe("for users with a ref code", function(){
      var user, authResponse;
      
      beforeEach(function(done){
        testApp.fixture.create("users", {
          email: creds.username,
          password: creds.password,
          digitalAcquisitionChannel: {
            content: "victory"
          }
        }).then(function(data){
          user = data.users[0];

          return signIn();
        }).done(function(res){
          authResponse = res;
          done();
        });
      });

      it("allows signing in as usual", function(){
        authResponse.statusCode.should.be.equal(201);
        authResponse.body.should.have.property("user-authentication-tokens");
        authResponse.body["user-authentication-tokens"].length.should.be.equal(1);
      });
    });
  });
};
