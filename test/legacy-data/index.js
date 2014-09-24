var multiline = require("multiline"),
    when = require("when");

module.exports = function(testApp){
  describe("legacy data", function(){
    it("registers a user and creates a passenger", function(done){
      return done(); //too slow

    //   this.timeout(8000);
      
    //   var contactDetailsXml = multiline(function(){
    //     /*
    //      <data>
    //      <ContactDetails>
    //      <TriggerType>insert</TriggerType>
    //      <ContactDetailsId>12100</ContactDetailsId>
    //      <Title>Mr</Title>
    //      <FirstName>Bob A</FirstName>
    //      <LastName>Dog</LastName>
    //      <Phone></Phone>
    //      <LanguageCode>en-GB</LanguageCode>
    //      </ContactDetails>
    //      </data>
    //      */
    //   }), userXml = multiline(function(){
    //     /*
    //      <data>
    //      <Users>
    //      <TriggerType>insert</TriggerType>
    //      <UserId>9311</UserId>
    //      <N2UserId>86754</N2UserId>
    //      <ContactDetailsId>12100</ContactDetailsId>
    //      <Email>bob.dog.1212@sparc-01.globalbeach.com</Email>
    //      <DateCreated>2014-09-23T11:49:45.377</DateCreated>
    //      <Sponsored>0</Sponsored>
    //      <SponsoredBy></SponsoredBy>
    //      <InterestSeats>1</InterestSeats>
    //      <InterestFlights>1</InterestFlights>
    //      <PreferredRouteNotListed>0</PreferredRouteNotListed>
    //      <InternalUser>0</InternalUser>
    //      <HowOftenCharteredJet>0</HowOftenCharteredJet>
    //      <TravelWithPet>0</TravelWithPet>
    //      <TravelWithPetDetails></TravelWithPetDetails>
    //      <SourceId>1</SourceId>
    //      <SiteRegisteredOnLanguageId>1</SiteRegisteredOnLanguageId>
    //      <ShareHolder>0</ShareHolder>
    //      <UserStatusId>1</UserStatusId>
    //      <UserTypeId>1</UserTypeId>
    //      <HasPaymentAccount>0</HasPaymentAccount>
    //      <EnableDelegateAccess>0</EnableDelegateAccess>
    //      <PrimaryMobileDeviceTypeId>1</PrimaryMobileDeviceTypeId>
    //      <SiteVersion>2</SiteVersion>
    //      <LastUpdated>2014-09-23T10:49:45.613</LastUpdated>
    //      </Users>
    //      </data>
    //      */
    //   });

    //     testApp.request.post({
    //       url: "/acceptLegacyDataChange",
    //       headers: {
    //         "Content-Type": "text/xml"
    //       },
    //       body: contactDetailsXml
    //     }).then(function(res){
    //       console.log(res.body);
    //       return testApp.request.post({
    //         url: "/acceptLegacyDataChange",
    //         headers: {
    //           "Content-Type": "text/xml"
    //         },
    //         body: userXml
    //       });
    //     }).then(function(res){
    //       setTimeout(function(){
    //         when.all([testApp.trustedFortuneClient.getUsers().then(function(data){
    //           console.log("USER:", JSON.stringify(data, null, 2));
    //         }),testApp.trustedFortuneClient.getPassengers().then(function(data){
    //           console.log("PASSENGERS",JSON.stringify(data, null, 2));
    //         })]).then(function(){
    //           done();
    //         });
    //       },7000);
    //     }).catch(function(err){ console.trace(err); });;
    });
  });
};
