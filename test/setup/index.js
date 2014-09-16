var dotenv = require("dotenv"),
    _ = require("lodash"),
    mongo = require("mongodb").MongoClient,
    fs = require("fs"),
    when = require("when"),
    app = require("../../routing-service/server"),
    fixtureFactory = require("./fixture-factory"),
    httpClient = require("./http-client"),
    util = require("../util"),
    proxyquire = require("proxyquire").noCallThru();

module.exports = _.bindAll({
  databases: {
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
  },
  initRoutingService: function(){
    var self = this,
        dbReady,
        service;
    
    return when.promise(function(resolve,reject){
      self._setupEnv();
      self._setupMocks();
      dbReady = self._setupDb(),

      util.disableConsole();//COMMENT THIS OUT FIRT IF SHIT STARTS BREAKING

      service = app(false);//not worker

      util.log("starting the server");
      
      var port = process.env.PORT || 7012;

      self.baseUrl = "http://localhost:" + port;
      
      service.app.listen(port, function(){
        util.log("routing service started on port", port);


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
        return {
          fixtureFactory: fixtureFactory(clients.trustedFortuneClient),
          httpClient: httpClient(self.getAuthDetails(),self.baseUrl),
          fortuneClient: clients.fortuneClient,
          trustedFortuneClient: clients.trustedFortuneClient,
          baseUrl: self.baseUrl
        };
      });
    });
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
  _setupEnv: function(){
    process.env = _.extend(dotenv.parse(fs.readFileSync("./routing-service/.config/develop")),
                           dotenv.parse(fs.readFileSync("./.env-override")));
  },
  _setupMocks: function(){
    var fsStub = {
      "fs": {
        readFileSync: function(){ return "STUB"; }
      }
    };
    
    proxyquire("../../routing-service/routes/status", fsStub);
    proxyquire("../../routing-service/routes/file", fsStub);
  },
  _setupDb: function(){
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
});
