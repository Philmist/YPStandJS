// fileencoding=utf-8

var peca = require("./peca");
var router = require("./yp_router");
var handler = require("./yp_handler");
var pcp_handler = require("./yp_handler_pcp");
var yp = require("./yp");
var util = require("util");
var channel = require("./channel_mem");

var handle = {};
handle["PCP"] = pcp_handler.Handler;
handle["HTTP"] = handler.HTTPHandler;

var chobj = channel.channel_mem;

var sv = yp.startServer(7146, router.YpRouter, handle, chobj);

//console.log("Main : Server instance is");
//console.log(util.inspect(sv));
