//#!/usr/bin/env node

var app = require('../rsbsindex');

// Which port to listen on
app.set('port', process.env.PORT || 3300);

// Start listening for HTTP requests
var cwHost = "localhost";  // OK
//  var cwHost = "192.168.8.101";  // OK

var server = app.listen(app.get('port'), cwHost, function() {
  var host = server.address().address;
  var port = server.address().port;

  // JSON.stringify(server.address())
  console.log('Red Sprite Battleships REST Server listening at http://%s:%s', host, port);
});
