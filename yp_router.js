// fileencoding=utf-8

var StringDecoder = require("string_decoder").StringDecoder;
var decoder = new StringDecoder("utf8");
var url = require("url");
var util = require("util");

// struct (object)
function HTTPRequest(method, uri, version, headers) {
  this.method = method;
  this.uri = uri;
  this.version = version;
  this.headers = headers;
}
function PCPRequest(version) {
  this.version = version;
}


// Routing stuff
function HeaderReader(sock) {
  this.socket = sock;
  this.state = "INITIAL";
  this.header = new Buffer(0);
  
  function parseHttpHeader(header) {
    header = header.split(/\n\r/);
    line = header.shift();
    var httpreqre = /(GET|HEAD) ([\/\w]+) HTTP\/(1.\d)/;
    if (httpreqre.test(line)) {
      var reresult = httpreqre.match(line);
      var method = reresult[1];
      var uri = url.parse(reresult[2]);
      var version = reresult[3];
      var headers = [];
      while ((line = header.shift()) & (line != '')) {
        md = /(.*?):(.*)/.match(line);
        headers[md[1].strip().downcase] = md[2].strip();
      }
      return new HTTPRequest(method, uri, version, headers);
    } else {
      throw new Error("Router : Invalid http request");
    }
  }
  
}

HeaderReader.prototype.read = function() {
  while (true) {
    switch (this.state) {
      case "INITIAL":
      case "":
        this.header = this.socket.read(4);
        if (!(this.header)) {
          return null;
        }

        if (decoder.write(this.header == "pcp\n")) {
          console.log("Router : PCP header detected.");
          this.state = "WAITPCPLENGTH";
          continue;
        } else {
          this.state = "WAITHTTPHEADER";
          continue;
        }
        break;

      case "WAITPCPLENGTH":
        this.header = this.socket.read(4);
        if (!(this.header)) {
          return null;
        }
        var len = this.header.readUInt32LE(0);
        if (len != 4) {
          throw new Error("Router : PCP Length Error");
        }
        this.state = "WAITPCPVERSION";
        continue;
        braek;

      case "WAITPCPVERSION":
        this.header = this.socket.read(4);
        if (!(this.header)) {
          return null;
        }
        var ver = this.header.readUInt32LE(0);
        this.state = "INITIAL";
        return new PCPRequest(ver);
        break;

      case "WAITHTTPHEADER":
        var tmp = this.socket.read(1);
        if (!(this.header)) {
          return null;
        }
        var re = /\r\n\r\n$/;
        this.header = Buffer.concat([this.header, tmp]);
        if (!re.test(decoder.write(header))) {
          continue;
        }
        console.log("Router : HTTP header detected.");
        this.state = "INITIAL";
        return parseHttpHeader(decoder.write(header));
        break;
    }
  }
}


function YpRouter(sock, handlers) {
  
  this.socket = sock;
  this.pcphandler = new handlers["PCP"](this.socket);
  this.httphandler = new handlers["HTTP"](this.socket);
  this.hr = new HeaderReader(sock);
  
  this.route = function(host, chobj) {
    // route request
    if (host[this.socket.remoteAddress+":"+this.socket.remotePort]) {
      if (host[this.socket.remoteAddress+":"+this.socket.remotePort].method == "PCP") {
        //console.log("Router : Forward to PCP Handler (host detected).");
        host = this.pcphandler.handle(host, chobj);
        sock.read(0);
      } else if (host[this.socket.remoteAddress+":"+this.socket.remotePort].method == "HTTP") {
        host = this.httphandler.handle(host, chobj);
        sock.read(0);
      }
    } else {
      req = this.hr.read();
      if (req instanceof PCPRequest) {
        console.log("Router : Forward to PCP Handler.");
        host = this.pcphandler.handle(host, chobj);
        sock.read(0);
      } else if (req instanceof HTTPRequest) {
        console.log("Router : Forward to HTTP Handler.");
        host = this.httphandler.handle(req, host, chobj);
        sock.read(0);
      } else {
        sock.read(0);
      }
    }
    return host;
  }
  
}

exports.YpRouter = YpRouter;
