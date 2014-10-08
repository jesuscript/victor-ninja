module.exports = {
  user: {
    "phone":"1234",
    "password":"password",
    "firstName":"",
    "country":"af",
    "title":"Mr",
    "languageCode":"en-GB",
    "email":"hoanglonguk+1231@gmail.com",
    "charterFrequency":{"min":1,"max":10},
    "lastName":"Asddas"
  },
  "apns-token":{
    "token": "abc-123",
    sandbox: false
  },
  quote: {
    quoteType: "Charter",
    isBooked: false,
    price: {
      amount: 1296,
      currency: "EUR"
    },
    netPrice: {
      amount: 1234,
      currency: "EUR"
    },
    isVisibleToUser: true,
    seatsOnJet: 4,
    seatsToConfirm: 0 //??
  },
  "quote-leg": {
  },
  flight: {
  },
  "payment-provider":{
    name: "stripe"
  },
  "payment-type":{
    name: "visa",
    feePercent: 10
  }
};
