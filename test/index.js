var should = require("should"),
    _ = require("lodash"),
    setup = require("../lib"),
    util = require("../lib/util"),
    sinon = require("sinon");


describe("Victor API", function(){
  var testApp = setup(),
      fakes = {};
  
  before(function(done){
    this.timeout(10000);// the first run may be quite slow, but consequent runs are much faster

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

  //would be neat to make this a default for tests. not sure how yet
  util.requireSpecsInDir(__dirname, __filename, [testApp]);
});
