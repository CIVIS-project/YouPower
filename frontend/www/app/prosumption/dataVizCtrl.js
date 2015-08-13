angular.module('civis.youpower.prosumption').controller('dataVizCtrl', dataVizCtrl);

function dataVizCtrl($scope, $state, User, $http) {
	//just loads the content of the window once the tabs have been generated
	//$state.go('main.prosumption.yours');
console.log('loaded dataVizCtrl');
//DM: generates random stuff, need to be replaced with calls to the backend endpoints once available
function getRandomData() {
	return Math.floor((Math.random()*6)+1);
}

$scope.lastConsumption= getRandomData();
$scope.lastProduction = getRandomData();
//code for generating charts
$scope.chartConfig1 = {
	options: {
		chart: {
			type: 'bar',
		}
	}
	title: {
		text: 'title',
	}
}
}
// $scope.chartConfig1 = {
//         options: {
//             chart: {
//                 type: 'bar',
//             },
//             title: {
//             	text: 'puppa',
//             },
//         }
//         //  plotOptions: {
//         //     series: {
//         //         colorByPoint: true
//         //     },
//         // },            
//         series: [{
//         	data: [10, 15, 12, 8, 7]
//              }],
//         // series: [{
//         //     data: [5, 10], //[$scope.lastConsumption, $scope.lastProduction],
//         //     //pointWidth : 15, 
//         // }],
//         loading: false
//     };
//   // $state.go('main.prosumption.yours');
// };
