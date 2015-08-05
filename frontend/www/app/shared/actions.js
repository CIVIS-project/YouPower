angular.module('civis.youpower')

.factory('Actions', function($resource, $firebaseArray, AuthService, $q) {
  /* Dummy for old Firebase data
   ----------------------------------------------*/
  // return {
  //   get: function(filter) {
  //     return $q(function(resolve,reject) {
  //       var actionsRef = new Firebase('https://youpower.firebaseio.com/actions');
  //       $firebaseArray(actionsRef).$loaded().then(function(actions){
  //         resolve(
  //           _.find(actions,function(action){
  //             return action && filter.id == action.id;
  //           })
  //         );
  //       });
  //     })
  //   }
  // }

  /* Use this for real data
   ----------------------------------------------*/
  return $resource(HOST + '/api/user/action/suggested', {}, {
    postComment : {
      method: 'POST', 
      url: HOST + '/api/action/:actionId/comment'
    },
    getComments : {
      method: 'GET', 
      isArray: true,
      url: HOST + '/api/action/:actionId/comments'
    },
    // 'query': {method: 'GET', isArray: false }
  });
});

