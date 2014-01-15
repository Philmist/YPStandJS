// fileencoding=utf-8

var net = require("net");
var url = require('url');
var pcpconst = require("./peca").PCP_CONST;
var pcpatom = require("./peca").PCPAtom;
var gid = require("./peca").GID;


function parseHTTPHeader(str) {
  var header = str.split(/\r\n/);
  var line = header.shift();
  var reRequest = /(GET|HEAD) ([\/\w]+) HTTP\/(1.\d)/;
  var resRequest = reRequest.exec(line);
  var res = {};
  if (resRequest) {
    res.method = resRequest[1];
    res.uri = url.parse(resRequest[2]);
    res.version = resRequest[3];
    res.headers = {};
    do {
      line = header.shift();
      var md = /(.*?):(.*)/.exec(line);
      res.headers[md[1].strip().downcase()] = md[2].strip();
    } while ((line) & (line != ''));
  }
  return res;
}


function sendHTTPRequestError(sock, status, msg) {
  var str = ["HTTP/1.0 " + status.toString() + msg];
  str.push("Server: YPStandJS");
  str.push("");
  var str = str.join("\r\n") + "\r\n";
  sock.write(str);
}

function HTTPHandler(sock) {
  
  this.socket = sock;
  this.state = "INITIAL";
  this.atomReader = new pcpatom.PCPAtomReader(this.socket);
  
  this.handle = function(headerstr, host, chobj) {
    console.log("Handler : HTTP Handling started.");
    while (true) {
      switch (this.state) {
      case "INITIAL":
        var reqs = parseHTTPHeader(headerstr);
        if (!reqs) {
          return host;
        } else if (reqs.headers["x-peercast-pcp"] != 1) {
          sendHTTPRequestError(this.socket, 400, "Bad Request");
          return host;
        } else {
          var reChannelId = /^\/channel\/([A-Fa-f0-9]{32})/;
          var resChannelId = reChannelId.exec(reqs.uri);
          if (!resChannelId) {
            sendHTTPRequestError(404, 'Not Found');
            return host;
          }
          resChannelId = gid.fromString(resChannelId[1]);
          var channel = chobj.get(resChannelId.toString());
          if (!channel) {
            sendHTTPRequestError(this.socket, 404, 'Not Found');
            return host;
          }
          this.socket.write([
            "HTTP/1.0 503 Unavailable",
            "Server: YPStandJS",
            "Content-Type:application/x-peercast-pcp",
            "x-peercast-pcp:1",
            ""
            ].join("\r\n")+"\r\n");
          this.state = "WAITHELO";
          host[this.socket.remoteAddress + ":" + this.socket.remotePort].method = "HTTP";
          continue;
        }
        break;
      case "WAITHELO":
        var helo = this.atomReader(this.socket);
        if (!helo) {
          return host;
        }
        if (helo.name != pcpconst.PCP_HELO) {
          console.log("Handler : HTTP -> PCP Handshake failed.");
          delete host[this.socket.remoteAddress + ":" + this.socket.remotePort];
          this.socket.end();
          return host;
        }
        oleh = new pcpatom(pcpconst.PCP_OLEH, [], null);
        oleh.setFromName(pcpconst.PCP_HELO_AGENT, "YPStandJS");
        oleh.setFromName(pcpconst.PCP_HELO_SESSIONID, host["sessionId"]);
        oleh.setFromName(pcpconst.PCP_HELO_VERSION, 1218);
        oleh.setFromName(pcpconst.PCP_HELP_REMOTEIP, this.socket.remoteAddress);
        var port = helo.getFromName(pcpconst.PCP_HELP_PORT);
        if (!port) {
          port = 0;
        }
        oleh.setFromName(pcpconst.PCP_HELO_PORT, port);
        oleh.write(this.socket);
        // TODO: implement this
        //hosts[0,8].each do |host|
        //  host.write(sock)
        //end
        var tmpbuf = new Buffer(4);
        tmpbuf.writeUInt32LE((pcpconst.PCP_ERROR_UNAVAILABLE+pcpconst.PCP_ERROR_QUIT), 0);
        var atomquit = new PCPAtom(pcpconst.PCP_QUIT, null, tmpbuf);
        atomquit.write(this.socket);
        delete host[this.socket.remoteAddress + ":" + this.socket.remotePort];
        this.socket.end();
        this.state = "INITIAL";
        return host;
        break;
      }
    }
    return host;
  }
}

exports.HTTPHandler = HTTPHandler;
