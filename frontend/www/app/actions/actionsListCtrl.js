
angular.module('civis.youpower.actions').controller('ActionsListCtrl', ActionsListCtrl);

/* The controller used for sliding slider over various action lists.
 ----------------------------------------------*/
function ActionsListCtrl($scope, $state, $stateParams, $filter, $ionicPopup, $translate, Actions, $ionicSlideBoxDelegate) {

  $scope.slideIdx = $stateParams.index ? $stateParams.index : 0;

  $scope.comment = {text: '', show: false}

  $scope.actionsType = $stateParams.type; 

  $scope.actionsList = []; 

  if ($scope.currentUser){
    $scope.actionsList = $scope.actionsByType($scope.actionsType); 
    $ionicSlideBoxDelegate.update();
  }

  console.log($scope.actionsList);


  $scope.$on('Action loaded', function(events, args){ 
    $scope.actionsList = $scope.actionsByType($scope.actionsType); 
    $ionicSlideBoxDelegate.update();
  }); 

  $scope.fbShare = function(){

    console.log("fb share");

    FB.ui({
      method: 'share',
      link: 'https://app.civisproject.eu/frontend.html#/welcome/'
    }, function(response){
        if (response && !response.error_message) {
          console.log('Posting completed.');
        } else {
          console.log('Error while posting.');
        }
    });

  }
  
  //post action comment (under action details)
  $scope.postComment = function(action){

    Actions.postComment(
        {actionId: action._id},{comment:$scope.comment.text}).$promise.then(function(data){

          //clear input box
          $scope.comment = {text: '', show: false}; 
          //add action comment to local list 
          $scope.comments.unshift(data);

          $scope.addCommentPoints();

          $scope.actions[action._id].numComments++; 
    });
  }

  $scope.deleteComment = function(comment){

    Actions.deleteComment(
        {actionId: comment.actionId, commentId: comment._id }).$promise.then(function(data){

          //delete action from local list 
          $scope.comments.splice($scope.comments.indexOf(comment), 1);

          $scope.deductCommentPoints();

          $scope.actions[comment.actionId].numComments--; 
    });
  }

  //toggle like action
  $scope.likeAction = function(action){
    
    if (!action.userRating || action.userRating == 0){
      //like
      Actions.likeAction(
        {id: action._id}, {rating: 1}).$promise.then(function(data){

          action.userRating = 1; 
          action.numLikes++; 
      });
    }else{
      //unlike
      Actions.likeAction(
        {id: action._id}, {rating: 0}).$promise.then(function(data){

          action.userRating = 0; 
          action.numLikes--;
      });
    }
  }


  //toggle like action comment 
  $scope.likeComment = function(comment){

    if (!comment.userRating || comment.userRating == 0){
      //like
      Actions.likeComment(
        {actionId: comment.actionId, commentId: comment._id}, {rating: 1}).$promise.then(function(data){

          comment.userRating = 1;
          comment.numLikes++;
      });
    }else{
      //unlike
      Actions.likeComment(
        {actionId: comment.actionId, commentId: comment._id}, {rating: 0}).$promise.then(function(data){

          comment.userRating = 0;
          comment.numLikes--;
      });
    }
  }

  /*/
    Reschedule the pending date from Future to Now
    The original state is NOT validated! 
  /*/
  $scope.takeActionNow = function(action){
    
    $scope.postActionState(action._id, "pending", new Date());
    $scope.gotoYourActions();
  }

  /*/
    Change state from completed to inProgress
    The original state is NOT validated!
  /*/
  $scope.retakeAction = function(action){
    
    $scope.postActionState(action._id, "inProgress");
    $scope.gotoYourActions();
  }

  /*/
      No change of the remote/local action list now. The list is changed after the feedback form. 
      A user can still cancel (come back) after the click. 
  /*/
  $scope.actionCompleted = function(action){
    $state.go('main.actions.completed', {id: action._id});
  }
  $scope.actionAbandoned = function(action){
    $state.go('main.actions.abandoned', {id: action._id});
  }

  $scope.input = {}; 

  $scope.inputDaysAndReschedule = function(action){

    var alertPopup = $ionicPopup.show({
      title: "<span class='text-medium-large'>" + $translate.instant("Postpone_Action") + "</span>",
      scope: $scope, 
      template: "<form name='popup' class='text-medium text-center'>" + "<span translate>POSTPONE_ACTION</span>" + "<div><input name='inputDays' type='number' min='1' max='1000' class='text-center' ng-model='input.days' placeholder='a number of'> <span translate>days</span>! </div> <div class='errors' ng-show='!popup.inputDays.$valid' translate>NUMBER_1000</div></form>", 
      buttons: [
        { text: $translate.instant('Cancel') },
        { text: $translate.instant('Save'),
          type: 'button-dark',
          onTap: function(e) {
            if (!$scope.input.days) { 
              //don't allow the user to close unless he enters a number
              e.preventDefault();
            } else {  return $scope.input.days; }
          }
        }
      ]
    });
    alertPopup.then(function(res) {
      if(res) {
        $scope.reschduleAction(action, res); 
      }
    });
  }

  //reschedule an action 
  $scope.reschduleAction = function(action, pendingDays) {
      
      $scope.postActionState(action._id, "pending", $scope.addDays(pendingDays));
      $scope.gotoYourActions();
  }

  $scope.moreCommentCanBeLoaded = function(actionId) {

    return $scope.hasMoreComments(actionId);

  }

  $scope.loadMoreComments = function(actionId) {

    var size = ($filter('filter')($scope.comments, {actionId: actionId})).length;

    console.log("size: " + $scope.comments.length + ":" + size); 

    Actions.getComments({actionId: actionId, limit: $scope.nrToLoad, skip: size}).$promise.then(function(data){

      $scope.addMoreComments(data);

      if (data.length >= $scope.nrToLoad){
         $scope.setHasMoreComments(actionId);
      }else{
         $scope.setNoMoreComments(actionId);
      }

      console.log("load comments");
      console.log(data); 

      data.forEach(function(comment) {
        //load user picture
          //console.log(comment);
      });

      $scope.$broadcast('scroll.infiniteScrollComplete');

    });

  };



};

