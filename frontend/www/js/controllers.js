controllers.controller('WelcomeCtrl', WelcomeCtrl);


function WelcomeCtrl($translate, $scope, personalProfile) {

	$scope.changeLanguage = function (langKey) {
		$translate.use(langKey);
	};

	$scope.myObject = personalProfile.myObject;

}; 

controllers.controller('ActionsCtrl', function($scope) {});

controllers.controller('HomeCtrl', function($scope) {});

controllers.controller('CommunityCtrl', function($scope) {});

controllers.controller('PerformanceCtrl', function($scope) {});

controllers.controller('ChallengesCtrl', function($scope) {});

controllers.controller('ChatsCtrl', function($scope, Chats) {
	$scope.chats = Chats.all();
	$scope.remove = function(chat) {
		Chats.remove(chat);
	}
});

controllers.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
	$scope.chat = Chats.get($stateParams.chatId);
});
