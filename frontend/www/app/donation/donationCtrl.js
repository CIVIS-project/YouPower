angular.module('civis.youpower.donation').controller('donationCtrl', donationCtrl);
function getRandomData() {
    return Math.floor((Math.random()*6)+1);
}

function donationCtrl($scope, $stateParams, $state, User) {
//DM: now content removed, kept just for future usage if needed (using ui-sref instead of href in nav-bar)
//just loads the content of the window once the tabs have been generated
//$state.go('main.donation');
$scope.projectDescription = "Miser Catulle, desinas ineptire, et quod vides perisse perditum ducas. fulsere quondam candidi tibi soles, cum ventitabas quo puella ducebat amata nobis quantum amabitur nulla. ibi illa multa cum iocosa fiebant, quae tu volebas nec puella nolebat, fulsere vere candidi tibi soles. nunc iam illa non vult: tu quoque impotens noli, nec quae fugit sectare, nec miser vive, sed obstinata mente perfer, obdura. vale puella, iam Catullus obdurat, nec te requiret nec rogabit invitam. at tu dolebis, cum rogaberis nulla. scelesta, vae te, quae tibi manet vita? quis nunc te adibit? cui videberis bella? quem nunc amabis? cuius esse diceris? quem basiabis? cui labella mordebis? at tu, Catulle, destinatus obdura.";
//console.log($state.projectDescription);

//now plots the trend over time, use random data for the time being
var limit = 10;
var donationTimeSeries=[];
var donationTimeAxis=[];
for (var i=0; i<limit; i++) {
    donationTimeAxis.push(Date(2015,9,1+i).toString());
    donationTimeSeries.push((i==0? 0 : getRandomData()+donationTimeSeries[i-1]))
};

$scope.currentFunding = donationTimeSeries[limit-1];
$scope.targetFunding = 300
$scope.fundingRatio = 100 * $scope.currentFunding / $scope.targetFunding

$scope.chartConfigDonationTimeSeries = {
    options: {
        chart: {
            type: 'spline'
        },
        legend: {
            enabled: false
        },
        xAxis: {
            type: 'datetime',
            categories : donationTimeAxis
        }
    },
    title: {
        text: 'Donation Campaign Trend'
    },
    series: [{
        name: 'Funding',
        color: "#003366",
        marker: {
            symbol: 'circle'
        },
        lineWidth : 4,
        data :  donationTimeSeries,
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
}
