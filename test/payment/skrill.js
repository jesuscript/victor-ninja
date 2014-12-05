var requesto = require("requesto");

module.exports = function(testApp, opt){
  describe("with skrill", function(){
    var skrillRegUrl, skrillCCUrl, tokenData, paymentProvider, cards, card,paymentType,
        usageType = "personal",
        cvv = 1234;
    
    beforeEach(function(done){
      this.timeout(5000);
      
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
              "number": "370000000000002",
              "expiry": "10/2017",
              "cvv": cvv
            }
          },
          "id": 1
        }
      }).then(function(res){
        tokenData = res.body.result.account;
        return testApp.fixture.create("payment-providers", {name: "skrill"});
      }).then(function(data){
        paymentProvider = data["payment-providers"][0];

        return testApp.fixture.create("payment-types", {
          paymentProvider: paymentProvider.id,
          name: "amex"
        });
      }).then(function(data){
        paymentType = data["payment-types"][0];

        return testApp.request.post({
          url: "/card-tokens",
          json: {
            "card-tokens": [{
              token: tokenData.token,
              cardUsageType: usageType,
              last4: tokenData.last,
              expiryYear: tokenData.expiry_year,
              expiryMonth: tokenData.expiry_month,
              links: {
                paymentType: paymentType.id,
                user: opt.bob.id
              }
            }]
          }
        });
      }).catch(function(err){ console.trace(err); }).then(function(){
        return testApp.request.get("/users/"+opt.bob.id+"/cards");
      }).then(function(data){
        cards = data.body.cards;
        card = cards[0];

        cards.length.should.be.equal(1);
        
        done();
      }).catch(function(err){ console.trace(err); });
    });

    describe("once registered", function(){
      it("creates a card resource", function(){
        card.links.user.should.be.equal(opt.bob.id);
        card.links.cardToken.should.be.equal(tokenData.token);
        card.links.paymentType.should.be.equal(paymentType.id);
        card.usageType.should.be.equal(usageType);
        card.last4.should.be.equal("0002");
        card.expiresAt.should.be.eql({
          date: "" + tokenData.expiry_year + "-" + tokenData.expiry_month + "-01",
          time: "00:00",
          timeZone: "+00:00"
        });
      });
    });

    describe("once paid", function(){
      var quote, charge;
      
      beforeEach(function(done){
        this.timeout(5000);

        opt.createQuoteAndCharge({
          cvv: cvv,
          cardId: card.id,
          paymentType:"amex"
        }).then(function(data){
          quote = data.quote;
          charge = data.charge;

          done();
        }).done();
      });

      it("creates a charge", function(){
        opt.testCharge(charge,quote,card,paymentType);

        charge.additionalDetails.providerInfo.uniqueid.should.be.ok;
        charge.additionalDetails.providerInfo.shortid.should.be.ok;
        charge.additionalDetails.providerInfo.method.should.be.equal("creditcard");
        charge.additionalDetails.providerInfo.type.should.be.equal("debit");
      });

      describe("transaction", function(){
        var transaction, transactionItems;
        
        beforeEach(function(done){
          testApp.fortuneClient.getTransactions({},//{user: opt.bob.id.toString()},
                                                {
            include: "transactionItems"
          }).then(function(data){
            console.log(data);
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
};
