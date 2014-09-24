var should = require("should"),
    _ = require("lodash"),
    setup = require("../lib"),
    util = require("../lib/util"),
    sinon = require("sinon");


describe("Victor API", function(){
  var testApp = setup(),
      fakes = {};
  
  before(function(done){
    this.timeout(10000);

    testApp.initRoutingService().then(function(){
      testApp.wipeCollections();
    }).then(done);
  });

  beforeEach(function(){
    testApp.setupSandbox();
  });

  afterEach(function(done){
    testApp.reset();
    testApp.wipeCollections().then(done);
  });

  util.requireSpecsInDir(__dirname, __filename, [testApp]);
});
