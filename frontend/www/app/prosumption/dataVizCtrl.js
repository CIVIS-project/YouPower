  //declaring the controller
var dataVizModule = angular.module('civis.youpower.prosumption').controller('dataVizCtrl', dataVizCtrl);

//write servives to load data for further processing

//declaring various additional services, mostly related to specific highcharts visualizations
//angular.module('civis.youpower.prosumption').service('getRandomData', getRandomData);

// function printablePercentage(n) {
//     return (n<=0?'':'+') + String(n)+'%';
// }
// function positiveNegativeColor(n) {
//     return (n<=0? 'energized': 'balanced');
// }
// function n(n){
//     return n > 9 ? "" + n: "0" + n;
// }
function dataVizCtrl($scope, $rootScope, $state, User, $http, Config, $q, currentUser) {
	//just loads the content of the window once the tabs have been generated
	//$state.go('main.prosumption.yours');
    var consumptionDataStore='';
    var productionDataStore= '';
    var currentUserId = $scope.currentUser.profile.contractId;
    var municipalityId = $scope.currentUser.profile.testLocation;
     /**
    CEIS -- corresponds to San Lorenzo in Banale
    CEdis -- corresponds to storo
    */
    var municipalityIdReal = ((municipalityId == 'CEIS')?'sanlorenzo':'storo');
    
    /**
    CEIS -- corresponds to San Lorenzo in Banale
    CEdis -- corresponds to storo
    */


        $rootScope.chartConfigComparisonHistorical = {
           options: {
             chart: {
                 type: 'column',
             }
         },
          yAxis: {
            title: {
                text: 'KWH'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
         title: {
             text: 'Storico Dati',
         },
         series: [{
                 name: 'Produzione',
                 data: [],
                      },
                      {
                     name: 'Consumo',
                     data: [],   
                     }], 
        };
            


  
$scope.getPersonalHistory = function getPersonalHistory(startDate,endDate){
    var historyStartDate = moment.utc(startDate).format('YYYY-MM-DD');
    var historyEndDate = moment.utc(endDate).format('YYYY-MM-DD');
    consumptionDataStore='';
    productionDataStore='';
   

   var promisedData =  $q.all([
    $http.get('http://localhost:3005/api/consumption?userid='+ currentUserId + '&from='+ historyStartDate + '&to='+ historyEndDate),
    $http.get('http://localhost:3005/api/production?userid=104532&from='+ historyStartDate + '&to='+ historyEndDate)
    ]).then(function(data){

        // production
        var production_data = data[1].data;
        var consumption_data = data[0].data;
        //preprocess production dataset

          var cleanApplianceDatap = _.clone(production_data); // create a copy of the array
            //console.dir(cleanApplianceDatap);
            productionDataStore = productionDataStore + '[';
               var tempArrayDaysp = new Array();
            for (i=0;i<cleanApplianceDatap.length;i++) {
                //create list of names of appliances for visualization purposes
                var TempArrayp = [];
                console.dir(cleanApplianceDatap[i]);
                //format the date for highchart to work
                console.log("Date before conversion:",cleanApplianceDatap[i].date);
                console.log("Date after conversion");
                var tempDayCleanp = moment.utc(cleanApplianceDatap[i].date).format('DD-MM-YYYY');
                                console.log("Date after conversion",tempDayCleanp);

                tempArrayDaysp.push(tempDayCleanp);
                TempArrayp.push("\""+tempDayCleanp+"\"",cleanApplianceDatap[i].production.toFixed(2));
                //pass the last index
                if(i == (cleanApplianceDatap.length - 1)){
                    productionDataStore = productionDataStore + '[' + TempArrayp + ']';
                }
                else{
                productionDataStore = productionDataStore + '[' + TempArrayp + '],';
            }
                console.log(TempArrayp);
            }
                console.log("Are we called from here ++++++++++++++++++++++++");
        productionDataStore = productionDataStore +']';
        console.log(productionDataStore);



         //preprocess consumption dataset
      var cleanApplianceDatac = _.clone(consumption_data); // create a copy of the array
        console.dir(cleanApplianceDatac);
        consumptionDataStore = consumptionDataStore + '[';
        for (i=0;i<cleanApplianceDatac.length;i++) {
            //create list of names of appliances for visualization purposes
            var TempArrayc = [];
            console.dir(cleanApplianceDatac[i]);
            //format the date for highchart to work
            TempArrayc.push("\""+moment.utc(cleanApplianceDatac[i].date).format('DD-MM-YYYY') + "\"",cleanApplianceDatac[i].consumption.toFixed(2));
            //pass the last index
            if(i == (cleanApplianceDatac.length - 1)){
                consumptionDataStore = consumptionDataStore + '[' + TempArrayc + ']';
            }
            else{
           consumptionDataStore = consumptionDataStore + '[' + TempArrayc + '],';
        }
            console.log(TempArrayc);
        }
    consumptionDataStore = consumptionDataStore +']';
    console.log("Are we called from here ---------------------------");
    console.log(consumptionDataStore);
    
   
    // $scope.$parent.chartConfigComparisonHistorical.series= [{
    //      name: 'Produzione',
    //      data: ['b':4],
    //           },
    //           {
    //          name: 'Consumo',
    //          data: ['a':2],   
    //          }];


        //console.log($scope.chartConfigComparisonHistorical.series);
        $rootScope.chartConfigComparisonHistorical.series = [{
            name: 'Produzione',
            data: JSON.parse(productionDataStore)
        },
            {
                name: 'Consumo',
                data: JSON.parse(consumptionDataStore)
            }
        ];
        console.log("The days are, ",tempArrayDaysp );
        $rootScope.chartConfigComparisonHistorical.xAxis = {
            categories: JSON.parse(JSON.stringify(tempArrayDaysp))
        };
                console.log($rootScope.chartConfigComparisonHistorical);

    //console.log(data[0], data[1]);
},
function(errorLoad)
{
    console.log("The webservice cannot return production and consumption data!");
}
);

//change state after variables get updated
$state.go('main.prosumption.vizHistoricalPersonal');


} //end of getpersonalHistory function



     //$scope.chartConfigComparisonHistorical.series = z;





     





// console.dir($scope);

// var serverCN="http://217.77.95.103/";
// //var venue="storo"; //stub: replace with link to location from settings

// default value
$scope.currentPrice="High";

///fetch data for the yours/ tab
// $scope.currentPrice= 0.12+(0.08*getRandomData());
//$http.get(serverCN+'/api/tou/'+venue+'/current').then(function(resp) {
$http.get('apiCN/api/tou/'+municipalityIdReal+'/current').then(function(resp) {
    // console.log('returned response'+JSON.parse(resp));
    $scope.currentPrice = resp.data.tarif;
    console.log('price isss:',resp.data.tarif);
    if ($scope.currentPrice=="Low") {
        $scope.priceIcon='ion-happy-outline';
        $scope.priceIconColor="balanced";
        console.log("We are here...");
    }
    else {
        $scope.priceIcon='ion-sad-outline';
        $scope.priceIconColor="energized";
        console.log("Or here,,,");
    }
  }, function(err) {
    console.error('ERR, problem in here', err);
    // err.status will contain the status code
  });
// $scope.timeRemaining = getTimeRemaining();

//reset global variablemunicipalityIdReal
console.log("After energyWeatherDataVector init");
$http.get('apiCN/api/tou/'+municipalityIdReal).then(function(resp) {
    
    var energyWeatherData = resp.data.data;
    //iterate over the array to format data
    var energyWeatherDataArray = new Array();
    for(i =0; i< energyWeatherData.length; i++ ){
        var energyWeatherObj = new Object();
        energyWeatherObj.date = moment(energyWeatherData[i].date).format('DD-MM HH:mm');
        energyWeatherObj.tarif = energyWeatherData[i].tarif;
        energyWeatherDataArray.push(energyWeatherObj);
    }
    $rootScope.energyWeatherDataVector = energyWeatherDataArray;
    console.dir($rootScope.energyWeatherDataVector);
     //console.log(resp.data.data);
    }, function(err) {
        console.error('ERR, energy whether data pro', err);
    // err.status will contain the status code
    });

$scope.futurePriceIcons = [];
$scope.futurePriceIconColors = [];
console.log("After init of future price icons");
console.log("length of data:",$rootScope.energyWeatherDataVector.length);
for (var i=0; i<$rootScope.energyWeatherDataVector.length; i++) {
    if ($rootScope.energyWeatherDataVector[i].tarif=="Low") {
        $scope.futurePriceIcons[i]='ion-happy-outline';
        $scope.futurePriceIconColors[i]="balanced";
        console.log("either we are here");
    }
    else {
        $scope.futurePriceIcons[i]='ion-sad-outline';
        $scope.futurePriceIconColors[i]="energized";
        console.log("or here");
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

//var currentUserId='104769';


// initialize last consumption gauge
$rootScope.chartConfigLastConsumption = {
        options: {
            chart: {
                type: 'solidgauge'
            },
            pane: {
                center: ['50%', '85%'],
                size: '100%',
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
        series: [],
        title: {
            text: 'consumo',
            y: 20
        },
        yAxis: {
            currentMin: 0,
            currentMax: 200,
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

// update last consumption gauge
// $http.get(Config.host+'/api/consumption/last?userid='+currentUserId).then(function(resp) {
$http.get('http://localhost:3005/api/consumption/last?userid='+currentUserId).then(function(resp) {
    var lastConsumptionData = resp.data.consumption;
    $rootScope.chartConfigLastConsumption.series = [{
            name: 'consumo',
            data: [lastConsumptionData],
             dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:black">{y}</span><br/>' + 
                    '<span style="font-size:12px;color:silver">km/h</span></div>'
            }
        }];
    
   
    }, function(err){
        console.error(err.status);
    // err.status will contain the status code
    });



// initialize last production gauge

$rootScope.chartConfigLastProduction = {
        options: {
            chart: {
                type: 'solidgauge'
            },
            pane: {
                center: ['50%', '85%'],
                size: '100%',
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
        series: [],
        title: {
            text: 'produzione',
            y: 20
        },
        yAxis: {
            currentMin: 0,
            currentMax: 200,
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

//update last consumption gauge
$http.get('http://localhost:3005/api/production/last?userid='+currentUserId).then(function(resp) {
    var lastProductionData = resp.data.production;
    $rootScope.chartConfigLastProduction.series = [{
            name: 'produzione',
            data: [lastProductionData],
             dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:black">{y}</span><br/>' + 
                    '<span style="font-size:12px;color:silver">km/h</span></div>'
            }
        }];
    }, function(err){
        console.error(err.status);
    // err.status will contain the status code
    });


// var $rootScope.consumptionDataStore= '';
// var $rootScope.productionDataStore = '';



//-----------------------------Code for has production------------------//
//----------------------------------------------------------------------//
// $http.get('http://localhost:3005/api/production/hasProduction?userid='+currentUserId).then(function(resp) {
//     $scope.hasProduction=resp;
//     }, function(err){
//         console.error('ERR', err.status);
//     // err.status will contain the status code
//     });


//------------------Applicance related code  begins here--------------------//
//--------------------------------------------------------------------------//

$scope.listOfAppliancesName=[];
$http.get('http://localhost:3005/api/consumption/appliance?userid='+currentUserId).then(function(resp) {
    $scope.listOfAppliances=resp.data;
    
//var applianceId;
    //create list of names of appliances for visualization purposes
for (i=0;i<$scope.listOfAppliances.length;i++) {
    $scope.listOfAppliancesName.push($scope.listOfAppliances[i]);  
}

// start chart here....

// $scope.chartConfigAppliance = {
//         options: {
//             chart: {
//                 type: 'area',
//             },
//         },
//         title: {
//             text: 'Consumption Pattern',
//         },
//              series : [{
//                 name : 't',
//                 data : applianceArrayData,
//                 gapSize: 5,
//                 tooltip: {
//                     valueDecimals: 2
//                 },
//                 fillColor : {
//                     linearGradient : {
//                         x1: 0,
//                         y1: 0,
//                         x2: 0,
//                         y2: 1
//                     },
//                     stops : [
//                         [0, Highcharts.getOptions().colors[0]],
//                         [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
//                     ]
//                 },
//                 threshold: null
//             }],
//             plotOptions: {
//                 area: {
//                     //space for specific options to be passed to highcharts constructor
//                 }
//             },
//         loading: false
//     };

    //end of chart



    }, function(err){
        console.error('ERR', err);
    // err.status will contain the status code
    });




// $scope.lastConsumption= getRandomData();
// $scope.lastProduction = getRandomData();


// var limit = 12; //number of entries, based on a monthly sampling
// for (var i =0; i<limit; i++) {
//     $rootScope.productionDataStore.push(20*getRandomData());
//     consumptionArray.push(20*getRandomData());
//     // console.log('dato:'+String($rootScope.productionDataStore[i]));
// }
// // console.log($rootScope.productionDataStore);
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
//             data: $rootScope.productionDataStore
//         })
// $scope.chartConfigComparisonHistorical.series.push({
//             data: consumptionArray
//         })

//fetch data for the appliances tab
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


   
// $scope.chartConfigCommunityBalance = {
//         options: {
//             chart: {
//                 type: 'pie',
//                 plotBackgroundColor: null,
//                 plotBorderWidth: null,
//                 plotShadow: false,
//             },
//             plotOptions: {
//                 pie: {
//                     dataLabels: {
//                         enabled: false
//                     },
//                     showInLegend: true
//                 }
//             },
//             colors: ['#50B432', '#24CBE5'],
//         },
//         series: [{
//              type: 'pie',
//             data: [
//                 ['Produzione', $scope.totalCommunityProduction],
//                 ['Energia acquistata',$scope.totalCommunityConsumption-$scope.totalCommunityProduction]
//                 ]
//                     }],
//         title: {
//             text: $scope.communitybuilding
//         },
//         loading: false
//     };

 // var applianceArrayData = [];
 // $scope.chartConfigAppliance = {
 //        options: {
 //            chart: {
 //                type: 'area',
 //            },
 //        },
 //        title: {
 //            text: 'Consumption Pattern',
 //        },
 //             series : [{
 //                name : 't',
 //                data : applianceArrayData,
 //                gapSize: 5,
 //                tooltip: {
 //                    valueDecimals: 2
 //                },
 //                fillColor : {
 //                    linearGradient : {
 //                        x1: 0,
 //                        y1: 0,
 //                        x2: 0,
 //                        y2: 1
 //                    },
 //                    stops : [
 //                        [0, Highcharts.getOptions().colors[0]],
 //                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
 //                    ]
 //                },
 //                threshold: null
 //            }],
 //            plotOptions: {
 //                area: {
 //                    //space for specific options to be passed to highcharts constructor
 //                }
 //            },
 //        loading: false
 //    };
 //            console.log("After first configuration chartConfigAppliance2");


      


    $rootScope.chartConfigAppliance2 = {
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
                    text: 'modello di consumo',
                },
                 xAxis: {
                        type: 'datetime'
                    },
                     yAxis: {
                        title: {
                            text: 'KWH'
                        }
                    },
                   
                     series : [{
                        name : 'quantità di consumo',
                        data : [],
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






        // var chartData='[[04/10/2015,534.827468425035],[04/10/2015,213.072995232185],[04/10/2015,281.020645804703],[05/10/2015,526.704251356423],[05/10/2015,218.13283588551],[05/10/2015,299.548069406301]]';
    $scope.assignApplianceParam = function (ApplianceId,startDate,endDate)
    {
        
        // start the web service to fetch appliance data
        //get the start and end dates
        chartData = '[';
        
        
        var startDateAppliance = moment.utc(startDate).format('YYYY-MM-DD') ;
        var endDateAppliance=  moment.utc(endDate).format('YYYY-MM-DD') ;
        console.log("Start data:",startDateAppliance);
        console.log("End date:",endDateAppliance);
        var applianceData=[];
        console.log("Appliance ID is" ,ApplianceId);
        $http.get('http://localhost:3005/api/consumption/appliance/'+ApplianceId+"?userid="+currentUserId+"&from="+startDateAppliance+ "&to="+endDateAppliance).then(function(resp) {
        applianceData.push(resp.data);
        console.dir(applianceData[0]);
        // create a copy of the array
        var cleanApplianceData = _.clone(applianceData[0]); // create a copy of the array
        console.dir(cleanApplianceData);


        var tempArrayDays = new Array();
        for (i=0;i<cleanApplianceData.length;i++) {
            //create list of names of appliances for visualization purposes
            var TempArray = [];
            console.dir(cleanApplianceData[i]);
            var tempDayClean = moment.utc(cleanApplianceData[i].date).format('DD-MM-YYYY');
                                console.log("Date after conversion",tempDayClean);
            //format the date for highchart to work
            tempArrayDays.push(tempDayClean);
            TempArray.push("\""+tempDayClean+ "\"",cleanApplianceData[i].consumption);
            //pass the last index

            if(i == (cleanApplianceData.length - 1)){
                chartData = chartData + '[' + TempArray + ']';
            }
            else{
            chartData = chartData + '[' + TempArray + '],';
        }
            console.log(TempArray);
        }
    chartData = chartData+']'; // add closing tag for the dataset
        console.log("We are from the sky");
        console.info(chartData);
        // start chart configuration

         console.dir($scope.chartConfigAppliance2);
         console.log(chartData);
         console.log(chartData.replace(/\"/g, ""));

         //update the chart
         $rootScope.chartConfigAppliance2.series = [{
                        name : 'quantità di consumo',
                        data : JSON.parse(chartData),
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
                    }];

         $rootScope.chartConfigAppliance2.xAxis = {
            categories: JSON.parse(JSON.stringify(tempArrayDays))
        };
        //end chart configuration
        }, function(err){
            console.error('ERR', err);
        // err.status will contain the status code
        });
                   $state.go('main.prosumption.vizAppliance')
};

//console.log("We are from heaven");
        // end of service call
 

    
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


/** ToDO */
// $scope.chartConfigHistoryComparison = {
//      options: {
//             chart: {
//                 type: 'areaspline',
//             },
//              legend: {
//                 enabled: true, 
//                 borderWidth: 1,
//                 align: 'left',
//             },
//             plotOptions: {
//                 areaspline: {
//                     fillOpacity: 0.5
//                 }
//             }
//         },
//         title: {
//             text: 'Consumption Comparison',
//         },
//         series: [{
//             data: $scope.consumptionArray,
//             name: 'You',
//         }, {
//             data: communityConsumptionArray,
//             name: 'Benchmark',
//         }]
// };


//configure input vector for plotting meteo energy
 // var limit = 16;
 // var meteoEnergyPriceArray = [];
// for (var i=0; i<limit; i++) {
//     meteoEnergyPriceArray.push(0.5*getRandomData());
// }
//  var thresholdTarif=1.2;
// var dataPlotMeteoEnergy = [];
// var dataDateTimeArray = [];
// for (var i=0; i<limit; i++) {
//     markerTmp='url(http://icons.iconarchive.com/icons/icons8/ios7/128/Messaging-Sad-icon.png)'
//     if (meteoEnergyPriceArray[i]<thresholdTarif) {
//         markerTmp='url(http://icons.iconarchive.com/icons/icons8/ios7/128/Messaging-Happy-icon.png)'
//     }
//     dataDateTimeArray.push(Date(2015,9,8,14+i).toString());
//     dataPlotMeteoEnergy.push({
//         y: meteoEnergyPriceArray[i],
//         marker: {
//             symbol: markerTmp,
//             width: 50,
//             height: 50,
//         }
//     })
// };



//end of chart for personal history






// console.log("Before chart config energy mateo");
// $scope.chartConfigEnergyMeteo = {
//     options: {
//         chart: {
//             type: 'spline'
//         },
//         legend: {
//             enabled: false
//         },
//         xAxis: {
//             type: 'datetime',
//             categories : dataDateTimeArray
//         }
//     },
//     title: {
//         text: 'Tariff Prediction'
//     },
//     series: [{
//         name: 'Price',
//         color: "#003366",
//         marker: {
//             symbol: 'square'
//         },
//         lineWidth : 4,
//         data :  dataPlotMeteoEnergy,
//         // data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, {
//         //         y: 26.5,
//         //         marker: {
//         //             symbol: 'url(http://simpleicon.com/wp-content/uploads/sad.png)',
//         //             width: 50,
//         //             height: 50,
//         //         }
//         //     }, 23.3, 18.3, 13.9, 9.6]
//     }]
// };


// add scope for filtering production and consumption from other appliances
// Should be modified, better if changed from the schema
$scope.applicanceFilter = function(name){
    return  name._id === '0' ||
            name._id === '8';
}
$scope.applicanceFilterNonProCons = function(name){
    return  !(name._id === '0') &&
            !(name._id === '32') &&
            !(name._id === '8') ;
}

//add for highchart title traslations

//end of dataVizCtrl controller
}
