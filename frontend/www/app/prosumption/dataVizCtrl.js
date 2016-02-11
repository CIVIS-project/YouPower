  //declaring the controller
angular.module('civis.youpower.prosumption').controller('dataVizCtrl', dataVizCtrl);
//declaring various additional services, mostly related to specific highcharts visualizations
//angular.module('civis.youpower.prosumption').service('getRandomData', getRandomData);

function printablePercentage(n) {
    return (n<=0?'':'+') + String(n)+'%';
}
function positiveNegativeColor(n) {
    return (n<=0? 'energized': 'balanced');
}
function n(n){
    return n > 9 ? "" + n: "0" + n;
}
function dataVizCtrl($scope, $state, User, $http, Config) {
	//just loads the content of the window once the tabs have been generated
	//$state.go('main.prosumption.yours');
console.log('loaded dataVizCtrl');
console.log('state= '+String($scope));

var serverCN="http://217.77.95.103/";
var venue="storo"; //stub: replace with link to location from settings

// default value
$scope.currentPrice="High";

///fetch data for the yours/ tab
// $scope.currentPrice= 0.12+(0.08*getRandomData());
// $http.get(serverCN+'/api/tou/'+venue+'/current').then(function(resp) {
$http.get('apiCN/api/tou/'+venue+'/current').then(function(resp) {
    // console.log('returned response'+JSON.parse(resp));
    $scope.currentPrice = resp.data.tarif;
    console.log('price is:',resp.data.tarif);
    if ($scope.currentPrice=="Low") {
        $scope.priceIcon='ion-happy-outline';
        $scope.priceIconColor="balanced";
    }
    else {
        $scope.priceIcon='ion-sad-outline';
        $scope.priceIconColor="energized";
    }
  }, function(err) {
    console.error('ERR', err);
    // err.status will contain the status code
  });
$scope.energyWeatherDataVector=[];
// $scope.timeRemaining = getTimeRemaining();
$http.get('apiCN/api/tou/'+venue).then(function(resp) {
    $scope.energyWeatherDataVector= resp.data.data;
    // console.log(resp.data);
    }, function(err) {
        console.error('ERR', err);
    // err.status will contain the status code
    });

$scope.futurePriceIcons = [];
$scope.futurePriceIconColors = [];
for (var i=0; i<$scope.energyWeatherDataVector.length; i++) {
    if (scope.energyWeatherDataVector[i].tarif=="Low") {
        $scope.futurePriceIcons[i]='ion-happy-outline';
        $scope.futurePriceIconColors[i]="balanced";
    }
    else {
        $scope.futurePriceIcons[i]='ion-sad-outline';
        $scope.futurePriceIconColors[i]="energized";
    }  
}
// var numberElementsFuture = 12;
// var timeNow=3;
// var fromTime=timeNow;
// var toTime = fromTime+3;
// var tmp;
// var priceIconTmp;
// var priceIconColorTmp;
// for (var i=0; i<numberElementsFuture; i++) {
//     tmp= (0.08*getRandomData());
//     if (isPriceGood(tmp)) {
//     priceIconTmp='ion-happy-outline';
//     priceIconColorTmp="balanced";
// }
// else {
//     priceIconTmp='ion-sad-outline';
//     priceIconColorTmp="energized";
// }
//     $scope.futurePrices[i]=[n(fromTime),n(toTime),priceIconTmp,priceIconColorTmp];
// // console.log("futurePrices "+ $scope.futurePrices[i][0]);
//     fromTime=(fromTime+3)%24;
//     toTime=(toTime+3)%24;
// }
var productionArray = [];
var consumptionArray = [];
// tentative part for the consumption/production data
var contractIDtmp='5589';
// $http.get(Config.host+'/api/consumption/last?userid='+contractIDtmp).then(function(resp) {
$http.get('apiTUD/consumption/last?userid='+contractIDtmp).then(function(resp) {
    $scope.lastConsumption=resp;
    }, function(err){
        console.error('ERR', err);
    // err.status will contain the status code
    });

$http.get('/apiTUD/production/last?userid='+contractIDtmp).then(function(resp) {
    $scope.lastProduction=resp;
    }, function(err){
        console.error('ERR', err);
    // err.status will contain the status code
    });
$http.get('/apiTUD/consumption?userid='+contractIDtmp).then(function(resp) {
    consumptionArray=resp;
    }, function(err){
        console.error('ERR', err);
    // err.status will contain the status code
    });
$http.get('/apiTUD/production?userid='+contractIDtmp).then(function(resp) {
    productionArray=resp;
    }, function(err){
        console.error('ERR', err);
    // err.status will contain the status code
    });
$http.get('/apiTUD/hasProduction?userid='+contractIDtmp).then(function(resp) {
    $scope.hasProduction=resp;
    }, function(err){
        console.error('ERR', err);
    // err.status will contain the status code
    });



//tentative part for appliances
// $http.get(Config.host+'/api/consumption/appliance').then(function(resp) {
//     $scope.listOfAppliances=resp.data;
//     }, function(err){
//         console.error('ERR', err);
//     // err.status will contain the status code
//     });
// var listOfAppliancesName=[];
// var applianceId;
// var applianceData=[];
// for (i=0;i<$scope.listOfAppliances.length;i++) {
//     //create list of names of appliances for visualization purposes
//     listOfAppliancesName.push($scope.listOfAppliances.appliance[i]);
//     // now read the data from the appliances
//     $http.get(Config.host+'/api/consumption/appliance/'+$scope.listOfAppliances._id[i]).then(function(resp) {
//         applianceData.push(resp.data);
//         }, function(err){
//             console.error('ERR', err);
//         // err.status will contain the status code
//         });
// }



// $scope.lastConsumption= getRandomData();
// $scope.lastProduction = getRandomData();


// var limit = 12; //number of entries, based on a monthly sampling
// for (var i =0; i<limit; i++) {
//     productionArray.push(20*getRandomData());
//     consumptionArray.push(20*getRandomData());
//     // console.log('dato:'+String(productionArray[i]));
// }
// // console.log(productionArray);
// var communityConsumptionArray = [];
// var limit = 12;
// for (var i=0; i<limit; i++) {
//     communityConsumptionArray.push(20*getRandomData());
// }
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
// var applianceArrayData = [];
// var limit = 100; //number of entries, based on a monthly sampling
// for (var i =0; i<limit; i++) {
//     applianceArrayData.push(getRandomData());
//     //console.log('dato:'+String(applianceArrayData[i]));
// }

//fetch data for the community tab
// commented out for the time being, not there 
// $scope.totalCommunityConsumption = 10*getRandomData();
// $scope.totalCommunityProduction = 10*getRandomData();
// tmp1=getRandomTrend();
// //console.log('trend: '+colorTrend);
// $scope.communityConsumptionTrend= printablePercentage(tmp1);
// $scope.colorSpan= positiveNegativeColor(tmp1);
// tmp2=getRandomTrend();
// //console.log('trend: '+colorTrend2);
// $scope.communityProductionTrend= printablePercentage(tmp2);
// $scope.colorSpan2= positiveNegativeColor(tmp2);

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
$scope.chartConfigHistoryComparison = {
     options: {
            chart: {
                type: 'areaspline',
            },
             legend: {
                enabled: true, 
                borderWidth: 1,
                align: 'left',
            },
            plotOptions: {
                areaspline: {
                    fillOpacity: 0.5
                }
            }
        },
        title: {
            text: 'Consumption Comparison',
        },
        series: [{
            data: consumptionArray,
            name: 'You',
        }, {
            data: communityConsumptionArray,
            name: 'Benchmark',
        }]
};
//configure input vector for plotting meteo energy
// var limit = 16;
// var meteoEnergyPriceArray = [];
// for (var i=0; i<limit; i++) {
//     meteoEnergyPriceArray.push(0.5*getRandomData());
// }
// var thresholdTarif=1.2;
var dataPlotMeteoEnergy = [];
var dataDateTimeArray = [];
for (var i=0; i<limit; i++) {
    markerTmp='url(http://icons.iconarchive.com/icons/icons8/ios7/128/Messaging-Sad-icon.png)'
    if (meteoEnergyPriceArray[i]<thresholdTarif) {
        markerTmp='url(http://icons.iconarchive.com/icons/icons8/ios7/128/Messaging-Happy-icon.png)'
    }
    dataDateTimeArray.push(Date(2015,9,8,14+i).toString());
    dataPlotMeteoEnergy.push({
        y: meteoEnergyPriceArray[i],
        marker: {
            symbol: markerTmp,
            width: 50,
            height: 50,
        }
    })
};
$scope.chartConfigEnergyMeteo = {
    options: {
        chart: {
            type: 'spline'
        },
        legend: {
            enabled: false
        },
        xAxis: {
            type: 'datetime',
            categories : dataDateTimeArray
        }
    },
    title: {
        text: 'Tariff Prediction'
    },
    series: [{
        name: 'Price',
        color: "#003366",
        marker: {
            symbol: 'square'
        },
        lineWidth : 4,
        data :  dataPlotMeteoEnergy,
        // data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, {
        //         y: 26.5,
        //         marker: {
        //             symbol: 'url(http://simpleicon.com/wp-content/uploads/sad.png)',
        //             width: 50,
        //             height: 50,
        //         }
        //     }, 23.3, 18.3, 13.9, 9.6]
    }]
};
//end of dataVizCtrl controller
}
