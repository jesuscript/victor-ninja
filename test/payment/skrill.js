var requesto = require("requesto");

module.exports = function(testApp, opt){
  describe("with skrill", function(){
    var skrillRegUrl, skrillCCUrl, tokenData, paymentProvider,
        usageType = "personal";
    
    beforeEach(function(done){
      skrillRegUrl = process.env.SKRILL_JSON_RPC_URL + process.env.SKRILL_MERCHANT_ID + "/" +
        process.env.SKRILL_CREDITCARD_REGISTER_CHANNEL_ID + "/creditcard/",
      skrillCCUrl = process.env.SKRILL_JSON_RPC_URL + process.env.SKRILL_MERCHANT_ID + "/" +
        process.env.SKRILL_CREDITCARD_CHANNEL_ID + "/creditcard/";
      
      requesto.post({
        url: skrillRegUrl,
        json: {
          "jsonrpc": "2.0",
          "method": "register",
          "params": {
            "account": {
              "number": "4111111111111111",
              "expiry": "10/2016",
              "cvv": "123"
            }
          },
          "id": 1
        }
      }).then(function(res){
        tokenData = res.body.result.account;
        
        return testApp.fixture.create("payment-provider", {name: "skrill"});
      }).then(function(data){
        paymentProvider = data["payment-providers"][0];

        return testApp.request.post({
          url: "/card-tokens",
          json: {
            "card-tokens": [{
              paymentProvider: paymentProvider.id,
              token: tokenData.token,
              cardUsageType: usageType,
              user: opt.bob.id,
              last4: tokenData.last,
              expiryYear: tokenData.expiry_year,
              expiryMonth: tokenData.expiry_month
            }]
          }
        });
      }).then(function(){
        done();
      });
    });
    describe("once registered", function(){
      it("creates a card resource", function(done){
        return testApp.request.get("/users/"+opt.bob.id+"/cards").then(function(data){
          var cards = JSON.parse(data.body).cards,
              card = cards[0];

          cards.length.should.be.equal(1);
          card.links.user.should.be.equal(opt.bob.id);
          card.links.cardTokens.length.should.be.equal(1);
          card.links.cardTokens[0].should.be.equal(tokenData.token);
          card.links.paymentProvider.should.be.equal(paymentProvider.id);
          card.usageType.should.be.equal(usageType);
          card.last4.should.be.equal("1111");
          card.expiresAt.should.be.eql({
            date: "" + tokenData.expiry_year + "-" + tokenData.expiry_month + "-01",
            time: "00:00",
            timeZone: 0
          });


          done();
        }).catch(function(err){ console.trace(err); });

        done();
      });
    });
  });
};
