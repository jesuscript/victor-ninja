var util = require("../../lib/util");

module.exports = function(testApp){
  describe("payment", function(){
    var opt = {
      createQuoteAndCharge: function(card,chargeData){
        var result = {};

        chargeData = chargeData || {};
        
        return testApp.fixture.create("quote", {
          user: opt.bob.id
        }).then(function(data){
          result.quote = data.quotes[0];

          return testApp.request.post({
            url: "/charges",
            json: {
              charges: [{
                card: card.id,
                quote: result.quote.id,
                cvv: chargeData.cvv
              }]
            }
          });
        }).then(function(){
          return testApp.request.get("/cards/"+card.id+"/charges");
        }).then(function(res){
          var charges = res.body.charges;
          charges.length.should.be.equal(1);
          result.charge = charges[0];

          return result;
        });
      },
      testCharge: function(charge,quote,card,paymentType){
        charge.links.quote.should.be.equal(quote.id);
        charge.links.card.should.be.equal(card.id)
        charge.links.paymentType.should.equal(paymentType.id);
        
        charge.amount.amount.should.be.equal(
          Math.round((1 + paymentType.feePercent/100) * quote.price.amount * 100) / 100
        );
        charge.amount.currency.should.be.equal(quote.price.currency);
        charge.refunded.should.be.equal(false);
        charge.paid.should.be.equal(true);

        charge.providerReference.should.be.ok;
      }
    };
    
    beforeEach(function(done){
      testApp.fixture.registerUser({
        email: "bob@bob.com",
        password: "password"
      }).then(function(user){
        return testApp.request.signInAs(opt.bob = user);
      }).then(function(){
        done();
      });
    });
    
    util.requireSpecsInDir(__dirname, [__filename], [testApp, opt]);
  });
};
