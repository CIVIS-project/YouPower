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
    fbShare : {
      method: 'POST',
      url: Config.host + '/api/user/postFB/:type/:id'
    }, 
    getPicture : {
      method: 'GET',
      url: Config.host + '/api/user/profilePicture/:userId'
    },
    profile : {
      method: 'POST',
      url: Config.host + '/api/user/profile'
    },
    getPendingInvites : {
      method: 'GET',
      url: Config.host + '/api/user/invites'
    },
    getUserProfile : {
      method: 'GET',
      url: Config.host + '/api/user/profile/:userId'
    },
    search : {
      method: 'GET',
      isArray: true, 
      url: Config.host + '/api/user/search'
    },
    mailInvitation : {
      method: 'POST', 
      url: Config.host + '/api/user/sendMail/:type'
    },
    mailHouseholdMember : {
      method: 'POST', 
      url: Config.host + '/api/user/sendMail/householdMember'
    }
  });
});
