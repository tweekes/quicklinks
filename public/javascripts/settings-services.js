angular.module('app')
    .factory('Settings',['RefDA', function(RefDA) {
      var s = {};
      s.createSettingsInstance = function( RefDA ) {
          var d = new Date();
          var obj = new RefDA;
          obj.dtype = "settings";
          obj.mainScreenColumns = 4;
          obj.mainScreenListFold = 4;
          obj.searchScreenResultNumberOfRows = 10;
          return obj;
      };

      s.getSettings = function(callback) {
        var select = {select:{ dtype: "settings"}};
        var settings = null;
        RefDA.query(select,function(r) {
            if (r && r.length > 0 ) {
                settings = r[0];
            } else {
                settings = s.createSettingsInstance(RefDA);
            }
            callback(settings);
        });
      };

      s.clone = function(s) {
        return JSON.parse(JSON.stringify(s));
      };
      return s;
}]);
