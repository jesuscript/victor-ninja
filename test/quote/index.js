module.exports = function(testApp){
  describe("quote", function(){
    var quote;
    
    beforeEach(function(done){
      testApp.fixture.create("quote").then(function(data){
        quote = data.quotes[0];
        done();
      });
    });

    it("uses the conventional currency format", function(done){
      //TODO
      done();
    });
  });
};
