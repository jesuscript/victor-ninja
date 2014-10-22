module.exports = function(testApp,testOpt){
  describe("request", function(){
    it("should be able to correctly sign nested querystring params", function(done){
      var user;

      testApp.request.get({
        url: "/users",
        qs: {
          filter: {
            email: testOpt.bob.email
          }
        },
        json: true
      }).then(function(res){
        res.body.users.length.should.be.equal(1);
        done();
      });
    });
  });
};
