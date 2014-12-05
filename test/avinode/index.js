module.exports = function(testApp, testOpt){
  describe("avinode", function(){
    describe("indicative pricing job", function(){
      it("is created when a charter-request is POSTed", function(done){
        var create = testApp.fixture.create;

        create("charter-requests", {
          aircraftTypes: ["Turboprop"],
          user: testOpt.bob.id,
          requestLegs: create("request-legs", {
            deptAirport: create("airports", {airportCode: "HUY"}),
            arrAirport: create("airports", {airportCode: "YUH"}),
            passengers: 6,
            user: testOpt.bob.id
          }),
          quotes: create("quotes", {
            user: testOpt.bob.id
          })
        }).then(function(data){
          return testApp.fortuneClient.getJobs();
        }).then(function(data){
          console.log(JSON.stringify(data,null,2) );
        }).done(done);
      });
    });
  });
};
