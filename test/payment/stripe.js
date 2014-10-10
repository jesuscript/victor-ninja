var exec = require("child_process").exec,
    stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_jh8IAZJpDKV8fi6o6PBNiVha");

module.exports = function(testApp, opt){
  describe("with stripe", function(){
    describe("using a card", function(){
      var cardToken,paymentProvider,paymentType,card,
          usageType = "personal";
      
      beforeEach(function(done){
        this.timeout(6000);

        stripe.tokens.create({
          card: {
            number: "4242424242424242",
            name: "Bob Bob",
            exp_month: "03",
            exp_year: "15",
            cvc: "000"
          }
        },function(err, token){
          if(err){
            throw new Error(err);
          } else {
            testApp.fixture.create("payment-provider", {name: "stripe"}).then(function(data){
              paymentProvider = data["payment-providers"][0];

              return testApp.fixture.create("payment-type", {
                paymentProvider: paymentProvider.id
              });
            }).then(function(data){
              paymentType = data["payment-types"][0];
              return testApp.request.post({ //creating a card
                url:"/card-tokens",
                json: {
                  "card-tokens": [{
                    paymentType: paymentType.id,
                    token: token.id,
                    cardUsageType: usageType,
                    user: opt.bob.id
                  }]
                }
              });
            }).catch(function(err){ console.trace(err); }).then(function(res){
              cardToken = res.body["card-tokens"][0];
              return testApp.request.get("/users/"+opt.bob.id+"/cards");
            }).then(function(data){
              var cards = data.body.cards;
              cards.length.should.be.equal(1);
              
              card = cards[0];
              done();
            });
          }
        });
      });
      
      describe("once registered", function(){
        it("creates a card resource", function(){
          card.links.user.should.be.equal(opt.bob.id);
          card.links.cardToken.should.be.equal(cardToken.id);
          card.links.paymentProvider.should.be.equal(paymentProvider.id);
          card.links.paymentType.should.be.equal(paymentType.id);
          card.usageType.should.be.equal(usageType);
          card.last4.should.be.equal("4242");
          card.expiresAt.should.be.eql({
            date: "2015-03-01",
            time: "00:00",
            timeZone: 0
          });
          card.name.should.be.equal("Bob Bob");
        });

        it("stores stripe customer id on the user", function(done){
          testApp.request.get("/users/" + opt.bob.id).then(function(data){
            data.body.users[0].additionalDetails.stripeId.should.be.ok;
            done();
          });
        });
      });

      describe("once paid", function(){
        var quote, charge;
        
        beforeEach(function(done){
          this.timeout(5000);

          opt.createQuoteAndCharge(card).then(function(data){
            quote = data.quote;
            charge = data.charge;

            done();
          });
        });
        
        it("creates a charge", function(){
          opt.testCharge(charge,quote,card,paymentType);
        });

        //DRY
        describe("transaction", function(){
          var transaction, transactionItems;
          
          beforeEach(function(done){
            testApp.trustedFortuneClient.getTransactions({user: opt.bob.id.toString()},{
              include: "transactionItems"
            }).then(function(data){
              transaction = data.transactions[0];
              transactionItems = data.linked["transaction-items"];
              done();
            });
          });

          it("should exist", function(){
            transaction.should.be.ok;
          });

          it("should have a transaction item", function(){
            transactionItems.length.should.be.equal(1);
          });
        });
      });
    });
  });
};
