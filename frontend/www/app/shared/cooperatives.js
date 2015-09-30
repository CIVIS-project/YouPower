angular.module('civis.youpower')

.factory('Cooperatives', function($resource, $http, Config) {
  var result = $resource(Config.host + '/api/cooperative/:id', {id:'@id'},{
    update: {
      method: 'PUT'
    },
    addAction: {
      method: 'POST',
      url: Config.host + '/api/cooperative/:id/action'
    },
    updateAction: {
      method: 'PUT',
      url: Config.host + '/api/cooperative/:id/action/:actionId'
    },
    deleteAction: {
      method: 'DELETE',
      url: Config.host + '/api/cooperative/:id/action/:actionId'
    }
  });

  result.prototype.getEnergyData = function(type, granularity, period){
    var meterId = this.meters[type];
    return $http.get("https://app.energimolnet.se/api/2.0/consumptions/" +
      meterId + "/" +
      granularity + "/" +
      period + "?metrics=energy",{
        cached:true,
        headers:{
          'Authorization':'OAuth a4f4e751401477d5e3f1c68805298aef9807c0eae1b31db1009e2ee90c6e'
        }

      })
  };

  return result;
});
