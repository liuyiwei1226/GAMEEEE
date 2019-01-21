var express = require('express');
var router = express.Router();
var path = require('path');


var oracledb = require('oracledb');
oracledb.autoCommit = true;
var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient;

/* GET home page. */
router.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '../', 'views', 'index.html'));
});

router.get('/search', function(req, res) {
    res.sendFile(path.join(__dirname, '../', 'views', 'SearchGame.html'));
});

router.get('/searchDetail', function(req, res) {
    res.sendFile(path.join(__dirname, '../', 'views', 'GameInfo.html'));
});

router.get('/reviews', function(req, res) {
    console.log('reviews are here')
    res.sendFile(path.join(__dirname, '../', 'views', 'Reviews.html'));
});

router.get('/recommendation', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../', 'views', 'recommendation.html'));
});

router.get('/recommendation2', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../', 'views', 'Recommend2.html'));
});

router.get('/filter', function(req, res, next) {
    res.sendFile(path.join(__dirname, '../', 'views', 'Filter.html'));
});

router.get('/init', function (req, res) {
    oracledb.getConnection({
        user : 'cis550project',
        password : 'cis550project',
        connectString : '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST= cis550project.cotrnxps8evo.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SID=PENNDATS)))'
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
        connection.execute(
            'SELECT * from (SELECT Name, Rating, HeaderImage FROM Games ORDER BY Rating DESC) WHERE ROWNUM <= 7 ',
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    return;
                }
                console.log(result.rows);
                res.json(result.rows);
            });
    });
});

router.get('/init2', function (req, res) {
    oracledb.getConnection({
        user : 'cis550project',
        password : 'cis550project',
        connectString : '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST= cis550project.cotrnxps8evo.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SID=PENNDATS)))'
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
        connection.execute(
            'SELECT * from (SELECT Name, Rating, HeaderImage FROM Games WHERE BACKGROUND IS NOT NULL AND Rating > 0 AND RELEASEDATE IS NOT NULL ORDER BY RELEASEDATE DESC) WHERE ROWNUM <= 10 ',
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    return;
                }
                console.log(result.rows);
                res.json(result.rows);
            });
    });
});

router.get('/init3', function (req, res) {
    oracledb.getConnection({
        user : 'cis550project',
        password : 'cis550project',
        connectString : '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST= cis550project.cotrnxps8evo.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SID=PENNDATS)))'
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
        connection.execute(
            'SELECT * from (SELECT Name, Rating, HeaderImage FROM Games WHERE pricefinal = 0 AND Rating > 80 ORDER BY RECOMMENDATIONCOUNT DESC) WHERE ROWNUM <= 7 ',
            function(err, result) {
                if (err) {
                    console.error(err.message);
                    return;
                }
                console.log(result.rows);
                res.json(result.rows);
            });
    });
});

router.get('/filter/genres', function (req, res) {
    MongoClient.connect("mongodb://localhost:27017/games",function(err,db){
        if(err){
            console.log('Unable to connect db');
        }else {
            console.log('connection established');
            var games = db.db('games').collection('games');
            games.distinct("data.genres.description").then(function (data) {
                console.log(data);
                res.json(data);
            })

        }
    });
});

router.get('/filter/condition/:genre/:ageL/:ageR/:price/:ratingL/:ratingR', function (req, res) {
    MongoClient.connect("mongodb://localhost:27017/games",function(err,db){
        if(err){
            console.log('Unable to connect db');
        }else {
            console.log('connection established');
            // var games = db.db('games').collection('games');
            // var oldString = req.params.genre;
            // var newString = oldString.replace("%20", " ");
            if(req.params.ageR == '0') {
                games.find({"data.genres.description":req.params.genre, "data.is_free":(req.params.price == 'true'),"data.metacritic.score":
                    {$lte:parseInt(req.params.ratingR), $gte:parseInt(req.params.ratingL)},
                        "data.required_age":{$lte:parseInt(req.params.ageR), $gte:parseInt(req.params.ageL)}},
                    {"data.name":1,_id:0}).sort({"data.metacritic.score": -1}).toArray(function(err, results){
                    if (err){
                        console.log('Unable to query');
                    }else{
                        // console.log(results[0].data.name); // output all records
                        res.json(results)

                    }
                });
            }else {
                var list = [];
                for(var i = req.params.ageL; i <= req.params.ageR; i++){
                    list.push('' + i);
                }
                console.log(list);
                games.find({
                        "data.is_free": (req.params.price == 'true'),
                        "data.metacritic.score": {$lte: parseInt(req.params.ratingR), $gte: parseInt(req.params.ratingL)},
                        "data.required_age": {$in: list}
                    },
                    {"data.name": 1, _id: 0}).sort({"data.metacritic.score": -1}).toArray(function (err, results) {
                    if (err) {
                        console.log('Unable to query');
                    } else {
                        // console.log(results[0].data.name); // output all records
                        res.json(results)

                    }
                });
            }
            // games.find({"data.genres.description":req.params.genre, "data.metacritic.score":
            //     {$lte:parseInt(req.params.ratingR), $gte:parseInt(req.params.ratingL)}, "data.is_free": (req.params.price == 'true')},
            //     {"data.name":1,_id:0}).toArray(function(err, results){
            //     if (err){
            //         console.log('Unable to query');
            //     }else{
            //         console.log(results[2].data.name); // output all records
            //         res.json(results)
            //
            //     }
            // });
        }
    });
})

router.get('/filter/NoGenre/:ageL/:ageR/:price/:ratingL/:ratingR', function (req, res) {
    MongoClient.connect("mongodb://localhost:27017/games",function(err,db) {
        if (err) {
            console.log('Unable to connect db');
        } else {
            console.log('connection established');
            var games = db.db('games').collection('games');
            if (req.params.ageL == '0') {
                games.find({
                        "data.is_free": (req.params.price == 'true'),
                        "data.metacritic.score": {$lte: parseInt(req.params.ratingR), $gte: parseInt(req.params.ratingL)},
                        "data.required_age": {$lte: parseInt(req.params.ageR), $gte: parseInt(req.params.ageL)}
                    },
                    {"data.name": 1, _id: 0}).sort({"data.metacritic.score": -1}).toArray(function (err, results) {
                    if (err) {
                        console.log('Unable to query');
                    } else {
                        // console.log(results[0].data.name); // output all records
                        res.json(results)

                    }
                });
            }else {
                var list = [];
                for(var i = req.params.ageL; i <= req.params.ageR; i++){
                    list.push('' + i);
                }
                console.log(list);
                games.find({
                        "data.is_free": (req.params.price == 'true'),
                        "data.metacritic.score": {$lte: parseInt(req.params.ratingR), $gte: parseInt(req.params.ratingL)},
                        "data.required_age": {$in: list}
                    },
                    {"data.name": 1, _id: 0}).sort({"data.metacritic.score": -1}).toArray(function (err, results) {
                    if (err) {
                        console.log('Unable to query');
                    } else {
                        // console.log(results[0].data.name); // output all records
                        res.json(results)

                    }
                });
            }
        }
    });
})

router.get('/search/:GameName', function (req, res) {
    oracledb.getConnection({
        user : 'cis550project',
        password : 'cis550project',
        connectString : '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST= cis550project.cotrnxps8evo.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SID=PENNDATS)))'
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
        if (req.params.GameName.includes("\'")){
            var namelist = req.params.GameName.split('\'');
            req.params.GameName = namelist[0] + "\'\'" + namelist[1];
        }
        var query1 = 'SELECT Name, ReleaseDate, RequiredAge, Rating, RecommendationCount, SteamSpyPlayersEstimate, PriceCurrency,PriceFinal, ' +

//             'headerImage, GameID FROM Games WHERE Name LIKE \'%' + req.params.GameName + '%\'';

            'headerImage, GameID FROM Games WHERE Name LIKE \'%' + req.params.GameName + '%\' order by Rating DESC';
//             'headerImage, GameID FROM Games WHERE lower(Name) LIKE lower(\'%' + req.params.GameName + '%\')';
        connection.execute(query1,
            function(err, result) {
                if (err) {
                    console.log();
                    console.error(err.message);
                    return;
                }
                console.log(query1);
                console.log(result.rows);
                res.json(result.rows);
            });
    });
});


//Retrieve game information (-HanrongZhu) from Oracle
router.get('/searchDetail/:GameID', function (req, res) {
    console.log('got');
    oracledb.getConnection({
        user : 'cis550project',
        password : 'cis550project',
        connectString : '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST= cis550project.cotrnxps8evo.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SID=PENNDATS)))'
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
        var query1 = 'SELECT * FROM Games WHERE GameID =' + req.params.GameID;
        connection.execute(query1,
            function(err, result) {
                if (err) {
                    console.log(query1)
                    console.error(err.message);
                    return;
                }
                console.log(query1)
                console.log(result.rows);
                res.json(result);
            });
    });
});

//Get game information from mongodb
router.get('/searchDetailM/:GameID', function (req, res) {
    MongoClient.connect("mongodb://localhost:27017/games",function(err,db){
        if(err){
            console.log('Unable to connect db');
        }else{
            console.log('connection established');
            var games = db.db('games').collection('games');
            games.find({query_appid: parseInt(req.params.GameID)},{data:1}).toArray(function(err, results){
                if (err){
                    console.log('Unable to query');
                }else{
                    console.log(results[0].data); // output all records
                    res.json(results[0].data)

                }
            });

        }
    });
});

router.get('/lessReviews/:GameID', function (req, res) {
    console.log('got');
    oracledb.getConnection({
        user : 'cis550project',
        password : 'cis550project',
        connectString : '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST= cis550project.cotrnxps8evo.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SID=PENNDATS)))'
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
        var query = 'SELECT REVIEW FROM REVIEWS_WHOLE WHERE GAME_ID =' + req.params.GameID +' AND LENGTH(REVIEW)>50 AND LENGTH(REVIEW)<100 AND ROWNUM <=5';
        connection.execute(query,
            function(err, result) {
                if (err) {
                    console.log(query);
                    console.error(err.message);
                    return;
                }
                console.log(query);
                console.log(result.rows);
                res.json(result.rows);
            });
    });
});


router.get('/gameID/:gameID/review/:review',function(req,res){
    var gameID = req.params.gameID;
    var review = req.params.review;
    var query = 'INSERT INTO REVIEWS_WHOLE(REVIEW_ID,GAME_ID,REVIEW) VALUES(REVIEW_ID.NEXTVAL,\''+gameID+'\',\''+review+'\')';
    oracledb.getConnection({
        user : 'cis550project',
        password : 'cis550project',
        connectString : '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST= cis550project.cotrnxps8evo.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SID=PENNDATS)))'
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
        connection.execute(query,
            function(err, result) {
                if (err) {
                    // console.log(query)
                    console.error(err.message);
                    return;
                }
                console.log(query)
            });
    });

});


router.get('/reviews/:ReviewID', function (req, res) {
    oracledb.getConnection({
        user : 'cis550project',
        password : 'cis550project',
        connectString : '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST= cis550project.cotrnxps8evo.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SID=PENNDATS)))'
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
        var query1 = 'SELECT review, sentiment, helpful_review FROM reviews_whole \
        WHERE GAME_ID = \'' + req.params.ReviewID + '\'';
        connection.execute(query1,
            function(err, result) {
                if (err) {
                    console.log()
                    console.error(err.message);
                    return;
                }
                console.log(query1)
                // console.log(result.rows);
                res.json(result.rows);
            });
    });
});


router.get('/Recint', function (req, res) {
    oracledb.getConnection({
        user : 'cis550project',
        password : 'cis550project',
        connectString : '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST= cis550project.cotrnxps8evo.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SID=PENNDATS)))'
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
        var query1 =  "SELECT GAMES.HEADERIMAGE,GAMES.NAME FROM (with  T3 AS (select * from(SELECT GAMEID,sum(play_hours) as s FROM USERS group by GAMEID having sum(play_hours)>100 order by s desc) )"
            +" SELECT GAMEID,S from (SELECT T3.*,dbms_random.value(1,1000) Ran FROM T3 order by Ran) where ROWNUM<4 UNION"
            +" SELECT * FROM (select * from(SELECT GAMEID,sum(play_hours) as s FROM USERS group by GAMEID having sum(play_hours)>100 order by s desc) ) where ROWNUM<4) RESULT6 "
            +" join GAMES on RESULT6.GAMEID=GAMES.GAMEID";
        connection.execute(query1,
            function(err, result) {
                if (err) {
                    console.log(query1)
                    console.error(err.message);
                    return;
                }
                console.log(query1)
                console.log(result.rows);
                res.json(result.rows);
            });
    });

});

router.get('/getphoto/:NAME',function(req,res){
    oracledb.getConnection({
        user : 'cis550project',
        password : 'cis550project',
        connectString : '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST= cis550project.cotrnxps8evo.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SID=PENNDATS)))'
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
        if (req.params.NAME.includes("\'")){
            var namelist = req.params.NAME.split('\'');
            req.params.NAME = namelist[0] + "\'\'" + namelist[1];
        }
        var query1="SELECT GAMES.HEADERIMAGE FROM GAMES WHERE gameID="+req.params.NAME

        connection.execute(query1,
            function(err, result) {
                if (err) {
                    console.log(query1)
                    console.error(err.message);
                    return;
                }
                console.log(query1)
                console.log(result.rows);
                res.json(result.rows);
            });
    });
});


router.get('/rec/:Recom', function (req, res) {
    oracledb.getConnection({
        user : 'cis550project',
        password : 'cis550project',
        connectString : '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST= cis550project.cotrnxps8evo.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SID=PENNDATS)))'
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
        if (req.params.Recom.includes("\'")){
            var namelist = req.params.Recom.split('\'');
            req.params.Recom = namelist[0] + "\'\'" + namelist[1];
        }
        var query3 ="With Average as (select avg(RATING) FROM GAMES WHERE RATING <>0), Raw2 as"
             +" (SELECT * FROM (SELECT * FROM ("
             +" SELECT  Games.Name, "
             +" CAST(case when Games.RATING>0 then G1.avg_hour/2+Games.RATING else G1.avg_hour/2+CAST((SELECT  * from Average) as INT)-5 end AS INT)as   "   
             +" R_index ,Games.GameID,GAMES.HEADERIMAGE,Games.Rating"
             +" FROM Games JOIN "
             +" (SELECT  U.gameid as games,avg(U.play_hours) as avg_hour   FROM Users U WHERE U.user_id in (SELECT  * FROM (SELECT DISTINCT user_id from Users WHERE lower(game_name)=lower('"+req.params.Recom+"')))  GROUP BY U.gameid) G1"
             +" ON Games.GameId=G1.games "
             +" WHERE lower(Games.name) <>lower('"+req.params.Recom+"') ORDER BY R_index DESC) WHERE ROWNUM<40) Raw_rec LEFT OUTER JOIN REVIEWS_WHOLE ON REVIEWS_WHOLE.GAME_ID = Raw_rec.GAMEID ) "
             +" SELECT * FROM (SELECT distinct Raw2.name, CAST(R_INDEX*0.7+(case when C1/C2 is null then 0.5 when C1/C2<0.5 then 0.5 else C1/C2 end)*30 AS INT)  AS REC_INDEX, Raw2.GameID,Raw2.HEADERIMAGE"
             +" FROM Raw2 LEFT OUTER JOIN (SELECT Raw2.GAMEID, count(*) AS C2 from Raw2 GROUP BY GAMEID) SUM_COUNT ON Raw2.GAMEID=SUM_COUNT.GAMEID"
             +" LEFT OUTER JOIN (SELECT Raw2.GAMEID, count(*) AS C1 FROM Raw2 where sentiment=1 GROUP BY GAMEID) POSITIVE_COUNT ON Raw2.GAMEID=POSITIVE_COUNT.GAMEID ORDER BY REC_INDEX DESC) WHERE ROWNUM<10";

        var query4="select Games.Name ,cast(Games.Rating*1.6 as int) as R_index,Games.GameID,GAMES.HEADERIMAGE,Games.ReleaseDate, Games.RequiredAge,"
            +"Games.RecommendationCount, Games.SteamSpyPlayersEstimate,Games.PriceCurrency,Games.PriceFinal, Games.SupportURL, Games.AboutText1   from Games  where Games.gameid in (select * from (select gameid from games order by rating desc) where rownum <11) order by R_index desc";

        connection.execute(query3,
            function(err, result) {
                if (err) {

                    console.error(err.message);
                    return;
                }
                console.log(query3)
                console.log(result.rows.length);
                if (result.rows.length>0){res.json(result.rows);}
                else{
                    connection.execute(query4,
                        function(err, result) {
                            if (err) {
                                console.log(query4);
                                console.error(err.message);
                                return;
                            }
                            console.log(query4);
                            res.json(result.rows);
                        })}});
    });

});


router.get('/rec2/:Recom', function (req, res) {
    oracledb.getConnection({
        user : 'cis550project',
        password : 'cis550project',
        connectString : '(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST= cis550project.cotrnxps8evo.us-east-1.rds.amazonaws.com)(PORT=1521))(CONNECT_DATA=(SID=PENNDATS)))'
    }, function(err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
        if (req.params.Recom.includes("\'")){
            var namelist = req.params.Recom.split('\'');
            req.params.Recom = namelist[0] + "\'\'" + namelist[1];
        }
        var query3 ="With Average as (select avg(RATING) FROM GAMES WHERE RATING <>0), Raw2 as"
             +" (SELECT * FROM (SELECT * FROM ("
             +" SELECT  Games.Name, "
             +" CAST(case when Games.RATING>0 then G1.avg_hour/2+Games.RATING else G1.avg_hour/2+CAST((SELECT  * from Average) as INT)-5 end AS INT)as   "   
             +" R_index ,Games.GameID,GAMES.HEADERIMAGE,Games.Rating"
             +" FROM Games JOIN "
             +" (SELECT  U.gameid as games,avg(U.play_hours) as avg_hour   FROM Users U WHERE U.user_id in (SELECT  * FROM (SELECT DISTINCT user_id from Users WHERE Users.gameid="+req.params.Recom+"))  GROUP BY U.gameid) G1"
             +" ON Games.GameId=G1.games "
             +" WHERE Games.gameid <>"+req.params.Recom+"  ORDER BY R_index DESC) WHERE ROWNUM<40) Raw_rec LEFT OUTER JOIN REVIEWS_WHOLE ON REVIEWS_WHOLE.GAME_ID = Raw_rec.GAMEID ) "
             +" SELECT * FROM (SELECT distinct Raw2.name, CAST(R_INDEX*0.7+(case when C1/C2 is null then 0.5 when C1/C2<0.5 then 0.5 else C1/C2 end)*30 AS INT)  AS REC_INDEX, Raw2.GameID,Raw2.HEADERIMAGE"
             +" FROM Raw2 LEFT OUTER JOIN (SELECT Raw2.GAMEID, count(*) AS C2 from Raw2 GROUP BY GAMEID) SUM_COUNT ON Raw2.GAMEID=SUM_COUNT.GAMEID"
             +" LEFT OUTER JOIN (SELECT Raw2.GAMEID, count(*) AS C1 FROM Raw2 where sentiment=1 GROUP BY GAMEID) POSITIVE_COUNT ON Raw2.GAMEID=POSITIVE_COUNT.GAMEID ORDER BY REC_INDEX DESC) WHERE ROWNUM<10";


        var query4="select  Games.Name ,cast(Games.Rating*1.6 as int) as R_index,Games.GameID,GAMES.HEADERIMAGE,Games.ReleaseDate, Games.RequiredAge,"
            +"Games.RecommendationCount, Games.SteamSpyPlayersEstimate,Games.PriceCurrency,Games.PriceFinal, Games.SupportURL, Games.AboutText1   from Games  where Games.gameid in (select * from (select gameid from games order by rating desc) where rownum <11) order by R_index desc";

        connection.execute(query3,
            function(err, result) {
                if (err) {

                    console.error(err.message);
                    return;
                }
                console.log(query3)
                console.log(result.rows.length);
                if (result.rows.length>0){res.json(result.rows);}
                else{
                    connection.execute(query4,
                        function(err, result) {
                            if (err) {
                                console.log(query4);
                                console.error(err.message);
                                return;
                            }
                            console.log(query4);
                            res.json(result.rows);
                        })}});
    });

});

module.exports = router;
