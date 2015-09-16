angular.module('civis.youpower')

.factory('User', function($resource, Config) {
  return $resource(Config.host + '/api/user/profile', {}, {
    actionState : {
      method: 'POST',
      url: Config.host + '/api/user/action/:actionId'
    },
    feedback : {
      method: 'POST',
      url: Config.host + '/api/feedback'
    },
    getPicture : {
      method: 'GET',
      url: Config.host + '/api/user/profilePicture/:userId'
    },
    profile : {
      method: 'POST',
      url: Config.host + '/api/user/profile'
    },
  });
});
