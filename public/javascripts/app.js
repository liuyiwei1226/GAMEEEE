/**
 * Created by crystal on 2018/11/24.
 */
var app = angular.module('CIS550',[]);

app.controller('HomePageController', function($scope, $http) {
    console.log('init controller!!!');
    var request = $http.get('/init');
    var request2 = $http.get('/init2');
    var request3 = $http.get('/init3');
    request.then(
        function(response){
            $scope.hottestGames = response.data;
            console.log('pass success');
            console.log(response)
        },
        function(error){
            console.log('pass parameter fail');
        });
    request2.then(
        function(response){
            $scope.latestGames = response.data;
            console.log('pass success latest');
            console.log(response)
        },
        function(error){
            console.log('pass parameter fail');
        });
    request3.then(
        function(response){
            $scope.freeGames = response.data;
            console.log('pass success free');
            console.log(response)
        },
        function(error){
            console.log('pass parameter fail');
        });
    // $rootScope.$broadcast('GameName', $scope.GameName);
    console.log('has been broadcast!!')

    $scope.SearchGame = function() {
        // window.location.href = "http://localhost:3000/search?" + $scope.GameName;
        window.location.href = "http://localhost:3000/search?" + $scope.GameName;
    };

    $scope.Goto = function (x) {
        window.location.href = "http://localhost:3000/search?" + x;
    }

});

app.controller('SearchController', function($scope, $http) {

    // $rootScope.$on('GameName', function (event, data) {
    //     console.log('has been listened !!')
    //     $scope.name = data;
    // })
    console.log('this is search controller');
    // var searchCon = angular.element(document.getElementById('GameName')).scope();

    var url = window.location.search;
    console.log(url);
    var request = $http.get('/search/' + url.substring(1));
    request.then(
        function(res){
            var data = res.data;
            for(var idx = 0; idx < data.length; idx++) {
                if (data[idx][3] == 0)
                    data[idx][3] = 'N/A';
            }
            console.log(data);
            $scope.GamesInfo = data;
        },
        function(error){
            console.log('fail');
        });
    
    $scope.FindDetail = function (x) {
        console.log(typeof x);
        window.location.href = "http://localhost:3000/searchDetail?" + x;
    }
});

app.controller('FilterSearchController', function ($scope, $http) {
    var request = $http.get('/filter/genres');
    request.then(
        function(res){
            var genreL = res.data;
            console.log(genreL);
            genreL.push("All genres");
            $scope.genres = genreL;
            console.log(res.data);
        },
        function(error){
            console.log('fail');
        });
    $scope.ages = ["All age", "13+", "17+"];
    $scope.prices = ["free", "non-free"];
    $scope.ratings = ["<70","70-90", ">90"];
    $scope.FilterGenre = "All genres";
    $scope.FilterAge = "All age";
    $scope.FilterPrice = "free";
    $scope.FilterRating = ">90";

    $scope.FilterSearch = function () {
        var age = $scope.FilterAge;
        console.log(age);
        var ageLeft = 0, ageRight = 0;
      
        if (age == "13+") {
            ageLeft = 13;
            ageRight = 18;
        }else if(age == "17+") {
            ageLeft = 17;
            ageRight = 18;
        }else if(age == "All age") {
            ageLeft = 0;
            ageRight = 0;
        } 

        var price = $scope.FilterPrice;
        console.log(price);
        var searchP = "false";
        if(price == "free")
            searchP = "true";
        var rate = $scope.FilterRating;
        var rateLeft = 0, rateRight = 0;
        if (rate == "<70") {
            rateLeft = 0;
            rateRight = 69;
        }else if(rate == "70-90"){
            rateLeft = 70;
            rateRight = 89;
        }else {
            rateLeft = 90;
            rateRight = 100;
        }
        
        console.log($scope.FilterGenre);

        if ($scope.FilterGenre == "All genres"){
            var request2 = $http.get('/filter/NoGenre/' + ageLeft + '/' + ageRight + '/' + searchP
                + "/" + rateLeft + '/' + rateRight);

            console.log(request2);
            request2.then(
                function(res){
                    $scope.returnData = res;
                },
                function(error){
                    console.log('fail');
                });
        }else {
            var request1 = $http.get('/filter/condition/' + $scope.FilterGenre + '/' + ageLeft + '/' + ageRight + '/' + searchP
                + "/" + rateLeft + '/' + rateRight);

            console.log(request1);
            request1.then(
                function(res){
                    $scope.returnData = res;
                },
                function(error){
                    console.log('fail');
                });
        }

    }
    
    $scope.FindDetail = function (x) {
        console.log(typeof x);
        window.location.href = "http://localhost:3000/searchDetail?" + x;
    }
    
});


//Get game information
app.controller('gameController', function($scope,$http) {
    console.log('init controller!!!');
    var url = window.location.search;
    console.log(url);
    var request1 = $http.get('/searchDetail/' + url.substring(1));
    var request2 = $http.get('/searchDetailM/' + url.substring(1));
    var request3 = $http.get('/lessReviews/' + url.substring(1));
    $scope.gameID = url.substring(1);
    request1.then(
        function(response){
            var data = response.data.rows;
            $scope.gameName = data[0][1];
            $scope.releaseDate = 'N/A'
            if(data[0][2]!==null){
                $scope.releaseDate = data[0][2].substring(0,10);
            }
            $scope.rqAge = data[0][3];
            if($scope.rqAge == 0 ){
                $scope.rqAge = 'All age';
            };
            $scope.rating = data[0][4];
            if($scope.rating == 0){
                $scope.rating ='N/A';
            };
            $scope.recommendCount = data[0][5];
            $scope.playerCount = data[0][6];
            $scope.price = Number(data[0][9]).toFixed(2)+ ' ' + data[0][7];
            $scope.url = data[0][10];
            $scope.background = '\''+ data[0][11] +'\'';
            $scope.image = data[0][12];
            $scope.description = data[0][13] + data[0][14]+ data[0][15] + data[0][16] + data[0][17];
        },
        function(error){
            console.log('pass parameter1 fail');
        });

    request2.then(
        function(response){
            var data = response.data;
            platforms = data.platforms;
            $scope.shortdes = data.short_description;
            $scope.longdes = data.detailed_description;
            $scope.platform = '';
            $scope.genres= '';
            $scope.categories='';
            if (platforms.windows){
                $scope.platform = $scope.platform + 'Windows'+ '; ';
            };
            if (platforms.mac){
                $scope.platform += 'Mac'+'; ';
            };
            if (platforms.linux){
                $scope.platform += 'Linux'+'; ';
            };
            if(data.genres==undefined){
                $scope.genres = 'N/A';
            }else{
                for(i=0;i<data.genres.length;i++){
                    $scope.genres += data.genres[i].description +';  ';
                };
            };
            if(data.categories==undefined){
                $scope.categories = 'N/A';
            }else{
                for(i=0;i<data.categories.length;i++){
                    $scope.categories += data.categories[i].description +';  ';
                };
            };
        },
        function(error){
            console.log('pass parameter2 fail');
        });

    request3.then(
        function(response){
            var data = response.data;
            if (data[0] == undefined){
                $scope.reviews1 = 'Oops! Few players have reviewed this game. Please share your review with us!';
                $scope.reviews2 ='';
                $scope.reviews3 ='';
                $scope.reviews4 ='';
                $scope.reviews5 ='';
            }else{
                $scope.reviews1 = data[0][0];
                $scope.reviews2 = data[1][0];
                $scope.reviews3 = data[2][0];
                $scope.reviews4 = data[3][0];
                $scope.reviews5 = data[4][0];
            };
        },
        function(error){
            console.log('pass parameter1 fail');
        });
    $scope.Insert= function() {
        var request = $http.get('/gameID/'+$scope.gameID+'/review/'+$scope.addReview);
        request.success(function(data) {
            $scope.data = data;
        });
        request.error(function(data){
            console.log('err');
        });

    };

});


app.controller('ReviewsController', function($scope,$http) {
    console.log('review controller!!!');
    // window.location.href = "http://localhost:3000/search?" + localStorage.getItem("transfer");
    // var request = $http.get('/search?' + localStorage.getItem("transfer"));
    var request = $http.get('/reviews/' + localStorage.getItem("transfer"));
    request.then(
        function(response){
            $scope.reviews = response.data;
            var total = 0;
            for (i = 0; i < $scope.reviews.length; i++) {
                if ($scope.reviews[i][1] == 1){
                    $scope.reviews[i][1] = 'GOOD!'
                    total = total + 1;
                } else if ($scope.reviews[i][1] == -1){
                    $scope.reviews[i][1] = 'BAD!'
                }else{
                    $scope.reviews[i][1] = 'N/A'
                }
            }
            $scope.reviewLength = $scope.reviews.length;
            if ($scope.reviewLength > 0) {
                $scope.goodRatio = Math.round(total/$scope.reviews.length * 100);
            } else{
                $scope.goodRatio = 0;
            }

            console.log('pass success');
            console.log(response)
        },
        function(error){
            console.log('pass parameter fail');
        });
});

app.controller('RecommendController', function($scope,$http) {

    var request2 = $http.get('/Recint');
    request2.then(
        function(response){
            $scope.IntialRec=response.data;
            console.log('Rec intial good');
        },
        function(error){
            console.log();('fail_Recintial');
        }
    );



    $scope.Recommend = function() {
        var request = $http.get('/rec/' + $scope.Recom);
        request.then(
            function(REC){
                $scope.Recoutput = REC.data;
                console.log($scope.Recoutput);
                console.log('controller!!! success');
            },
            function(error){
                console.log('fail');
            });
    };
    $scope.Recommend2 = function(T) {
        console.log(T);
        var request = $http.get('/rec/' + T);
        request.then(
            function(REC){
                $scope.Recoutput = REC.data;
                console.log($scope.Recoutput);
                console.log('controller222!!! success');
            },
            function(error){
                console.log('fail');
            });
    };
    $scope.Goto = function(x) {
        console.log("http://localhost:3000/search?" + x);
        window.location.href = "http://localhost:3000/search?" + x;

    };

});


app.controller('RecommendController2', function($scope,$http) {
    $scope.gameName=localStorage.getItem("pass")

    var request = $http.get('/getphoto/'+localStorage.getItem("pass"));
    request.then(
        function(REC){
            $scope.Intial=REC.data;
            console.log("goodddd");
        },
        function(error){
            console.log('fail');
        });
    var request2 = $http.get('/rec2/' + localStorage.getItem("pass"));
    console.log(localStorage.getItem("pass"));
    request2.then(
        function(REC){
            $scope.Recoutput = REC.data;
            console.log($scope.Recoutput);
            console.log('controller!!! success');
        },
        function(error){
            console.log('fail');
        });
    



    $scope.Recommend = function() {
        var request2 = $http.get('/rec/' + $scope.Recom);
        request2.then(
            function(REC){
                $scope.Recoutput = REC.data;
                console.log($scope.Recoutput);
                console.log('controller!!! success');
            },
            function(error){
                console.log('fail');
            });
    };
    
    $scope.searchGame = function () {
        window.location.href = "http://localhost:3000/search?" + $scope.Recom;
    };

    $scope.Goto = function(x) {
        console.log("http://localhost:3000/search?" + x);
        window.location.href = "http://localhost:3000/search?" + x;
    };

});
