var timedRequest = require(
      "../../routing-service/lib/legacy-integration-service/legacyWrappers/timed-request.js"),
    lisHelpers = require(
      "../../routing-service/lib/legacy-integration-service/legacyWrappers/helpers.js"),
    _ = require("lodash"),
    when = require("when");

module.exports = function(testApp,parentOpt){
  describe("payment", function(){
    var opt = {
      createQuoteAndCharge: function(chargeData){
        var result = {};

        chargeData = chargeData || {};
        
        return testApp.fixture.create("quotes", {
          user: opt.bob.id
        }).then(function(data){
          result.quote = data.quotes[0];
          return testApp.request.post({
            url: "/charges",
            json: {
              charges: [{
                links: {
                  card: chargeData.cardId,
                  paymentType: chargeData.paymentType,
                  quote: result.quote.id
                },
                cvv: chargeData.cvv,
                invoiceRequired: true
              }]
            }
          });
        }).then(function(){
          return testApp.fortuneClient.getCharges({quote: result.quote.id.toString()});
        }).then(function(data){
          var charges = data.charges;
          charges.length.should.be.equal(1);
          result.charge = charges[0];

          return result;
        });
      },
      testCharge: function(charge,quote,card,paymentType){
        charge.links.quote.should.be.equal(quote.id);
        if(card) charge.links.card.should.be.equal(card.id);
        charge.links.paymentType.should.equal(paymentType.id);
        
        charge.amount.amount.should.be.equal(
          Math.round((1 + paymentType.feePercent/100) * quote.price.amount * 100) / 100
        );
        charge.amount.currency.should.be.equal(quote.price.currency);
        charge.refunded.should.be.equal(false);
        
        if(card) charge.providerReference.should.be.ok;
      }
    };

    beforeEach(function(){
      testApp.sandbox.stub(timedRequest,"post",function(opt){
        return when(mockPaymentConfirmation(opt));
      });

      testApp.sandbox.stub(lisHelpers, "getResource", function(reqUrl){
        return when(mockTransaction());
      });

      _.extend(opt,parentOpt);
    });

    testApp.util.requireSpecsInDir(__dirname, [__filename], [testApp, opt]);
  });

  function mockPaymentConfirmation(opt){
    var amount = opt.qs.amountStr.replace(/,/g,"").replace(/\\/g,""),
        currency = opt.qs.currency.replace(/,/g,"").replace(/\\/g,"");
    
    return {
      body: JSON.stringify({
        "SiteVersion": 2,
        "RepeatInfo": null,
        "IsRepeatable": false,
        "AmountPaid": amount,
        "AmountToCharge": amount,
        "Country": null,
        "Region": null,
        "PostCode": null,
        "City": null,
        "AddressLine2": null,
        "AddressLine1": null,
        "LastName": null,
        "FirstNames": null,
        "RedirectUrl": null,
        "SecurityKey": null,
        "FullResponse": null,
        "PaymentSystemOrderId": null,
        "PaymentSystemTransactionId": null,
        "PaymentSystemUniqueId": null,
        "ResponseDetails": null,
        "ResponseDate": null,
        "RequestDate": (new Date()).toISOString(),
        "ClientIP": null,
        "ClientIPType": null,
        "Currency": currency,
        "VictorUniqueId": null,
        "TransactionType": "PAYMENT",
        "TransactionCompleted": false,
        "TransactionState": "InitialRequestPending",
        "OrderState": "Charged",
        "PaymentSystemId": null,
        "UserId": opt.qs.userId,
        "RepeatTransactionParentId": null,
        "TransactionId": 13411,
        "odata.metadata": "https:\/\/v2-dev.flyvictor.com\/Services\/WcfDataService.svc\/$metadata#Transactions\/@Element"
      })
    };
  }

  function mockTransaction(){
    return {
      "value": [
        {
          "PaymentRuleDifference": "0.0000",
          "PaymentRuleTitle": null,
          "MarkUp": 0.0,
          "ExchangeRate": 1.0,
          "TotalPaid": "1050.0000",
          "Total": "1050.0000",
          "Amount": "1050.0000",
          "PaidCurrencyId": 2,
          "BaseCurrencyId": 2,
          "BaseTotal": "1050.0000",
          "BaseAmount": "1050.0000",
          "Quantity": 1,
          "Properties": null,
          "OrderTypeAssembly": "JetShare.Business.Payment.QuoteOrder, JetShare.Business, Version=1.0.4306.0, Culture=neutral, PublicKeyToken=null",
          "OrderType": "Quote",
          "EntityId": 51750,
          "TransactionId": 13411,
          "TransactionItemId": 14726,
          "PaidCurrency": {
            "IsVisible": true,
            "CurrencyImageUrl": "",
            "CurrencyCode": "EUR",
            "CurrencySymbol": "\u20ac",
            "CurrencyName": "Euros (\u20ac)",
            "CurrencyId": 2
          },
          "BaseCurrency": {
            "IsVisible": true,
            "CurrencyImageUrl": "",
            "CurrencyCode": "EUR",
            "CurrencySymbol": "\u20ac",
            "CurrencyName": "Euros (\u20ac)",
            "CurrencyId": 2
          }
        }
      ],
      "odata.metadata": "https:\/\/v2-dev.flyvictor.com\/Services\/WcfDataService.svc\/$metadata#TransactionItems"
    };
    
  }
};
