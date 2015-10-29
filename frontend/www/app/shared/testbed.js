angular.module('civis.youpower')

.factory('Testbed', function($resource, Config) {
  var result = $resource(Config.host + '/api/testbed/:id', {id:'@_id'});

  result.prototype.isStockholm = function() {
    return this.name.indexOf('Stockholm') == 0;
  }

  return result;
});
