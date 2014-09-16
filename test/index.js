var should = require("should"),
    _ = require("lodash"),
    setup = require("./setup"),
    util = require("./util");

describe("Victor API", function(){
  before(function(done){
    this.timeout(10000);

    setup.initRoutingService(util).then(function(testApp){
      _.extend(util,{
        fixtureFactory: testApp.fixtureFactory,
        request: testApp.httpClient,
        trustedClient: testApp.trustedFortuneClient,
        client: testApp.fortuneClient,
        baseUrl: testApp.baseUrl
      }, testApp.fixtureFactory, testApp.httpClient);//for convenience
    }).then(function(){
      setup.wipeCollections();
    }).then(done);
  });
  beforeEach(function(){
    //util.disableConsole();
  });
  afterEach(function(done){
    setup.wipeCollections().then(done);
  });

  util.requireSpecs(__dirname, ["users"]);
});
