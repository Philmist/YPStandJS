// fileencoding=utf-8

var net = require("net");
var util = require("util");
var pcpconst = require("./peca").PCP_CONST;
var pcpatom = require("./peca").PCPAtom;
var PCPHost = require("./peca").PCPHost;
var GID = require("./peca").GID;

var sessionId = GID.generate();
var agentName = "YPStandJS";


function toStringRemoteAddressPort(sock) {
  return sock.remoteAddress + ":" + sock.remotePort;
}


function onBcst(atom, sock, host, chobj) {
  console.log("Handler : PCP_BCST at " + Date());
  console.log("Handler : PCP_BCST from " + toStringRemoteAddressPort(sock));
  
  for (var i = 0; i < atom.children.length; i++) {
    switch (atom.children[i]) {
    case pcpconst.PCP_BCST_TTL:
    case pcpconst.PCP_BCST_HOPS:
    case pcpconst.PCP_BCST_FROM:
    case pcpconst.PCP_BCST_DEST:
    case pcpconst.PCP_BCST_GROUP:
    case pcpconst.PCP_BCST_CHANID:
    case pcpconst.PCP_BCST_VERSION:
    case pcpconst.PCP_BCST_VERSION_VP:
      break;
    default:
      host = processAtom(atom.children[i], sock, host, chobj);
      break;
    }
  }
  return host;
}

function onChan(atom, sock, host, chobj) {
  //console.log("Handler : PCP_CHAN");
  //console.log(util.inspect(atom));
  
  var channelId = atom.getFromName(pcpconst.PCP_CHAN_ID);
  var h = host[toStringRemoteAddressPort(sock)];
  if (!h) {
    return host;
  }
  var c = chobj.get(channelId.toString());
  if (c) {
    if (c.broadcastId == h.broadcastId) {
      var aChInfo = atom.getFromName(pcpconst.PCP_CHAN_INFO);
      if (aChInfo) {
        c.info = aChInfo;
      }
      var aTrack = atom.getFromName(pcpconst.PCP_CHAN_TRACK);
      if (aTrack) {
        c.track = aTrack;
      }
      c.lastUpdated = Date.now();
      chobj.set(channelId.toString(), c);
    }
  } else if (h.broadcastId) {
    c = {
      startFrom : Date.now(),
      lastUpdated : Date.now(),
      channelId : channelId,
      broadcastId : h.broadcastId,
      info : null,
      track : null,
      hosts : {}
    };
    chobj.set(channelId.toString(), c);
  }
  
  return host;
}

function onHost(atom, sock, host, chobj) {
  //console.log("Handler : PCP_HOST");
  var sId = atom.getFromName(pcpconst.PCP_HOST_ID);
  //console.log(util.inspect(sId));
  var channelId = atom.getFromName(pcpconst.PCP_HOST_CHANID);
  var remoteAddr = toStringRemoteAddressPort(sock);
  var hostSId = host[remoteAddr].sessionId;
  var c = chobj.get(channelId.toString());
  if ((hostSId) && (c)) {
    var hSIdstr = hostSId.toString();
    var sIdstr = sId.toString();
    if (hSIdstr == sIdstr) {
      var hostflag = atom.getFromName(pcpconst.PCP_HOST_FLAGS1);
      if (!hostflag) {
        hostflag = 0;
      }
      if ((hostflag & pcpconst.PCP_HOST_FLAGS1_RECV) != 0) {
        c.lastUpdated = Date.now();
        c.hosts[sId] = atom;
      } else {
        delete c.hosts.sessionId;
      }
    }
    chobj.set(channelId.toString(), c);
  }
  return host;
}

function onQuit(atom, sock, host, chobj) {
  console.log("Handler : PCP_QUIT");
  chobj.del(host[toStringRemoteAddressPort(sock)].sessionId);
  delete host[toStringRemoteAddressPort(sock)];
  var tmpbuf = Buffer(4);
  tmpbuf.writeUInt32LE(pcpconst.PCP_ERROR_QUIT+pcpconst.PCP_ERROR_GENERAL, 0);
  var tmpatom = new pcpatom(pcpconst.PCP_QUIT, null, tmpbuf);
  tmpatom.write(sock);
  sock.end();
  return host;
}

function onHelo(atom, sock, host, chobj) {
  console.log("Handler : PCP_HELO");
  //console.log(util.inspect(atom));
  
  var addr = toStringRemoteAddressPort(sock);
  host[addr] = new PCPHost(
    atom.getFromName(pcpconst.PCP_HELO_SESSIONID),
    atom.getFromName(pcpconst.PCP_HELO_BCID),
    atom.getFromName(pcpconst.PCP_HELO_AGENT),
    sock.remoteAddress,
    atom.getFromName((pcpconst.PCP_HELO_PORT || 0)),
    atom.getFromName(pcpconst.PCP_HELO_VERSION),
    1  // TODO: Fix Temporary value
  );
  host[addr].method = "PCP";
  
  //console.log("Handler : " + addr + " 's host info is");
  //console.log(util.inspect(host[addr]));
  
  
  var oleh = new pcpatom(pcpconst.PCP_OLEH, [], null);
  oleh.setFromName(pcpconst.PCP_HELO_AGENT, agentName);
  oleh.setFromName(pcpconst.PCP_HELO_SESSIONID, sessionId);
  oleh.setFromName(pcpconst.PCP_HELO_VERSION, 1218);
  oleh.setFromName(pcpconst.PCP_HELO_REMOTEIP, sock.remoteAddress);
  oleh.setFromName(pcpconst.PCP_HELO_PORT, host[addr].port);
  console.log("Handler : Send OLEH");
  //console.log(util.inspect(oleh));
  
  oleh.write(sock);
  
  return host;
}


function processAtom(atom, sock, host, chobj) {
  
  //console.log("Handler_Atom : " + util.inspect(chobj));
  switch (atom.name) {
  // HELO req
  case pcpconst.PCP_HELO:
    host = onHelo(atom, sock, host, chobj);
    break;
    
  // Other req
  case pcpconst.PCP_BCST:
    host = onBcst(atom, sock, host, chobj);
    break;
  case pcpconst.PCP_CHAN:
    host = onChan(atom, sock, host, chobj);
    break;
  case pcpconst.PCP_HOST:
    host = onHost(atom, sock, host, chobj);
    break;
    
  // on Quit (socket will be closed)
  case pcpconst.PCP_QUIT:
    host = onQuit(atom, sock, host, chobj);
    break;
  }
  
  return host;
}

function PCPHandler(sock) {
  
  this.socket = sock;
  this.reader = new pcpatom.PCPAtomReader(this.socket);
  
  this.handle = function(host, chobj) {
    //console.log("Handler : PCP Handling started.");
    if (!(host.sessionId)) {
      host.sessionId = sessionId;
    }
    
    var data = this.reader.read();
    if (!(data)) {  // data is null
      return host;
    }
    
    //console.log("Handler : PCP Atom data is");
    //console.log(util.inspect(data));
    
    //console.log("Handler_Main : " + util.inspect(chobj));
    try {
      host = processAtom(data, sock, host, chobj);
    } catch (e) {
      var quitbuf = new Buffer(4);
      quitbuf.writeUInt32LE(pcpconst.PCP_ERROR_QUIT+pcpconst.PCP_ERROR_GENERAL, 0);
      var quitAtom = new pcpatom(pcpconst.PCP_QUIT, null, quitbuf);
      quitAtom.write(sock);
      delete host[toStringRemoteAddressPort(sock)];
      console.log("Handler : Exeception detected ...");
      console.log(util.inspect(e));
    }
    
    return host;
  }
}

exports.Handler = PCPHandler;
