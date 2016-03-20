var dataVizModule = angular.module('civis.youpower.prosumption').controller('dataVizCtrl', 
    ['$scope', '$rootScope', '$state', 'User', '$http', 'Config', '$q', 'currentUser',
function dataVizCtrl($scope, $rootScope, $state, User, $http, Config, $q, currentUser) {
    //just loads the content of the window once the tabs have been generated
    //$state.go('main.prosumption.yours');
    var consumptionDataStore='';
    var productionDataStore= '';
    var currentUserId = $scope.currentUser.profile.contractId;
    var municipalityId = $scope.currentUser.profile.testLocation;
    var userEmail = $scope.currentUser.email;
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
                text: 'WH'
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
            


  
$scope.getPersonalHistory = function(startDate,endDate){
    var historyStartDate = moment.utc(startDate).add('days',1).format('YYYY-MM-DD');
    var historyEndDate = moment.utc(endDate).add('days',1).format('YYYY-MM-DD');
    consumptionDataStore='';
    productionDataStore='';
   

   var promisedData =  $q.all([
    $http.get(Config.host+'/api/consumption?userid='+ currentUserId + '&from='+ historyStartDate + '&to='+ historyEndDate),
    $http.get(Config.host+'/api/production?userid='+ currentUserId+ '&from='+ historyStartDate + '&to='+ historyEndDate)
    ]).then(function(data){
        mixpanel.trentino.track('Trentino prosumption data requested:',{Category: "Personal production/consumption comparision",ContractId:currentUserId, userEmail: userEmail, municipality:municipalityId, fromDate: historyStartDate, toDate: historyEndDate, date:moment().format('YYYY-MM-DDTHH:mm:ss')});
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
                var tempDayCleanp = moment.utc(cleanApplianceDatap[i].date).add(1,'days').format('DD-MM-YYYY');
                               

                tempArrayDaysp.push(tempDayCleanp);
                TempArrayp.push("\""+tempDayCleanp+"\"",parseFloat(cleanApplianceDatap[i].production).toFixed(3));
                //pass the last index
                if(i == (cleanApplianceDatap.length - 1)){
                    productionDataStore = productionDataStore + '[' + TempArrayp + ']';
                }
                else{
                productionDataStore = productionDataStore + '[' + TempArrayp + '],';
            }
            }
        productionDataStore = productionDataStore +']';

         //preprocess consumption dataset
      var cleanApplianceDatac = _.clone(consumption_data); // create a copy of the array

        consumptionDataStore = consumptionDataStore + '[';
        for (i=0;i<cleanApplianceDatac.length;i++) {
            //create list of names of appliances for visualization purposes
            var TempArrayc = [];

            //format the date for highchart to work
            TempArrayc.push("\""+moment.utc(cleanApplianceDatac[i].date).add(1,'days').format('DD-MM-YYYY') + "\"",parseFloat(cleanApplianceDatac[i].consumption).toFixed(3));
            //pass the last index
            if(i == (cleanApplianceDatac.length - 1)){
                consumptionDataStore = consumptionDataStore + '[' + TempArrayc + ']';
            }
            else{
           consumptionDataStore = consumptionDataStore + '[' + TempArrayc + '],';
        }
        }
    consumptionDataStore = consumptionDataStore +']';


        $rootScope.chartConfigComparisonHistorical.series = [{
            name: 'Produzione',
            data: JSON.parse(productionDataStore)
        },
            {
                name: 'Consumo',
                data: JSON.parse(consumptionDataStore)
            }
        ];
        $rootScope.chartConfigComparisonHistorical.xAxis = {
            categories: JSON.parse(JSON.stringify(tempArrayDaysp))
        };


    //console.log(data[0], data[1]);
},
function(err)
{
    console.error(err.status);
}
);

//change state after variables get updated
$state.go('main.prosumption.vizHistoricalPersonal');


} //end of getpersonalHistory function



     //$scope.chartConfigComparisonHistorical.series = z;

// default value
$scope.currentPrice="High";

///fetch data for the yours/ tab
// $scope.currentPrice= 0.12+(0.08*getRandomData());
//$http.get(serverCN+'/api/tou/'+venue+'/current').then(function(resp) {
$http.get(Config.host+'/api/energyMeteo/tou/current?municipalityId='+municipalityIdReal+"&userid="+currentUserId).then(function(resp) {
    console.dir(resp);
    $scope.currentPrice = resp.data.tarif;
    mixpanel.trentino.track('Trentino prosumption data requested:',{Category: "Current energy meteo",ContractId:currentUserId, userEmail: userEmail, municipality:municipalityId, date:moment().format('YYYY-MM-DDTHH:mm:ss'),currentPrice: $scope.currentPrice});
    if ($scope.currentPrice=="Low") {
        $scope.priceIcon='ion-happy-outline';
        $scope.priceIconColor="balanced";
    }
    else {
        $scope.priceIcon='ion-sad-outline';
        $scope.priceIconColor="energized";
    }
  }, function(err) {
    // console.error(err.status);

    // err.status will contain the status code
  });
// $scope.timeRemaining = getTimeRemaining();

//reset global variablemunicipalityIdReal

$http.get(Config.host+'/api/energyMeteo/tou?municipalityId='+municipalityIdReal+"&userid="+currentUserId).then(function(resp) {
    var energyWeatherData = resp.data.data;
    mixpanel.trentino.track('Trentino prosumption data requested:',{Category: "Energy meteo history",ContractId:currentUserId, municipality:municipalityId, userEmail: userEmail, date:moment().format('YYYY-MM-DDTHH:mm:ss')});
    //iterate over the array to format data
    var energyWeatherDataArray = new Array();
    for(i =0; i< energyWeatherData.length; i++ ){
        var energyWeatherObj = new Object();
        energyWeatherObj.date = moment(energyWeatherData[i].date).format('DD-MM HH:mm');
        energyWeatherObj.tarif = energyWeatherData[i].tarif;
        energyWeatherDataArray.push(energyWeatherObj);
    }
    $rootScope.energyWeatherDataVector = energyWeatherDataArray;
    }, function(err) {
        // console.error(err.status);

    // err.status will contain the status code
    });

$scope.futurePriceIcons = [];
$scope.futurePriceIconColors = [];

for (var i=0; i<$rootScope.energyWeatherDataVector.length; i++) {
    if ($rootScope.energyWeatherDataVector[i].tarif=="Low") {
        $scope.futurePriceIcons[i]='ion-happy-outline';
        $scope.futurePriceIconColors[i]="balanced";
    }
    else {
        $scope.futurePriceIcons[i]='ion-sad-outline';
        $scope.futurePriceIconColors[i]="energized";
    }  
}

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
        series: [{
            name: 'consumo',
            data: [],
             dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:black">{y}</span><br/>' + 
                    '<span style="font-size:12px;color:silver">WH</span></div>'
            }
        }],

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
$http.get(Config.host+'/api/consumption/last?userid='+currentUserId).then(function(resp) {
    var lastConsumptionData = resp.data.consumption;
    mixpanel.trentino.track('Trentino prosumption data requested:',{Category: "Last consumption data",ContractId:currentUserId, municipality:municipalityId, userEmail: userEmail, consumptionLevel:lastConsumptionData, date:moment().format('YYYY-MM-DDTHH:mm:ss'),currentPrice: $scope.currentPrice});
    $rootScope.chartConfigLastConsumption.series = [{
            name: 'consumo',
            data: [lastConsumptionData],
             dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:black">{y}</span><br/>' + 
                    '<span style="font-size:12px;color:silver">WH</span></div>'
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
        series: [{
            name: 'produzione',
            data: [],
             dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:black">{y}</span><br/>' + 
                    '<span style="font-size:12px;color:silver">WH</span></div>'
            }
        }],

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
$http.get(Config.host+'/api/production/last?userid='+currentUserId).then(function(resp) {
    var lastProductionData = resp.data.production;
    mixpanel.trentino.track('Trentino prosumption data requested:',{Category: "Last production data",ContractId:currentUserId, municipality:municipalityId, userEmail: userEmail, productionLevel:lastProductionData, date:moment().format('YYYY-MM-DDTHH:mm:ss')});
    $rootScope.chartConfigLastProduction.series = [{
            name: 'produzione',
            data: [lastProductionData],
             dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px;color:black">{y}</span><br/>' + 
                    '<span style="font-size:12px;color:silver">WH</span></div>'
            }
        }];
    }, function(err){
        console.error(err.status);
    // err.status will contain the status code
    });

$scope.listOfAppliancesName=[];
$http.get(Config.host+'/api/consumption/appliance?userid='+currentUserId).then(function(resp) {
    $scope.listOfAppliances=resp.data;
    mixpanel.trentino.track('Trentino prosumption data requested:',{Category: "List of appliances data",ContractId:currentUserId, municipality:municipalityId, userEmail: userEmail, date:moment().format('YYYY-MM-DDTHH:mm:ss')});    
//var applianceId;
    //create list of names of appliances for visualization purposes
for (i=0;i<$scope.listOfAppliances.length;i++) {
    $scope.listOfAppliancesName.push($scope.listOfAppliances[i]);  
}

    }, function(err){
        console.error(err.status);
    // err.status will contain the status code
    });

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
                            text: 'WH'
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
        
        var startDateAppliance = moment.utc(startDate).add(1,'days').format('YYYY-MM-DD') ;
        var endDateAppliance=  moment.utc(endDate).add(1,'days').format('YYYY-MM-DD') ;
        var applianceData=[];
        $http.get(Config.host+'/api/consumption/appliance/'+ApplianceId+"?userid="+currentUserId+"&from="+startDateAppliance+ "&to="+endDateAppliance).then(function(resp) {
        applianceData.push(resp.data);
        mixpanel.trentino.track('Trentino prosumption data requested:',{Category: "Specific appliance data:",ContractId:currentUserId, municipality:municipalityId, userEmail: userEmail, appliance:ApplianceId, fromDate: startDateAppliance, toDate: endDateAppliance, date:moment().format('YYYY-MM-DDTHH:mm:ss')});    
        // create a copy of the array
        var cleanApplianceData = _.clone(applianceData[0]); // create a copy of the array
        var tempArrayDays = new Array();
        for (i=0;i<cleanApplianceData.length;i++) {
            //create list of names of appliances for visualization purposes
            var TempArray = [];
            var tempDayClean = moment.utc(cleanApplianceData[i].date).add(1,'days').format('DD-MM-YYYY');

            //format the date for highchart to work
            TempArray.push("\""+tempDayClean+ "\"",parseFloat(cleanApplianceData[i].consumption).toFixed(3));
            //pass the last index

            if(i == (cleanApplianceData.length - 1)){
                chartData = chartData + '[' + TempArray + ']';
                // add complete date with hour and minutes, to check last time appliance is active
                tempArrayDays.push(moment.utc(cleanApplianceData[i].date).add(1,'days').format('DD-MM-YYYY HH:mm:ss'));
            }
            else{
                tempArrayDays.push(tempDayClean);
                chartData = chartData + '[' + TempArray + '],';
        }
        }
    chartData = chartData+']'; // add closing tag for the dataset
        // start chart configuration


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
            console.error(err.status);
        // err.status will contain the status code
        });
                   $state.go('main.prosumption.vizAppliance')
};
// has production part
$scope.hasProduction = false;
$http.get(Config.host+'/api/production/hasProduction?userid='+currentUserId).then(function(resp) {
    if(resp.data.production == true){
        $scope.hasProduction = true; 
    }
}, function(err){
        console.error(err.status);
    // err.status will contain the status code
    });

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

//add for highchart title traslations, TODO

//end of dataVizCtrl controller
}]);