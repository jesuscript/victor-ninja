module.exports = function(testApp, opt){
  describe("with stripe", function(){
    testApp.util.requireSpecsInDir(__dirname, [__filename], [testApp,opt]);
  });
};
