angular.module('starter.controllers').controller('WelcomeCtrl', function($translate, $scope) {

	$scope.changeLanguage = function (langKey) {
		$translate.use(langKey);
	};

}); 

angular.module('starter.controllers').controller('ActionsCtrl', function($scope) {});

angular.module('starter.controllers').controller('HomeCtrl', function($scope) {});

angular.module('starter.controllers').controller('CommunityCtrl', function($scope) {});

angular.module('starter.controllers').controller('PerformanceCtrl', function($scope) {});

angular.module('starter.controllers').controller('ChallengesCtrl', function($scope) {});

angular.module('starter.controllers').controller('ChatsCtrl', function($scope, Chats) {
	$scope.chats = Chats.all();
	$scope.remove = function(chat) {
		Chats.remove(chat);
	}
});

angular.module('starter.controllers').controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
	$scope.chat = Chats.get($stateParams.chatId);
});
