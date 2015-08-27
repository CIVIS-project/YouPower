angular.module('civis.youpower')

.factory('Actions', function($resource, Config) {
  return $resource(Config.host + '/api/user/action/suggested', {}, {
    getActionById : {
      method: 'GET',
      url: Config.host + '/api/action/:id'
    },
    postComment : {
      method: 'POST',
      url: Config.host + '/api/action/:actionId/comment'
    },
    deleteComment : {
      method: 'DELETE',
      url: Config.host + '/api/action/:actionId/comment/:commentId'
    },
    likeComment : {
      method: 'PUT',
      url: Config.host + '/api/action/:actionId/comment/:commentId/rate'
    },
    getComments : {
      method: 'GET',
      isArray: true,
      url: Config.host + '/api/action/:actionId/comments'
    },
    // 'query': {method: 'GET', isArray: false }
  });
});

