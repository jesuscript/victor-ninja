module.exports = function(testApp,testOpt){
  describe("users", function(){
    testApp.util.requireSpecsInDir(__dirname, [__filename], [testApp, testOpt]);
  });
};

