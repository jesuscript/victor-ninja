var dotenv = require("dotenv"),
    _ = require("lodash"),
    mongo = require("mongodb").MongoClient,
    fs = require("fs"),
    when = require("when"),
    app = require("../routing-service/server"),
    fixtureFactory = require("./fixture-factory"),
    httpClient = require("./http-client"),
    util = require("./util"),
    sinon = require("sinon"),
    proxyquire = require("proxyquire").noCallThru();

module.exports = function(){
  var databases = {
    aircraftService: {
      env: "DB_AIRCRAFTSERVICE_URL"
    },
    airportService: {
      env: "DB_AIRPORTSERVICE_URL"
    },
    fps: {
      env: "DB_FLIGHTPRICINGSERVICE_URL"
    },
    fortuneEsb: {
      env: "DB_FORTUNE_ESB_URL"
    },
    monitoringService: {
      env: "DB_MONITORINGSERVICE_URL"
    },
    userService: {
      env: "DB_USERSERVICE_URL"
    }
  };

  var self = {
    initRoutingService: function(){
      var dbReady;

      return when.promise(function(resolve,reject){
        var service;
        
        setupEnv();
        setupMocks();
        dbReady = setupDb(),

        //util.disableConsole();//COMMENT THIS OUT FIRST IF SHIT STARTS BREAKING
        console.log(self);
        service = app(false);//not worker

        console.log("starting the server");
        
        self.baseUrl = "http://localhost:" + (self.port = process.env.PORT || 7012);
        
        service.app.listen(self.port, function(){
          util.log("routing service started on port", self.port);

          when.all([service.fortuneClientReady, service.trustedFortuneClientReady])
            .then(function(clients){

              util.enableConsole();

              resolve({
                fortuneClient: clients[0],
                trustedFortuneClient: clients[1]
              });  
            });
        });
      }).then(function(clients){
        return dbReady.then(function(){
          _.extend(self,{
            fixture: fixtureFactory(clients.trustedFortuneClient),
            request: httpClient(self.getAuthDetails(),self.baseUrl),
            fortuneClient: clients.fortuneClient,
            trustedFortuneClient: clients.trustedFortuneClient,
            baseUrl: self.baseUrl
          });

          return self;
        });
      });
    },
    setupFakes: function(){
      this.clock = sinon.useFakeTimers();
      this.sandbox = sinon.sandbox.create();
    },
    getAuthDetails: function(){
      var keystr = process.env.CLIENT_KEYS.split(";")[0].split(":");

      return {
        key: keystr[0],
        secret: keystr[1]
      };
    },
    wipeCollections: function(){
      return when.all(_.map(this.databases, function(db){
        return when.promise(function(resolve,reject){
          db.db.collections(function(err, collections){
            when.all(_.map(_.reject(collections, function(col){//reject
              return /^system/.test(col.collectionName);
            }),function(collection){//map
              return when.promise(function(resolve,reject){
                collection.remove({}, function(err){
                  return err ? reject(err) : resolve(err);
                });
              });
            })).then(resolve);
          });
        });
      })).then(function(){});
    },
    reset: function(){
      this.sandbox.restore();
      this.clock.restore();
    }
  };

  function setupEnv(){
    _.extend(process.env,
             dotenv.parse(fs.readFileSync("./routing-service/.config/develop")),
             dotenv.parse(fs.readFileSync("./.env-override")));
  }
  
  function setupMocks(){
    var fsStub = {
      "fs": {
        readFileSync: function(){ return "STUB"; }
      }
    };
    
    proxyquire("../routing-service/routes/status", fsStub);
    proxyquire("../routing-service/routes/file", fsStub);
  }
  
  function setupDb(){
    return when.all(_.map(this.databases, function(database){
      return when.promise(function(resolve, reject){
        mongo.connect(process.env[database.env], function(err, db){
          if(err){
            reject(err);
          }else{
            database.db = db;
            resolve();
          }
        });
      });
    }));
  }


  return self;
};


