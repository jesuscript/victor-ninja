module.exports = function(testApp,opt){
  describe("using a bank transfer", function(){
    describe("once paid", function(){
      var paymentType, quote, charge;
      
      beforeEach(function(done){
        testApp.fixture.create("payment-type",{
          name: "bankTransfer",
          additionalDetails: [{
            bankDetails: [{
              currencyCode: "EUR",
              bankName: "RBS",
              sortCode: "12-34-56",
              accountNumber: "12345678"
            }]
          }]
        }).then(function(data){
          paymentType = data["payment-types"][0];
          return opt.createQuoteAndCharge({
            paymentType: paymentType.id
          });
        }).then(function(data){
          quote = data.quote;
          charge = data.charge;
        }).then(done);
      });

      it("creates a charge", function(){
        opt.testCharge(charge,quote,null,paymentType);
      });

      //DRY! 
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
};
