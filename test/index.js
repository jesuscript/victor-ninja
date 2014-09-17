var should = require("should"),
    _ = require("lodash"),
    setup = require("../lib"),
    util = _.clone(require("../lib/util")),
    sinon = require("sinon");

describe("Victor API", function(){
  before(function(done){
    this.timeout(10000);

    setup.initRoutingService().then(function(testApp){
      _.extend(util,testApp);//for convenience
    }).then(function(){
      setup.wipeCollections();
    }).then(done);
  });
  beforeEach(function(){
    _.extend(util,{
      sandbox: sinon.sandbox.create(),
      clock: sinon.useFakeTimers()
    });
  });
  afterEach(function(done){
    util.sandbox.restore();
    util.clock.restore();
    setup.wipeCollections().then(done);
  });

  util.requireSpecs(__dirname, ["users"]);
});
