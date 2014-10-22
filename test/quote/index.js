var _ = require("lodash");

module.exports = function(testApp, testOpt){
  describe("quote", function(){
    var quote;
    
    beforeEach(function(done){
      return testApp.fixture.create("quotes",{user: testOpt.bob.id}).then(function(data){
        quote = data.quotes[0];
        done();
      }).catch(function(err){ console.trace(err); });
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

    describe("payment fees", function(){
      var paymentFees, amexFee, visaFee, quoteFeeRequestBody;
      
      var skrillFeePercent = 20,
          stripeFeePercent = 10;

      beforeEach(function(done){
        
        testApp.fixture.create("payment-types", [{
          name: "visa",
          paymentProvider: testApp.fixture.create("payment-providers",{ name: "stripe" }),
          feePercent: stripeFeePercent
        }, {
          name: "amex",
          paymentProvider: testApp.fixture.create("payment-providers",{ name: "skrill" }),
          feePercent: skrillFeePercent
        }]).then(function(){
          //TODO: nest this under "when requested for a quote"

          return testApp.request.get({
            url: "/quotes/"+quote.id,
            qs: {
              include: "paymentFees,user"
            }
          });
        }).then(function(res){
          quoteFeeRequestBody = res.body;
          
          var paymentFees = quoteFeeRequestBody.linked["payment-fees"];

          paymentFees.length.should.be.equal(2);

          var feeForType = function(type){
            return _.find(paymentFees, function(fee){
              return fee.links.paymentType === type;
            });
          };

          amexFee = feeForType("amex"),
          visaFee = feeForType("visa");
        }).then(done);
      });
      
      it("link to a quote", function(done){
        amexFee.links.quote.should.be.equal(quote.id);
        visaFee.links.quote.should.be.equal(quote.id);
        
        done();
      });

      it("are linked to by quote", function(){
        _.intersection(
          quoteFeeRequestBody.quotes[0].links.paymentFees,[visaFee.id,amexFee.id]
        ).length.should.be.equal(2);
      });

      it("are calculated correctly", function(){
        var skrillProviderFee = quote.price.amount * (skrillFeePercent/100),
            skrillTotal = quote.price.amount + skrillProviderFee,
            stripeProviderFee = quote.price.amount * (stripeFeePercent/100),
            stripeTotal = quote.price.amount + stripeProviderFee;
        
        amexFee.amount.amount.should.be.equal(quote.price.amount);
        amexFee.amount.currency.should.be.equal(quote.price.currency);
        amexFee.providerFee.amount.should.be.equal(skrillProviderFee);
        amexFee.total.amount.should.be.equal(skrillTotal);

        visaFee.amount.amount.should.be.equal(quote.price.amount);
        visaFee.amount.currency.should.be.equal(quote.price.currency);
        visaFee.providerFee.amount.should.be.equal(stripeProviderFee);
        visaFee.total.amount.should.be.equal(stripeTotal);
      });
    });

  });
};
