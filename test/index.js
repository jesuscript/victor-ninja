var should = require("should"),
    when = require("when"),
    app = require("../routing-service/server"),
    worker = require("../routing-service/worker/worker"),
    dotenv = require("dotenv"),
    fs = require("fs"),
    _ = require("lodash"),
    ninja = require("fortune-ninja")({
      fixtureTemplates: require("../fixtures")
    }),
    proxyquire = require("proxyquire").noCallThru(),
    sinon = require("sinon");


describe("Victor API", function(){
  var testOpt = {},
      port = 7012,
      suitSandbox;


  before(function(done){
    this.timeout(10000);// the first run always times out; no idea why. consequent runs are ok

    setupEnv();
    
    setupStubs(suitSandbox = sinon.sandbox.create());
    
    startService(port).then(function(clients){
      return ninja.connect({
        databases: _.map([
          "DB_AIRCRAFTSERVICE_URL",
          "DB_AIRPORTSERVICE_URL",
          "DB_FLIGHTPRICINGSERVICE_URL",
          "DB_FORTUNE_ESB_URL",
          "DB_MONITORINGSERVICE_URL",
          "DB_USERSERVICE_URL"
        ], function(dbEnv){return process.env[dbEnv];}),
        fortuneClient: clients.trustedFortuneClient,
        baseUrl: "http://localhost:" + port
      });
    }).then(function(){
      return ninja.wipeCollections();
    }).then(done);
  });

  after(function(){
    suitSandbox.restore();
  });

  beforeEach(function(done){
    ninja.setupSandbox();
    
    ninja.fixture.create("users", {
      password: "password"
    }).then(function(data){
      testOpt.bob = _.extend(data.users[0], {password: "password"});

      return ninja.fortuneClient.createUserAuthenticationToken({
        username: testOpt.bob.email,
        password: testOpt.bob.password
      });
    }).then(function(data){
      var keystr = process.env.CLIENT_KEYS.split(";")[0].split(":");

      ninja.request.configure({
        oauth: {
          consumer_key: keystr[0],
          consumer_secret: keystr[1]
        },
        headers: {
          userauthtoken: data["user-authentication-tokens"][0].token
        }
      });

      done();
    });
  });

  afterEach(function(done){
    ninja.reset();
    ninja.wipeCollections().then(done);
  });

  //would be neat to make this a default for tests. not sure how yet
  ninja.util.requireSpecsInDir(__dirname, __filename, [ninja, testOpt]);
});



function setupStubs(sandbox){
  var fsStub = {
    "fs": {
      readFileSync: function(){ return "STUB"; }
    }
  };
  
  proxyquire("../routing-service/routes/status", fsStub);
  proxyquire("../routing-service/routes/file", fsStub);
  
  sandbox.stub(
    require("../routing-service/lib/legacy-integration-service/legacyWrappers/charter-requests.js"),
    "postCharterRequest"
  ).returns(function(request){
    return when.resolve(request);
  });;

  sandbox.stub(
    require("../routing-service/lib/legacy-integration-service/controllers/users"),
    "postUser"
  ).returns(function(request){
    return when.resolve(request.body);
  });
}

function setupEnv(){
  _.extend(process.env,
           dotenv.parse(fs.readFileSync("./routing-service/.config/develop")),
           dotenv.parse(fs.readFileSync("./.env-override")));
}

function startService(port){
  var service = app(false);
  // var workerService = worker(true); //disabled worker for now

  console.log("starting the server");
  return when.promise(function(resolve){
    service.app.listen(port, function(){
      console.log("routing service started on port", port);

      when.all([
        service.fortuneClientReady,
        service.trustedFortuneClientReady
      ]).then(function(clients){
        resolve({
          fortuneClient: clients[0],
          trustedFortuneClient: clients[1]
        });
      });
    });
  });
}
