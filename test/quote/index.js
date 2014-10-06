module.exports = function(testApp){
  describe("quote", function(){
    var quote,
        opts = {};
    
    beforeEach(function(done){
      testApp.fixture.registerAndSignIn().then(function(user){
        opts.user = user;

        return testApp.fixture.create("quote");
      }).then(function(data){
        quote = data.quotes[0];
        done();
      });
    });

    it("uses the conventional currency format", function(done){
      testApp.request.get("/quotes/" + quote.id).then(function(data){
        data.body.quotes.length.should.be.equal(1);

        var reqQuote = data.body.quotes[0];

        reqQuote.price.amount.should.be.equal(quote.price.amount);
        reqQuote.netPrice.amount.should.be.equal(quote.netPrice.amount);
        reqQuote.price.currency.should.be.equal(quote.price.currency);
        reqQuote.netPrice.currency.should.be.equal(quote.netPrice.currency);
        
        done();
      });
    });
  });
};
