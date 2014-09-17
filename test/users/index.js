var when = require("when"),
    proxyquire = require("proxyquire"),
    ObjectID = require("mongodb").ObjectID;

module.exports = function(util){
  describe("users", function(){
    var credentials = {
      username: "bob@bob.com",
      password: "password"
    }, bob;

    beforeEach(function(done){
      util.disableConsole();
      util.fixture.registerUser({
        email: credentials.username,
        password: credentials.password
      }).then(function(data){
        bob = data.users[0];
        util.enableConsole();
        done();
      });
    });

    it("should be able to authenticate", function(done){
      util.request.post({
        url: "/user-authentication-tokens",
        json: {
          "user-authentication-tokens": [credentials]
        }
      }).then(function(res){
        res.body["user-authentication-tokens"].should.be.an.Array;
        res.body["user-authentication-tokens"].length.should.be.equal(1);
        res.body["user-authentication-tokens"][0].token.should.be.a.String;
        done();
      });
    });

    it("should be able to send a notification", function(done){
      util.fixture.create("apns-token", {user: bob.id}).then(function(res){
        var apnsToken = res["apns-tokens"][0],
            apn = require("../../routing-service/lib/user-service/node_modules/apn"),
            createDevice = util.sandbox.spy(
              require("../../routing-service/lib/user-service/logic/apns-token.js"),
              "createDevice"
            );
        
        util.sandbox.stub(apn.Connection.prototype,"pushNotification", function(notification,device){
          try{
            var token = createDevice.args[0][0];

            token.token.should.be.equal(apnsToken.token);
            token.user.toString().should.be.equal(bob.id);
            notification.should.be.ok;
            device.should.be.ok;
            done();
          }catch(e){
            console.trace(e);
          }
        });

        util.request.post({
          url: "/messages",
          json: {
            messages:[{
              sender: bob.id,
              recipient: bob.id,
              shortMessage: "hello bob",
              screen: "/charter-requests"
            }]
          }
        }).then(function(res){
          util.clock.tick(10000);
        });
      }).catch(function(err){ console.trace(err); });;
    });
  });
};

