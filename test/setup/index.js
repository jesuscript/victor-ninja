var dotenv = require("dotenv"),
    _ = require("lodash"),
    fs = require("fs"),
    when = require("when"),
    app = require("../../routing-service/server"),
    proxyquire = require("proxyquire").noCallThru();

module.exports = _.bindAll({
  initRoutingService: function(util){
    var self = this;

    return when.promise(function(resolve,reject){
      self._setupEnv();
      self._setupMocks();

      util.disableConsole();

      var server = app(false);//not worker

      util.log("starting the server");      
      server.listen(process.env.PORT || 7012, function(){
        util.log("routing service started");

        util.enableConsole();
        resolve();
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
  }
});
