var timedRequest = require(
  "../../routing-service/lib/legacy-integration-service/legacyWrappers/timed-request.js"),
    lisHelpers = require(
      "../../routing-service/lib/legacy-integration-service/legacyWrappers/helpers.js"),
    _ = require("lodash"),
    when = require("when");


module.exports = function(testApp,parentOpt){
  describe("payment", function(){
    var opt = {
      createQuoteAndCharge: function(customOpt){
        var result = {};

        customOpt = customOpt || {};

        return testApp.fixture.create("quotes", _.extend({
          user: opt.bob.id
        }, customOpt.quoteData)).then(function(data){
          result.quote = data.quotes[0];

          return testApp.fortuneClient.getQuote(result.quote.id.toString(),{
            include: "paymentFees"
          });
        }).then(function(data){
          opt.mockLegacyTransactionItems({
            amount: (result.total = _.find(data.linked["payment-fees"], function(fee){
              return fee.links.paymentType === customOpt.paymentType;
            }).total).amount.toFixed(4)
          });

          opt.mockLegacyPaymentConfirmation();

          return testApp.request.post({
            url: "/charges",
            json: {
              charges: [{
                links: {
                  card: customOpt.cardId,
                  paymentType: customOpt.paymentType,
                  quote: result.quote.id
                },
                cvv: customOpt.cvv,
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
      },
      mockLegacyTransactionItems: function(fOpts){
        fOpts = fOpts || {};
        testApp.sandbox.stub(lisHelpers, "getResource", function(reqUrl){
          return when(mockTransactionItems(fOpts));
        });
      },
      mockLegacyPaymentConfirmation: function(){
        testApp.sandbox.stub(timedRequest,"post",function(opt){
          return when(mockPaymentConfirmation(opt));
        });
      }
    };

    beforeEach(function(){
      _.extend(opt,parentOpt);
    });

    testApp.util.requireSpecsInDir(__dirname, [__filename], [testApp, opt]);
  });

  function mockPaymentConfirmation(opt){
    var cleanse = function(str){
      return str.replace(/,/g,"").replace(/\\/g,"").replace(/'/g, "");
    };
    var amount = cleanse(opt.qs.amountStr),
        currency = cleanse(opt.qs.currency);

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

  function mockTransactionItems(fOpts){
    var paid = fOpts.amount || "1050.0000";
    
    return {
      "value": [
        {
          "PaymentRuleDifference": "0.0000",
          "PaymentRuleTitle": null,
          "MarkUp": 0.0,
          "ExchangeRate": 1.0,
          "TotalPaid": paid,
          "Total": paid,
          "Amount": paid,
          "PaidCurrencyId": 2,
          "BaseCurrencyId": 2,
          "BaseTotal": paid,
          "BaseAmount": paid,
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
