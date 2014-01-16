// fileencoding=utf-8

// dependencies
var peca = require("./peca");
var router = require("./yp_router");
var handler = require("./yp_handler");
var pcp_handler = require("./yp_handler_pcp");
var yp = require("./yp");
var util = require("util");
//var channel = require("./channel_mem");

// Handlers
var handle = {};
handle["PCP"] = pcp_handler.Handler;
handle["HTTP"] = handler.HTTPHandler;

// Starting server
function startPCPServer(port, chobj) {
  var sv = yp.startServer(port, router.YpRouter, handle, chobj);
  var co = chobj;
  return function(req, res, next) {
    res.locals.channels = co.getall();
    console.log(util.inspect(res.locals.channels));
    next();
  }
}

exports.startPCPServer = startPCPServer;

