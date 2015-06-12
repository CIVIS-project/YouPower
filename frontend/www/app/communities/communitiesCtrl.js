

controllers.controller('CommunitiesCtrl', CommunitiesCtrl);


function CommunitiesCtrl($scope) {

	$scope.community = [];
	$scope.communityId;


	$scope.setCommunity = function(id, name, friends){
		if(name){
			$scope.community[id]={name:name,friends:friends};
		}
		$scope.communityId = id;
	}

}