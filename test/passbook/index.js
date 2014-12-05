var passbookLogic = require("../../routing-service/lib/user-service/logic/passbook");

module.exports = function(testApp,testOpt){
  describe("passbook", function(){
    var fixtures;
    
    beforeEach(function(done){
      var create = testApp.fixture.create;
      
      create("flights",{
        deptAirport: create("airports", {airportCode: "HUY"}),
        arrAirport: create("airports", {airportCode: "YUH"}),
        seatAllocations: create("seat-allocations", {
          passenger: create("passengers", {user: testOpt.bob.id})
        }),
        arrHandler: create("handlers", {name: "arr-hand"}),
        deptHandler: create("handlers", {name: "dept-hand"}),
        crew: create("flight-crew", [
          {rank: "Captain",name: "Hook",phone: "1234567890"},
          {rank: "Attendant",name: "Parrot",phone: "0987654321"}
        ]),
        quoteLeg: create("quote-legs",{
          deptDate: { date: '2014-10-30', time: '11:16', timeZone: "+00:00" }
        }),
        user: testOpt.bob.id
      }).then(function(data){
        fixtures = data;
      }).then(done);
    });

    it("can be created", function(done){
      this.timeout(2000);
      var createPass = passbookLogic.createPass;
      
      testApp.sandbox.stub(passbookLogic, "createPass", function(){
        return createPass.apply(null, arguments).then(function(res){
          var result = res;
          return res;
        });
      });
      
      testApp.request.post("/passbook-passes",{
        json: {
          "passbook-passes":[{
            links: {
              flight: fixtures.flights[0].id,
              passenger: fixtures.passengers[0].id
            }
          }]
        }
      }).then(function(res){
        res.body["passbook-passes"].length.should.be.equal(1);
      }).done(done);
    });
  });
};
