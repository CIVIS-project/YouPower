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
///////////////////////////////////////////
//example: basic horizontal bar chart
// $scope.chartConfig = {
// 	options: {
// 		chart: {
// 			type: 'bar',
// 		}
// 	},
// 	title: {
// 		text: 'title',
// 	},
// 	series: [{
//         	data: [$scope.lastConsumption, $scope.lastProduction]//[10, 15, 12, 8, 7]
//              }],
// };
///////////////////////////////////////////
//example: gauge meter
// $scope.chartConfig = {
// 	 options: {
//             chart: {
//                 type: 'gauge',
//                 plotBackgroundColor: null,
//                 plotBackgroundImage: null,
//                 plotBorderWidth: 0,
//                 plotShadow: false
//             },
//             title: {
//                 text: 'Consumption'
//             },
//             pane: {
//                 startAngle: -150,
//                 endAngle: 150,
//                 background: [{
//                     backgroundColor: {
//                         linearGradient: {
//                             x1: 0,
//                             y1: 0,
//                             x2: 0,
//                             y2: 1
//                         },
//                         stops: [
//                             [0, '#FFF'],
//                             [1, '#333']
//                         ]
//                     },
//                     borderWidth: 0,
//                     outerRadius: '109%'
//                 }, {
//                     backgroundColor: {
//                         linearGradient: {
//                             x1: 0,
//                             y1: 0,
//                             x2: 0,
//                             y2: 1
//                         },
//                         stops: [
//                             [0, '#333'],
//                             [1, '#FFF']
//                         ]
//                     },
//                     borderWidth: 1,
//                     outerRadius: '107%'
//                 }, {
//                     // default background
//                 }, {
//                     backgroundColor: '#DDD',
//                     borderWidth: 0,
//                     outerRadius: '105%',
//                     innerRadius: '103%'
//                 }]
//             }
//         },
// 	    yAxis: {
// 	        min: 0,
// 	        max: 20,        
// 	        minorTickInterval: 'auto',
// 	        minorTickWidth: 1,
// 	        minorTickLength: 10,
// 	        minorTickPosition: 'inside',
// 	        minorTickColor: '#666',	
// 	        tickPixelInterval: 30,
// 	        tickWidth: 2,
// 	        tickPosition: 'inside',
// 	        tickLength: 10,
// 	        tickColor: '#666',
// 	        labels: {
// 	            step: 2,
// 	            rotation: 'auto'
// 	        },
// 	        title: {
// 	            text: 'kWh'
// 	        },
// 	        plotBands: [{
// 	            from: 0,
// 	            to: 4,
// 	            color: '#55BF3B' // green
// 	        }, {
// 	            from: 4,
// 	            to: 10,
// 	            color: '#DDDF0D' // yellow
// 	        }, {
// 	            from: 10,
// 	            to: 20,
// 	            color: '#DF5353' // red
// 	        }]        
// 	    },
	
// 	    series: [{
// 	        name: 'Consumption',
// 	        data: [$scope.lastConsumption],
// 	        tooltip: {
// 	            valueSuffix: ' kWh'
// 	        }
// 	    }]
//     };
///////////////////////////////////////////
//DM: example: solidgauge
$scope.chartConfig = {
        options: {
            chart: {
                type: 'solidgauge'
            },
            pane: {
                center: ['50%', '35%'],
                size: '60%',
                startAngle: -90,
                endAngle: 90,
                background: {
                    backgroundColor:'#EEE',
                    innerRadius: '60%',
                    outerRadius: '100%',
                    shape: 'arc'
                }
            },
            solidgauge: {
                dataLabels: {
                    y: -30,
                    borderWidth: 0,
                    useHTML: true
                }
            }
        },
        series: [{
            data: [$scope.lastConsumption],
            dataLabels: {
	        	format: '<div style="text-align:center"><span style="font-size:15px;color:black">{y}</span><br/>' + 
                   	'<span style="font-size:12px;color:silver">kWh</span></div>'
	        }
        }],
        title: {
            text: 'Consumption',
            y: 20
        },
        yAxis: {
            currentMin: 0,
            currentMax: 20,
            title: {
                y: 140
            },      
			stops: [
                [0.1, '#55BF3B'],  // green
                [0.9, '#DF5353'], // red
	        	[0.5, '#DDDF0D'], // yellow
			],
			lineWidth: 0,
            tickInterval: 20,
            tickPixelInterval: 400,
            tickWidth: 0,
            labels: {
                y: 15
            }   
        },
        loading: false
    };
}

