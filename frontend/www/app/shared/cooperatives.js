angular.module('civis.youpower')

.factory('Cooperatives', function($resource, Config) {
  return $resource(Config.host + '/api/cooperative/:id', {id:'@id'},{
    addAction: {
      method: 'POST',
      url: Config.host + '/api/cooperative/:id/action'
    }
  });
});
