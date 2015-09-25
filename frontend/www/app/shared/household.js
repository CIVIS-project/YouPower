angular.module('civis.youpower')

.factory('Household', function($resource, Config) {
  return $resource(Config.host + '/api/household/:id', {}, { 
    create : {
      method: 'POST',
      url: Config.host + '/api/household'
    },
    delete : {
      method: 'DELETE',
      url: Config.host + '/api/household/:id'
    },
    invite : {
      method: 'POST', 
      url: Config.host + '/api/household/invite/:userId'
    },
    responseInvite : {
      method: 'PUT', 
      url: Config.host + '/api/household/invite/:id'
    },
    removeMember : {
      method: 'PUT', 
      url: Config.host + '/api/household/removemember/:householdId/:userId'
    }, 
    update : {
      method: 'PUT', 
      url: Config.host + '/api/household/:id'
    }

  });
});
