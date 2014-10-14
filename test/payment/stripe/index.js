var util = require("../../../lib/util");

module.exports = function(testApp, opt){
  describe("with stripe", function(){
    util.requireSpecsInDir(__dirname, [__filename], [testApp,opt]);
  });
};
