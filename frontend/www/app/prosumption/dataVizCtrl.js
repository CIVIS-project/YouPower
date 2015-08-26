//declaring the controller
angular.module('civis.youpower.prosumption').controller('dataVizCtrl', dataVizCtrl);
//declaring various additional services, mostly related to specific highcharts visualizations
angular.module('civis.youpower.prosumption').service('getRandomData', getRandomData);

function getRandomData() {
    return Math.floor((Math.random()*6)+1);
}
function getRandomTrend() {
    return Math.floor((Math.random()*6)-3);
}
function printablePercentage(n) {
    return (n<=0?'':'+') + String(n)+'%';
}
function positiveNegativeColor(n) {
    return (n<=0? 'energized': 'balanced');
}
function isPriceGood(price) {
    var threshold = 2; //totally random threshold, to be replaced at some point
    return (price<=threshold? true : false);
}


function dataVizCtrl($scope, $state, User, $http) {
	//just loads the content of the window once the tabs have been generated
	//$state.go('main.prosumption.yours');
console.log('loaded dataVizCtrl');
console.log('state= '+String($scope));
//DM: generates random stuff, need to be replaced with calls to the backend endpoints once available

///fetch data for the yours/ tab
$scope.currentPrice= getRandomData();
var isPriceOk = isPriceGood($scope.currentPrice);
if (isPriceOk) {
    $scope.priceIcon='ion-happy-outline';
    $scope.priceIconColor="balanced";
}
else {
    $scope.priceIcon='ion-sad-outline';
    $scope.priceIconColor="energized";
}

$scope.lastConsumption= getRandomData();
$scope.lastProduction = getRandomData();

var productionArray = [];
var consumptionArray = [];
var limit = 12; //number of entries, based on a monthly sampling
for (var i =0; i<limit; i++) {
    productionArray.push(20*getRandomData());
    consumptionArray.push(20*getRandomData());
    console.log('dato:'+String(productionArray[i]));
}
console.log(productionArray);
// $scope.chartConfigComparisonHistorical={
//     series: [{
//     }],
// }
// $scope.chartConfigComparisonHistorical.series.push({
//             data: productionArray
//         })
// $scope.chartConfigComparisonHistorical.series.push({
//             data: consumptionArray
//         })

//fetch data for the appliances tab
var applianceArrayData = [];
var limit = 100; //number of entries, based on a monthly sampling
for (var i =0; i<limit; i++) {
    applianceArrayData.push(getRandomData());
    //console.log('dato:'+String(applianceArrayData[i]));
}

//fetch data for the community tab

$scope.totalCommunityConsumption = 10*getRandomData();
$scope.totalCommunityProduction = 10*getRandomData();
tmp1=getRandomTrend();
//console.log('trend: '+colorTrend);
$scope.communityConsumptionTrend= printablePercentage(tmp1);
$scope.colorSpan= positiveNegativeColor(tmp1);
tmp2=getRandomTrend();
//console.log('trend: '+colorTrend2);
$scope.communityProductionTrend= printablePercentage(tmp2);
$scope.colorSpan2= positiveNegativeColor(tmp2);

//configuration for the various graphs
$scope.chartConfigComparisonHistorical= {
   options: {
     chart: {
         type: 'column',
     }
 },
 title: {
     text: 'Storico Dati',
 },
 series: [{
         name: 'Produzione',
         data: productionArray
              },
              {
             name: 'Consumo',
             data: consumptionArray,   
             }], 
};
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
$scope.chartConfigLastConsumption = {
        options: {
            chart: {
                type: 'solidgauge'
            },
            pane: {
                center: ['50%', '50%'],
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
$scope.chartConfigLastProduction = {
        options: {
            chart: {
                type: 'solidgauge'
            },
            pane: {
                center: ['50%', '50%'],
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
            data: [$scope.lastProduction],
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
$scope.chartConfigCommunityBalance = {
        options: {
            chart: {
                type: 'pie',
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
            },
            plotOptions: {
                pie: {
                    dataLabels: {
                        enabled: false
                    },
                    showInLegend: true
                }
            },
            colors: ['#50B432', '#24CBE5'],
        },
        series: [{
             type: 'pie',
            data: [
                ['Produzione', $scope.totalCommunityProduction],
                ['Energia acquistata',$scope.totalCommunityConsumption-$scope.totalCommunityProduction]
                ]
                    }],
        title: {
            text: 'Community Balance',
        },
        loading: false
    };
$scope.chartConfigAppliance = {
        options: {
            chart: {
                type: 'area',
            },
        },
        title: {
            text: 'Consumption Pattern',
        },
             series : [{
                name : 't',
                data : applianceArrayData,
                gapSize: 5,
                tooltip: {
                    valueDecimals: 2
                },
                fillColor : {
                    linearGradient : {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops : [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                threshold: null
            }],
            plotOptions: {
                area: {
                    //space for specific options to be passed to highcharts constructor
                }
            },
        loading: false
    };
    $scope.chartConfigAppliance2 = {
        options: {
            chart: {
                type: 'area',
                zoomType: 'x'
            },
             legend: {
                enabled: false
            },
        },
        title: {
            text: 'Consumption Pattern',
        },
         xAxis: {
                type: 'datetime'
            },
             yAxis: {
                title: {
                    text: null
                }
            },
           
             series : [{
                name : 't',
                data : [
[Date.UTC(2013,5,2),0.7695],
[Date.UTC(2013,5,3),0.7648],
[Date.UTC(2013,5,4),0.7645],
[Date.UTC(2013,5,5),0.7638],
[Date.UTC(2013,5,6),0.7549],
[Date.UTC(2013,5,7),0.7562],
[Date.UTC(2013,5,9),0.7574],
[Date.UTC(2013,5,10),0.7543],
[Date.UTC(2013,5,11),0.7510],
[Date.UTC(2013,5,12),0.7498],
[Date.UTC(2013,5,13),0.7477],
[Date.UTC(2013,5,14),0.7492],
[Date.UTC(2013,5,16),0.7487]],
                fillColor : {
                    linearGradient : {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops : [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                threshold: null
            }],
        loading: false
    };
    //end of controller
// $scope.chartConfigAppliance2 = {
//  options: {
//      chart: {
//          type: 'bar',
//          title: "puppa",
//      }
//  },
//  title: {
//      text: 'puppa',
//  },
//  series: [{
//          data: [$scope.lastConsumption, $scope.lastProduction]//[10, 15, 12, 8, 7]
//              }],
// };
}
