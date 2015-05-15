angular.module('starter.controllers', [])

.controller('WelcomeCtrl', function($scope) {})

.controller('ActionsCtrl', function($scope) {})

.controller('HomeCtrl', function($scope) {})

.controller('CommunityCtrl', function($scope) {})

.controller('PerformanceCtrl', function($scope) {})

.controller('ChallengesCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('SettingsCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
