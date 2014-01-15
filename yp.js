// fileencoding=utf-8

var peca = require('./peca');
var net = require('net');
var util = require('util');
var host = {};


function startServer(port, router, handler, chobj) {
  var param_port = 7146;
  var param_router = router;
  var param_handler = handler;
  
  // default argument
  if (typeof (port) == 'number') {
    param_port = port;
  }
  if (typeof (port) == 'function') {
    param_router = port;
    param_handler = router;
  }
  
  // Start server
  console.log("YP : Starting server...");
  var server = net.createServer(function (sock) {
    var address = sock.address();
    console.log("YP : Connected from : " + sock.remoteAddress + ":" + sock.remotePort);
    var routerInstance = new param_router(sock, param_handler);
    sock.on("readable",
      function() {
        host = routerInstance.route(host, chobj);
        temp = sock.read(0);
      }
    );
    sock.on("end",
      function() {
        console.log("YP : Detected FIN packet");
      }
    );
    sock.on("error",
      function(err) {
        console.log("YP : Socket error detected.");
      }
    );
  });
  server.listen(param_port);
  server.on("listening",
    function() {
      console.log("YP : Server started at port " + server.address().port);
    }
  );
  
  return server;
}

exports.startServer = startServer;
exports.host = host;
