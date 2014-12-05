module.exports = function(testApp, testOpt){
  describe("apns tokens", function(){
    describe("once registered", function(){
      var token = "huy123";
      
      beforeEach(function(done){
        testApp.request.post("/apns-token/register", {
          json: {
            token: token,
            sandbox: false
          }
        }).done(function(){done();});
      });
      
      it("reference a user", function(done){
        var tokenId;
        testApp.fortuneClient.getApnsTokens({token: token}).then(function(data){
          tokenId = data["apns-tokens"][0].id;
          data["apns-tokens"][0].links.user.should.be.equal(testOpt.bob.id);
          return testApp.fortuneClient.getUser(testOpt.bob.id.toString());
        }).then(function(data){
          console.log(JSON.stringify(data, null, 2) );
          data.users[0].links.apnsTokens.length.should.be.equal(1);
          data.users[0].links.apnsTokens[0].should.be.equal(tokenId);
        }).done(done);
      });
    });
  });
};

