var exec = require("child_process").exec,
    stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_jh8IAZJpDKV8fi6o6PBNiVha");

//TODO: move card registration into a beforeEach
//TODO: test to check user's additionalDetails.stripeId

module.exports = function(testApp, opt){
  describe("with stripe", function(){
    describe("using a card", function(){
      it("can be registered", function(done){
        this.timeout(5000);
        
        stripe.tokens.create({
          card: {
            number: "4242424242424242",
            name: "Bob Bob",
            exp_month: "03",
            exp_year: "15",
            cvc: "000"
          }
        },function(err, token){
          var cardToken, paymentProvider,
              usageType = "personal";
          
          if(err){
            throw new Error(err);
          } else {
            testApp.fixture.create("payment-provider", {name: "stripe"}).then(function(data){
              paymentProvider = data["payment-providers"][0];

              return testApp.request.post({//token, 
                url:"/card-tokens",
                json: {
                  "card-tokens": [{
                    paymentProvider: paymentProvider.id,
                    token: token.id,
                    cardUsageType: usageType,
                    user: opt.bob.id
                  }]
                }
              });
            }).catch(function(err){ console.trace(err); }).then(function(res){
              cardToken = res.body["card-tokens"][0];
              
              return testApp.request.get("/users/"+opt.bob.id+"/cards");
            }).catch(function(err){ console.trace(err); }).then(function(data){
              var cards = JSON.parse(data.body).cards,
                  card = cards[0];

              cards.length.should.be.equal(1);
              card.links.user.should.be.equal(opt.bob.id);
              card.links.cardTokens.length.should.be.equal(1);
              card.links.cardTokens[0].should.be.equal(cardToken.id);
              card.links.paymentProvider.should.be.equal(paymentProvider.id);
              card.usageType.should.be.equal(usageType);
              card.last4.should.be.equal("4242");
              card.expiresAt.should.be.eql({
                date: "2015-03-01",
                time: "00:00",
                timeZone: 0
              });
              card.name.should.be.equal("Bob Bob");

              done();
            }).catch(function(err){ console.trace(err); });
          }
        });
      });
    });
  });
};
