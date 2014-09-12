var setup = require("./setup"),
    util = require("./util");

describe("Victor API", function(){
  before(function(done){
    this.timeout(6000);
    setup.initRoutingService(util).then(done);
  });
  beforeEach(function(){
    util.disableConsole();
  });
  afterEach(function(){
    util.enableConsole();
  });

  util.requireSpecs(__dirname, ["users"]);
});
