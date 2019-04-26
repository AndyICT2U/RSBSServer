var express = require('express');
var bodyParser = require('body-parser');
var cp = require('child_process');
var cors = require('cors');

var app = express();
app.use(cors());

app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.urlencoded({ extended: false }));

var rsbsRouter = express.Router();

var teams = ["red","blue"];
var attacker = 0;

var gamestates = ["INIT","0ATT","1ATT","OVER"];
var gamestatus = "PEND";
var attackCell = "";
var bWaitingForResult = true;
var resultState = "X";
var shipsSunk = [0,0];
const NUMBER_OF_SHIPS = 5;

/*
function lookupMember(req, res, next) {

  var memberId = req.params.gid;
  var sql = 'SELECT * FROM members WHERE memberID = $1';
//  var sql = 'SELECT * FROM members WHERE gid = $1';
  console.log(sql);
  postgres.client.query(sql, [ memberId ], function(err, results) {
    if (err) {
      console.error(err);
      res.statusCode = 500;
      return res.json({ errors: ['Could not retrieve member'] });
    }
    if (results.rows.length === 0) {
      res.statusCode = 404;
      return res.json({ errors: ['Member not found']});
    }

    req.member = results.rows[0];
//	console.log(req.member);
    next();
  });
}
*/

function setGameState( newState ) {
    gamestatus = newState;
}

function getGameState() {
    return( gamestatus );
}

rsbsRouter.get('/status/', function(req, res) {
//  res.setHeader('Content-Type', 'text/html');
  console.log("STATUS:" + JSON.stringify(req.query)+" "+getGameState());
//  console.log("STATUS:" + JSON.stringify(req.params));
//  console.log("STATUS:" + req.params.source);
//  if (req.params.source == teams[attacker]) {
  if (req.query.source == teams[attacker]) {
      // Status request from attacker
        switch (getGameState()) {
            case "PEND":
                res.json({ 'status': 'P', 'cell': attackCell});
                break;
            case "WRES":
                res.json({ 'status': resultState, 'cell': attackCell});
                break;
            default:
                res.json({ 'status': 'P', 'cell': attackCell});
        }
//      if (getGameState() == "WRES") {
//            res.json({ 'status': 'P', 'cell': attackCell});
//      }
//      if (getGameState() == "RSLT") {
//            res.json({ 'status': resultState, 'cell': attackCell});
//      }
  } else {
      // Status request from defender
        switch (getGameState()) {
            case "PEND":
                res.json({ 'status': 'P', 'cell': attackCell});
                break;
            case "WTGT":
                res.json({ 'status': 'T', 'cell': attackCell});
                break;
            default:
                res.json({ 'status': 'P', 'cell': attackCell});
        }
/*      if (getGameState() == "WRES") {
        res.json({ 'status': 'P', 'cell': attackCell});
      }
      if (getGameState() == "TSET") {
        res.json({ 'status': 'T', 'cell': attackCell});
      }
*/      
  }

  res.end();
 });
 
rsbsRouter.post('/status/', function(req, res) {
    console.log("POST-STATUS: " + req.body.cell + " " + req.body.status);
    setGameState( "RSLT" );
//    if (req.query.source == teams[attacker]) 
    {
        var defender = (attacker + 1) % 2;
        setGameState( "WRES" );
        resultState = req.body.status;
        if (resultState == "S") {
            shipsSunk[defender] = shipsSunk[defender] + 1;
            if (shipsSunk[defender] == NUMBER_OF_SHIPS) {
                console.log("Game Over... - probably need new status message!");
            }
        }
        attackCell = req.body.cell;
        attacker = (attacker + 1) % 2;
        res.statusCode = 200;
    }
    res.end();
});


rsbsRouter.post('/target/', function(req, res) {
//    req.body.caption,

	console.log(req.body);
    console.log(req.body.source);
    if (getGameState() == "WRES" && req.body.source != teams[attacker]) {
        attacker = (attacker + 1) % 2;
    }
    console.log(teams[attacker]);

    if (req.body.source == teams[attacker]) {
      attackCell = req.body.cell;
      console.log("Attack Cell - " + attackCell);
//      setGameState( "TSET" );
      setGameState( "WTGT" );
      res.statusCode = 200;
    } else {
      res.statusCode = 404;
    }
    
/*  var data = [
    req.body.caption,
	"2016-08-29 01:02:03"
  ];
*/
//      res.statusCode = 201;
//      res.json(result.rows[0]);
    res.end();
});


app.use('/rsbs/v1', rsbsRouter);

module.exports = app;
