var prosumptionModule = angular.module('civis.youpower.prosumption');
prosumptionModule.service('usagePointFinderService',function($http,Config){
    return{
        get: function(contractId){
            return $http.get(Config.host + '/api/consumption/getUsagePointId?contractId=' + contractId);
        }
    } 
});
prosumptionModule.service('consumptionService', function($http,Config){
    return{
        get: function(usagePointId,fromDate,toDate){
            return $http.get(Config.host+'/api/consumption?userid='+ usagePointId + '&from='+ fromDate + '&to='+ toDate+"&requestSource=2&res=HOURLY");
        }
    } 
});
prosumptionModule.service('addHourlyConsumptionService',function($http,Config){
    return{
        post: function(specificConsumptionData,city){
            return $http.post(Config.host+'/api/consumption/addHourlyConsumption',[specificConsumptionData,city]);
        }
    } 
});
prosumptionModule.controller('dataVizCtrl',
    function dataVizCtrl($scope, $rootScope, $state, User, $http, Config, $q, currentUser, $translate,$timeout,usagePointFinderService,consumptionService,addHourlyConsumptionService) {
        //just loads the content of the window once the tabs have been generated
        //$state.go('main.prosumption.yours');
        var consumptionDataStore = '';
        var productionDataStore = '';
        var currentUserId = $scope.currentUser.profile.contractId;
        var municipalityId = $scope.currentUser.profile.testLocation;
        var userEmail = $scope.currentUser.email;
        /**
    CEIS -- corresponds to San Lorenzo in Banale
    CEdis -- corresponds to storo
    */
        var municipalityIdReal = ((municipalityId == 'CEIS') ? 'sanlorenzo' : 'storo');
        
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
                text: $translate.instant('Historical_prod_cons_level')
            },
            series: [{
                name: $translate.instant('Last_measured_prod'),
                data: [],
            }, {
                name: $translate.instant('Last_measured_Cons'),
                data: [],
            }],
        };
        $scope.getPersonalHistory = function(startDate, endDate) {
                var historyStartDate = moment.utc(startDate).add('days', 1).format('YYYY-MM-DD');
                var historyEndDate = moment.utc(endDate).add('days', 1).format('YYYY-MM-DD');
                var promisedData = $q.all([
                    $http.get(Config.host + '/api/consumption?userid=' + currentUserId + '&from=' + historyStartDate + '&to=' + historyEndDate),
                    $http.get(Config.host + '/api/production?userid=' + currentUserId + '&from=' + historyStartDate + '&to=' + historyEndDate)
                ]).then(function(data) {
                        mixpanel.track('Trentino prosumption data requested:', { Category: "Personal production/consumption comparision", ContractId: currentUserId, userEmail: userEmail, municipality: municipalityId, fromDate: historyStartDate, toDate: historyEndDate, date: moment().format('YYYY-MM-DDTHH:mm:ss') });
                        // production
                        var production_data = data[1].data;
                        var consumption_data = data[0].data;
                        //preprocess production dataset
                        var cleanApplianceDatap = _.clone(production_data); // create a copy of the array
                        //console.dir(cleanApplianceDatap);
                        productionDataStore = productionDataStore + '[';
                        var tempArrayDaysp = new Array();
                        var productionDataArray = new Array();
                        for (i = 0; i < cleanApplianceDatap.length; i++) {
                            //create list of names of appliances for visualization purposes
                            var TempArrayp = [];
                            var productionValue = parseFloat(cleanApplianceDatap[i].production).toFixed(3);
                            var tempDayCleanp = moment.utc(cleanApplianceDatap[i].date).add(1, 'days').format('DD-MM-YYYY');
                            tempArrayDaysp.push(tempDayCleanp);
                            productionDataArray.push(parseFloat(productionValue));
                        }

                        //preprocess consumption dataset
                        var cleanApplianceDatac = _.clone(consumption_data); // create a copy of the array

                        var summedConsumptionData = {};
                        for (i = 0; i < cleanApplianceDatac.length; i++) {
                            var dateformatted = moment.utc(cleanApplianceDatac[i].date).add(1, 'days').format('DDMMYYYY');
                            var consumptionValue = parseFloat(cleanApplianceDatac[i].consumption).toFixed(3);
                            if(dateformatted in summedConsumptionData){
                                summedConsumptionData[dateformatted] = summedConsumptionData[dateformatted] + parseFloat(consumptionValue);
                            }else{
                                summedConsumptionData[dateformatted] = parseFloat(consumptionValue);
                            }
                        }

                        var consumptionDataArray = new Array();
                        for(key in summedConsumptionData){
                            var valuereceived = summedConsumptionData[key];
                            consumptionDataArray.push(valuereceived);
                        }
                        $rootScope.chartConfigComparisonHistorical.series = [{
                            name: $translate.instant('Last_measured_prod'),
                            data: JSON.parse(JSON.stringify(productionDataArray))
                        }, {
                            name: $translate.instant('Last_measured_Cons'),
                            data: JSON.parse(JSON.stringify(consumptionDataArray))
                        }];
                        $rootScope.chartConfigComparisonHistorical.xAxis = {
                            categories: JSON.parse(JSON.stringify(tempArrayDaysp))
                        };
                    },
                    function(err) {
                        console.error(err.status);
                    }
                );

                //change state after variables get updated
                $state.go('main.prosumption.vizHistoricalPersonal');


            } //end of getpersonalHistory function



        //$scope.chartConfigComparisonHistorical.series = z;

        // default value
        $scope.currentPrice = "High";

        ///fetch data for the yours/ tab
        // $scope.currentPrice= 0.12+(0.08*getRandomData());
        //$http.get(serverCN+'/api/tou/'+venue+'/current').then(function(resp) {
        $http.get(Config.host + '/api/energyMeteo/tou/current?municipalityId=' + municipalityIdReal + "&userid=" + currentUserId).then(function(resp) {
            $scope.currentPrice = resp.data.tarif;
            mixpanel.track('Trentino prosumption data requested:', { Category: "Current energy meteo", ContractId: currentUserId, userEmail: userEmail, municipality: municipalityId, date: moment().format('YYYY-MM-DDTHH:mm:ss'), currentPrice: $scope.currentPrice });
            if ($scope.currentPrice == "Low") {
                $scope.priceIcon = 'ion-happy-outline';
                $scope.priceIconColor = "balanced";
            } else {
                $scope.priceIcon = 'ion-sad-outline';
                $scope.priceIconColor = "energized";
            }
        }, function(err) {
            // console.error(err.status);

            // err.status will contain the status code
        });

        $http.get(Config.host + '/api/energyMeteo/tou?municipalityId=' + municipalityIdReal + "&userid=" + currentUserId).then(function(resp) {
            mixpanel.track('Trentino prosumption data requested:', { Category: "Energy meteo history", ContractId: currentUserId, municipality: municipalityId, userEmail: userEmail, date: moment().format('YYYY-MM-DDTHH:mm:ss') });
            var energyWeatherData = resp.data.data;
            //iterate over the array to format data
            var energyWeatherDataArray = new Array();
            for (i = 0; i < energyWeatherData.length; i++) {
                var energyWeatherObj = new Object();
                energyWeatherObj.date = moment(energyWeatherData[i].date).format('DD-MM HH:mm');
                energyWeatherObj.tarif = energyWeatherData[i].tarif;
                energyWeatherDataArray.push(energyWeatherObj);
            }
            $scope.energyWeatherDataVector = energyWeatherDataArray;
            $scope.futurePriceIcons = [];
            $scope.futurePriceIconColors = [];
            //display energy levels for the 30 hr period
            for (var i = 0; i < $scope.energyWeatherDataVector.length; i++) {
                if ($scope.energyWeatherDataVector[i].tarif == "Low") {
                    $scope.futurePriceIcons[i] = 'ion-happy-outline';
                    $scope.futurePriceIconColors[i] = "balanced";
                } else {
                    $scope.futurePriceIcons[i] = 'ion-sad-outline';
                    $scope.futurePriceIconColors[i] = "energized";
                }
            }
        }, function(err) {
            // console.error(err.status);

            // err.status will contain the status code
        });
    
        // visualization for last power consumption level
        $scope.chartConfigLastPowerConsumption = {
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
                        backgroundColor: '#EEE',
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
                name: 'Consumo',
                data: [],
                dataLabels: {
                    format: '<div style="text-align:center"><span style="font-size:25px;color:black">{y}</span><br/>' +
                        '<span style="font-size:12px;color:silver">W</span></div>'
                }
            }],

            title: {
                text: $translate.instant('powerConsumption'),
                y: 20
            },
            yAxis: {
                currentMin: 0,
                currentMax: 3000,
                title: {
                    y: 140
                },
                stops: [
                    [0.1, '#55BF3B'], // green
                    [0.9, '#DF5353'], // red
                    [0.5, '#DDDF0D'], // yellow
                ],
                lineWidth: 0,
                tickInterval: 500,
                tickPixelInterval: 400,
                tickWidth: 0,
                labels: {
                    y: 15
                }
            },
            loading: false
        };
        // initialize last consumption gauge

        $scope.chartConfigLastConsumption = {
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
                        backgroundColor: '#EEE',
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
                text: $translate.instant('energyConsumption'),
                y: 20
            },
            yAxis: {
                currentMin: 0,
                currentMax: 300,
                title: {
                    y: 140
                },
                stops: [
                    [0.1, '#55BF3B'], // green
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
        $scope.consumptionTimeStamp = '';
        var consumption_Power_Level = 0;
        $http.get(Config.host + '/api/consumption/last?userid=' + currentUserId).then(function(resp) {
            var lastConsumptionData = resp.data.consumption;
            consumption_Power_Level = resp.data.power_Level;
            $scope.consumptionTimeStamp = resp.data.startTime;
            $scope.chartConfigLastConsumption.series = [{
                name: 'consumo',
                data: [JSON.parse(lastConsumptionData)],
                dataLabels: {
                    format: '<div style="text-align:center"><span style="font-size:25px;color:black">{y}</span><br/>' +
                        '<span style="font-size:12px;color:silver">WH</span></div>'
                }
            }];
            $scope.chartConfigLastPowerConsumption.series = [{
                name: 'consumo',
                data: [JSON.parse(consumption_Power_Level)],
                dataLabels: {
                    format: '<div style="text-align:center"><span style="font-size:25px;color:black">{y}</span><br/>' +
                        '<span style="font-size:12px;color:silver">W</span></div>'
                }
            }];

        }, function(err) {
            console.error(err.status);
            // err.status will contain the status code
        });
        // visualization for last power production level
        $scope.chartConfigLastPowerProduction = {
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
                        backgroundColor: '#EEE',
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
                name: 'Production power live',
                data: [],
                dataLabels: {
                    format: '<div style="text-align:center"><span style="font-size:25px;color:black">{y}</span><br/>' +
                        '<span style="font-size:12px;color:silver">W</span></div>'
                }
            }],

            title: {
                text: $translate.instant('powerProduction'),
                y: 20
            },
            yAxis: {
                currentMin: 0,
                currentMax: 3000,
                title: {
                    y: 140
                },
                stops: [
                    [0.1, '#55BF3B'], // green
                    [0.9, '#DF5353'], // red
                    [0.5, '#DDDF0D'], // yellow
                ],
                lineWidth: 0,
                tickInterval: 500,
                tickPixelInterval: 400,
                tickWidth: 0,
                labels: {
                    y: 15
                }
            },
            loading: false
        };

        $scope.sampleProdPower = ''
            // initialize last production gauge


        $scope.chartConfigLastProduction = {
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
                        backgroundColor: '#EEE',
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
                text: $translate.instant('energyProduction'),
                y: 20
            },
            yAxis: {
                currentMin: 0,
                currentMax: 300,
                title: {
                    y: 140
                },
                stops: [
                    [0.1, '#55BF3B'], // green
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
        var production_Power_Level = 0;
        $scope.productionTimeStamp = '';
        $scope.hasProduction = false;
        $http.get(Config.host + '/api/production/last?userid=' + currentUserId).then(function(resp) {
            var lastProductionData = resp.data.production;
            $scope.hasProduction = true;
            production_Power_Level = resp.data.power_Level;
            $scope.productionTimeStamp = resp.data.startTime;
            $scope.chartConfigLastProduction.series = [{
                name: 'produzione',
                data: [JSON.parse(lastProductionData)],
                dataLabels: {
                    format: '<div style="text-align:center"><span style="font-size:25px;color:black">{y}</span><br/>' +
                        '<span style="font-size:12px;color:silver">WH</span></div>'
                }
            }];
            $scope.chartConfigLastPowerProduction.series = [{
                name: 'produzione',
                data: [JSON.parse(production_Power_Level)],
                dataLabels: {
                    format: '<div style="text-align:center"><span style="font-size:25px;color:black">{y}</span><br/>' +
                        '<span style="font-size:12px;color:silver">W</span></div>'
                }
            }];
        }, function(err) {
            console.error(err.status);
            // err.status will contain the status code
        });


        // list of appliances visualization part implementation

        $scope.listOfAppliancesName = [];
        $http.get(Config.host + '/api/consumption/appliance?userid=' + currentUserId).then(function(resp) {
            $scope.listOfAppliances = resp.data;
            //var applianceId;
            //create list of names of appliances for visualization purposes
            for (i = 0; i < $scope.listOfAppliances.length; i++) {
                $scope.listOfAppliancesName.push($scope.listOfAppliances[i]);
            }

        }, function(err) {
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
                text: $translate.instant('Appliance_Cons')
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'WH'
                },
                min: 0
            },

            series: [{
                name: $translate.instant('Last_measured_Cons'),
                data: [],
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                threshold: null
            }],
            loading: false
        };

        // var chartData='[[04/10/2015,534.827468425035],[04/10/2015,213.072995232185],[04/10/2015,281.020645804703],[05/10/2015,526.704251356423],[05/10/2015,218.13283588551],[05/10/2015,299.548069406301]]';
        $scope.assignApplianceParam = function(ApplianceId, startDate, endDate) {

            // start the web service to fetch appliance data
            //get the start and end dates

            var startDateAppliance = moment.utc(startDate).add(1, 'days').format('YYYY-MM-DD');
            var endDateAppliance = moment.utc(endDate).add(1, 'days').format('YYYY-MM-DD');
            var applianceData = [];
            $http.get(Config.host + '/api/consumption/appliance/' + ApplianceId + "?userid=" + currentUserId + "&from=" + startDateAppliance + "&to=" + endDateAppliance).then(function(resp) {
                applianceData.push(resp.data);
                mixpanel.track('Trentino prosumption data requested:', { Category: "Specific appliance data:", ContractId: currentUserId, municipality: municipalityId, userEmail: userEmail, appliance: ApplianceId, fromDate: startDateAppliance, toDate: endDateAppliance, date: moment().format('YYYY-MM-DDTHH:mm:ss') });
                var cleanApplianceData = applianceData[0]; 
                var tempArrayDays = new Array();
                var summedApplianceCons = {};
                for (i = 0; i < cleanApplianceData.length; i++) {
                    //create list of names of appliances for visualization purposes
                    var dateformatted = moment.utc(cleanApplianceData[i].date).add(1, 'days').format('DDMMYYYY');
                    var consumptionValue = parseFloat(cleanApplianceData[i].consumption).toFixed(3);
                    var DateForGraphIndex = moment.utc(cleanApplianceData[i].date).add(1, 'days').format('DD-MM-YYYY');
                    if(dateformatted in summedApplianceCons){
                        summedApplianceCons[dateformatted] = summedApplianceCons[dateformatted] + parseFloat(consumptionValue);
                    }else{
                        summedApplianceCons[dateformatted] = parseFloat(consumptionValue);
                        tempArrayDays.push(DateForGraphIndex);
                    }                        
                }
                    var consumptionApplianceArray = new Array();
                    for(key in summedApplianceCons){
                        var valuereceived = summedApplianceCons[key];
                        consumptionApplianceArray.push(valuereceived);
                    }


                //update the chart
                $rootScope.chartConfigAppliance2.series = [{
                    name: $translate.instant('Last_measured_Cons'),
                    data: JSON.parse(JSON.stringify(consumptionApplianceArray)),
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
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
            }, function(err) {
                console.error(err.status);
                // err.status will contain the status code
            });
            $state.go('main.prosumption.vizAppliance')
        };
        // has production part
        $scope.hasPV = false;
        $http.get(Config.host + '/api/production/hasProduction?userid=' + currentUserId).then(function(resp) {
            if (resp.data.production == true) {
                $scope.hasPV = true;
            }
        }, function(err) {
            console.error(err.status);
            // err.status will contain the status code
        });

        // add scope for filtering production and consumption from other appliances
        // Should be modified, better if changed from the schema
        $scope.applicanceFilter = function(name) {
            return name._id === '0' ||
                name._id === '8';
        }
        $scope.applicanceFilterNonProCons = function(name) {
                return !(name._id === '0') &&
                    !(name._id === '32') &&
                    !(name._id === '8');
            }
        // Meteo history statistical information can be generated with the following script
        
        $scope.getMeteoConsumptionHistory = function(){
            var startMeteoDate = moment.utc("2016-03-10").format('YYYY-MM-DD') ;
            var endMeteoDate=  moment.utc("2016-05-31").format('YYYY-MM-DD') ;
            var meteoHistoryData = [];
            var totalConsumptionInRed = 0;
            var totalConsumptionInGreen = 0;
            var summaryInformation = [];
            $http.get(Config.host+'/api/energyMeteo/meteodata?municipalityId='+municipalityIdReal).then(function(resp) {
                meteoHistoryData = resp.data;
                //get all usage points
               
                $http.get(Config.host+'/api/consumption/usagepoints?municipalityId='+municipalityIdReal).then(function(resp){
                    var usagepoints = resp.data;
                    var usagepointCopy = usagepoints;
                    var m = 0;
                    for(var i = 0; i< usagepoints.length; i++){
                        $http.get(Config.host+'/api/consumption?userid='+ usagepoints[i] + '&from='+ startMeteoDate + '&to='+ endMeteoDate+"&requestSource=2&res=HOURLY").then(function(resp){
                            var consumptionData = resp.data;
                            totalConsumptionInRed = 0;
                            totalConsumptionInGreen = 0;
                            var contractId;
                            //iterate over all the the meteo history until a match is found
                            for(var j = 0;j < consumptionData.length; j++){
                                contractId = consumptionData[j].contractId;
                                for(var k = 0; k<meteoHistoryData.length; k++){
                                    var conDate = new Date(consumptionData[j].date);
                                    // console.log("Consumption date:",conDate);
                                    var meteoDate = new Date(meteoHistoryData[k].DateTaken);
                                    if((conDate >= meteoDate) && (conDate < new Date(moment(meteoDate).add(3,'hours')))){
                                        // console.log("meteoDate:", meteoDate);
                                        // console.log(consumptionData[j].consumption);
                                        if(meteoHistoryData[k].Level == 'Low'){
                                            totalConsumptionInRed = totalConsumptionInRed + Number(consumptionData[j].averagePower);
                                        }else{
                                            // console.log("High:",meteoHistoryData[k].Level);
                                            // console.log("Amount:",consumptionData[j].consumption);
                                            totalConsumptionInGreen = totalConsumptionInGreen + Number(consumptionData[j].averagePower);
                                        }
                                        break; // break out of loop if a match found
                                    }
                            }

                            } // end of for -- consumption data 
                            summaryInformation.push({
                                                    City: municipalityIdReal,
                                                    Green: totalConsumptionInGreen,
                                                    Red: totalConsumptionInRed,
                                                    UsagePoint: contractId,
                                                    DateTakenLast: endMeteoDate
                                                });
                            console.dir(summaryInformation);
                            // return [{"red":totalConsumptionInRed},{"green":totalConsumptionInGreen}];
                        });
                        // console.log("End of the world");
                     
                    } // end of usagepoints for 
                   
                }); 
                
        }); 
            
            // $state.go('main.prosumption.vizHistoricalComparison');
             
        }  

        $scope.chartConfigPersonalConsumption = {
            options: {
                chart: {
                    type: 'pie',
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                },
                 tooltip: {
            formatter: function() {
                return this.point.name + '<br /> ' + Math.round(this.percentage * 100) / 100 + ' %';
            }
        },
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                return Math.round(this.percentage * 100) / 100 + ' %';
                            },
                            distance: -30,
                            color: 'white'
                        },
                        showInLegend: true
                    }
                },
                colors: ['#008000', '#F7931D'],
            },
            series: [{
                type: 'pie',
                name: $translate.instant('Power_Consumption_In_Red'),
                data: [],
            }, {
                name: $translate.instant('Power_Consumption_In_Green'),
                data: [],
            }],
            title: {
                text: $translate.instant('Personal_Power_Consumption')
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            loading: false
        };
        $scope.chartConfigCommunityConsumption = {
            options: {
                chart: {
                    type: 'pie',
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                },
                 tooltip: {
            formatter: function() {
                return this.point.name + '<br /> ' + Math.round(this.percentage * 100) / 100 + ' %';
            }
        },
                plotOptions: {
                    series: {
                        dataLabels: {
                            enabled: true,
                            formatter: function() {
                                return Math.round(this.percentage * 100) / 100 + ' %';
                            },
                            distance: -30,
                            color: 'white'
                        },
                        showInLegend: true
                    }
                },
                colors: ['#008000', '#F7931D'],
            },
            series: [{
                name: $translate.instant('Power_Consumption_In_Red'),
                data: [],
            }, {
                name: $translate.instant('Power_Consumption_In_Green'),
                data: [],
            }],
            title: {
                text: $translate.instant('Community_Power_Consumption')
            },
            tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
            },
            loading: false
        };
        var totalConsumptionInGreen = 0.0;
        var totalConsumptionInRed = 0.0;
        var totalPersonalInGreen = 0.0;
        var totalPersonalInRed = 0.0;

        $http.get(Config.host + '/api/consumption/allUsagePointsSummary?userid=' + currentUserId).then(function(resp) {
            var usageSummaryData = resp.data;
            mixpanel.track('Trentino prosumption data requested:', { Category: "Personal/community power con. chart request", ContractId: currentUserId, userEmail: userEmail, municipality: municipalityId, date: moment().format('YYYY-MM-DDTHH:mm:ss') });
            var userId = usageSummaryData[usageSummaryData.length - 1];
            $scope.LastDateConsumptionRecord = usageSummaryData[0].DateTakenLast;
            for (var i = 0; i < usageSummaryData.length - 1; i++) {
                if (usageSummaryData[i].City == municipalityIdReal) {
                    totalConsumptionInRed += Number(usageSummaryData[i].Red) / 1000;
                    totalConsumptionInGreen += Number(usageSummaryData[i].Green) / 1000;
                }
                if (userId == usageSummaryData[i].UsagePoint) {
                    totalPersonalInGreen = Number((Number(usageSummaryData[i].Green) / 1000).toFixed(2));
                    totalPersonalInRed = Number((Number(usageSummaryData[i].Red) / 1000).toFixed(2));
                }
            }
            totalConsumptionInRed = Number(totalConsumptionInRed.toFixed(2));
            totalConsumptionInGreen = Number(totalConsumptionInGreen.toFixed(2));

            $scope.chartConfigCommunityConsumption.series = [{
                name: $translate.instant('Total_consumption'),
                colorByPoint: true,
                data: [{
                    name: $translate.instant('Power_Consumption_In_Green'),
                    y: totalConsumptionInGreen
                }, {
                    name: $translate.instant('Power_Consumption_In_Red'),
                    y: totalConsumptionInRed
                }]
            }];

            $scope.chartConfigPersonalConsumption.series = [{
                name: $translate.instant('Total_consumption'),
                colorByPoint: true,
                data: [{
                    name: $translate.instant('Power_Consumption_In_Green'),
                    y: totalPersonalInGreen
                }, {
                    name: $translate.instant('Power_Consumption_In_Red'),
                    y: totalPersonalInRed
                }]
            }];

        });

// start of consumpsion comparision in municipalities
$rootScope.chartConfigHistoryComparison = 
{
        options: {
                chart: {
                    type: 'area',
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                },
          plotOptions: {
            area: {
                pointStart: 0,
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        colors: ['#FF974C', '#84BA5B']
    },
     yAxis: {
                title: {
                    text: 'WH'
                },
                plotLines: [{
                    color: '#808080'
                }]
        },  
    xAxis: {
                title: {
                    text: 'Hour'
                },
                categories : [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
                min: 0,
                max: 23
    },
        
        scrollbar: {
            enabled: true
        },    
        series: [{
                    name: $translate.instant('CEIS_Legend'),
                    data: []
                }, {
                    name: $translate.instant('CEDIS_Legend'),
                    data: []
                }], 
                title: {
                text: $translate.instant('CEIS_CEDIS'),
                y: 20
            }
    }
    $rootScope.chartConfigHistoryComparisonPersonal = 
{
        options: {
                chart: {
                    type: 'area',
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                },
                 plotOptions: {
            area: {
                pointStart: 0,
                marker: {
                    enabled: false,
                    symbol: 'circle',
                    radius: 2,
                    states: {
                        hover: {
                            enabled: true
                        }
                    }
                }
            }
        },
        colors: ['#FF974C', '#84BA5B','#7293CB']
    },
    yAxis: {
                title: {
                    text: 'WH'
                },
                plotLines: [{
                    color: '#808080'
                }]
        },
    xAxis: {
        title: {
            text: 'Hour'
        },
        categories : [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23],
        min: 0,
        max: 23
    },
                
        series: [{
                    name: $translate.instant('Total'),
                    data: []
                }, {
                    name: $translate.instant('Average'),
                    data: []
                },{
                    name: $translate.instant('Personal'),
                    data: []
            }],
            title: {
                text: $translate.instant('Area_Consumption'),
                y: 20
            }
    }
    // define controller for getting the required data from the web service
    //the code needs substantial refactoring and will be done coming weeks!
     $scope.dataNotAvailable = false;
     $scope.getHourlyConsumption = function(requestedDate){
            var requiredDate = moment.utc(requestedDate).add('days', 1).format('YYYY-MM-DD') ;
            var fromDate = moment(requiredDate).format('YYYY-MM-DD') + 'T00:00:00';
            var toDate = moment(requiredDate).format('YYYY-MM-DD');
            var meteoHistoryData = [];
            usagePointFinderService.get(currentUserId).then(function(res){
            var currentUsagePointReal = Number(res.data.apartmentID);
            $http.get(Config.host+'/api/consumption/hourlyconsumption?givenDate='+requiredDate).then(function(resp) {
                var hourlyConsumption = resp.data;
                //update once in a day of the consumption record and dump data to server from remote service
                if(hourlyConsumption[0].length == 0){
                     $scope.dataNotAvailable = true;
                     $http.get(Config.host+'/api/consumption/usagepoints?municipalityId=storo').then(function(resp){
                       var storoUsagePoints  = resp.data;
                       mixpanel.track('Trentino prosumption data requested:', { Category: "Performance and benchmark", ContractId: currentUserId, userEmail: userEmail, municipality: municipalityId, date: moment().format('YYYY-MM-DDTHH:mm:ss'), requestType: "New"});
                       for(var i = 0; i<storoUsagePoints.length; i++){
                        consumptionService.get(storoUsagePoints[i], fromDate, toDate).then(function(resp2){
                             var specificConsumptionData = resp2.data;
                             addHourlyConsumptionService.post(specificConsumptionData,"storo");
                        });     
                       }
                    }); 
                     $http.get(Config.host+'/api/consumption/usagepoints?municipalityId=sanlorenzo').then(function(resp){
                       var sanLorenzoUsagePoints = resp.data;
                       for(var j = 0; j<sanLorenzoUsagePoints.length; j++){
                        consumptionService.get(sanLorenzoUsagePoints[j], fromDate, toDate).then(function(resp2){
                            var specificConsumptionData = resp2.data;
                            addHourlyConsumptionService.post(specificConsumptionData,"sanlorenzo");
                        });     
                       }
                    }); 
                $timeout(function() {
                        window.location.reload();
                     }, 20000); 
              } 
              else{

              $scope.dataNotAvailable = false;
              $state.go('main.prosumption.vizHistoricalComparison');
              mixpanel.track('Trentino prosumption data requested:', { Category: "Performance and benchmark", ContractId: currentUserId, userEmail: userEmail, municipality: municipalityId, date: moment().format('YYYY-MM-DDTHH:mm:ss'), requestType: "Existing data"});
              //call the web service and start processing the information, intialize an empty array 
              var hourlyUsagePersonal = Array.apply(0, Array(24)).map(function () { return 0; });
              var hourlyUsageCEISTotal = Array.apply(0, Array(24)).map(function () { return 0; });
              var hourlyUsageCEDISTotal = Array.apply(0, Array(24)).map(function () { return 0; });
              var hourlyAVGUsageMunicipality = Array.apply(0, Array(24)).map(function () { return 0; });
              var averagecount = 0;
              var contractIdChanged = 0;
              var numberOfStoroPoints = [];
              var numberOfSanLorenzoPoints = [];
              $http.get(Config.host+'/api/consumption/hourlyconsumption?givenDate='+requiredDate).then(function(resp) {
                hourlyConsumption = resp.data;
                hourlyConsumption[0].forEach(function(result){
                    var retrivedDate = new Date(result.DateTaken);
                    var hourPart = retrivedDate.getUTCHours();
                    var currentConsumption = Number(result.HourlyTotal);
                    var currentUsagePoint  = Number(result.ApartmentID);
                    if(currentUsagePoint == currentUsagePointReal){
                            hourlyUsagePersonal[hourPart] = Number(currentConsumption.toFixed(2));
                        }
                    if(result.City == "storo"){
                        hourlyUsageCEISTotal[hourPart] = hourlyUsageCEISTotal[hourPart] + currentConsumption;
                        if(numberOfStoroPoints.indexOf(currentUsagePoint) == -1){
                            numberOfStoroPoints.push(currentUsagePoint);
                        }
                    }
                    if(result.City == "sanlorenzo"){
                        hourlyUsageCEDISTotal[hourPart] = hourlyUsageCEDISTotal[hourPart] + currentConsumption;
                    if(numberOfSanLorenzoPoints.indexOf(currentUsagePoint) == -1 ){
                            numberOfSanLorenzoPoints.push(currentUsagePoint);
                        }
                    }

                });
                //Choose the current municipality id to find the corresponding average
                var targetHoulyConsumption = [];
                var targetTotalHouseholds = 0;
                if(municipalityIdReal == "storo"){
                    targetHoulyConsumption = hourlyUsageCEISTotal.slice();
                    targetTotalHouseholds = numberOfStoroPoints.length;
                }
                else{
                    targetHoulyConsumption = hourlyUsageCEDISTotal.slice();
                    targetTotalHouseholds = numberOfSanLorenzoPoints.length;
                }
                // find the average
                for(var j = 0; j<24; j++){
                    hourlyAVGUsageMunicipality[j] = Number((targetHoulyConsumption[j]/targetTotalHouseholds).toFixed(2));
                }
                // normalize CEIS and CEDIS values as the number of residents are
                // If no consumption record is found in a municipality, show the existing one 
                if(numberOfStoroPoints.length!=0){
                  for(k = 0; k<24; k++){
                    hourlyUsageCEISTotal[k] = Number(Number(hourlyUsageCEISTotal[k]/numberOfStoroPoints.length).toFixed(2));
                }  
             }   
                if(numberOfSanLorenzoPoints.length!=0){
                    for(m = 0; m<24; m++){
                        hourlyUsageCEDISTotal[m] = Number(Number(hourlyUsageCEDISTotal[m]/numberOfSanLorenzoPoints.length).toFixed(2));
                    }
             }


                // update the charts
                $scope.chartConfigHistoryComparison.series = 
                        [{
                    name: $translate.instant('CEIS_Legend'),
                    data: hourlyUsageCEISTotal
                }, {
                    name: $translate.instant('CEDIS_Legend'),
                    data: hourlyUsageCEDISTotal
                }];
                $rootScope.chartConfigHistoryComparisonPersonal.series = 
                        [{
                    name: $translate.instant('Total'),
                    data: targetHoulyConsumption
                }, {
                    name: $translate.instant('Average'),
                    data: hourlyAVGUsageMunicipality
                },{
                    name: $translate.instant('Personal'),
                    data: hourlyUsagePersonal
            }];

              }); 
           }  //end of else
            });//end of outer hourly consumption request
        });
        }
        //code for validating dates for comparision purposes
$scope.compareDates = function(datescoming){
    var pickedDate = moment(datescoming).format('MM-DD-YYYY');
    var toDay  = moment().format("MM-DD-YYYY");
    var startDate = moment(new Date(2016,3,10)).format("MM-DD-YYYY");
    // To be fixed as this feature will be deprecated in moment
    return !(moment(toDay).isAfter(pickedDate) && moment(startDate).isBefore(pickedDate))  ;
}
// mixpanel tracking
$scope.trackLastProduction = function(){
    mixpanel.track('Trentino prosumption data requested:', { Category: "Last production graph", ContractId: currentUserId, municipality: municipalityId, userEmail: userEmail, date: moment().format('YYYY-MM-DDTHH:mm:ss') });
}
$scope.trackLastConsumption = function(){
    mixpanel.track('Trentino prosumption data requested:', { Category: "Last consumption graph", ContractId: currentUserId, municipality: municipalityId, userEmail: userEmail, date: moment().format('YYYY-MM-DDTHH:mm:ss')});
}
    //end of dataVizCtrl controller
    });

