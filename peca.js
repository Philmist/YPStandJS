// encoding: utf-8

var util = require("util");
var crypto = require("crypto");
var ip = require("ip");
var util = require("util");

var PCP_CONST = {
  PCP_HELO           :"helo",
  PCP_HELO_AGENT     :"agnt",
  PCP_HELO_OSTYPE    :"ostp",
  PCP_HELO_SESSIONID :"sid",
  PCP_HELO_PORT      :"port",
  PCP_HELO_PING      :"ping",
  PCP_HELO_PONG      :"pong",
  PCP_HELO_REMOTEIP  :"rip",
  PCP_HELO_VERSION   :"ver",
  PCP_HELO_BCID      :"bcid",
  PCP_HELO_DISABLE   :"dis",
  PCP_OLEH           :"oleh",
  PCP_OK             :"ok",

  PCP_CHAN          :"chan",
  PCP_CHAN_ID       :"id",
  PCP_CHAN_BCID     :"bcid",
  PCP_CHAN_PKT      :"pkt",
  PCP_CHAN_PKT_TYPE :"type",
  PCP_CHAN_PKT_HEAD :"head",
  PCP_CHAN_PKT_META :"meta",
  PCP_CHAN_PKT_POS  :"pos",
  PCP_CHAN_PKT_DATA :"data",
  PCP_CHAN_INFO          :"info",
  PCP_CHAN_INFO_TYPE     :"type",
  PCP_CHAN_INFO_BITRATE  :"bitr",
  PCP_CHAN_INFO_GENRE    :"gnre",
  PCP_CHAN_INFO_NAME     :"name",
  PCP_CHAN_INFO_URL      :"url",
  PCP_CHAN_INFO_DESC     :"desc",
  PCP_CHAN_INFO_COMMENT  :"cmnt",
  PCP_CHAN_INFO_PPFLAGS  :"pflg",
  PCP_CHAN_TRACK         :"trck",
  PCP_CHAN_TRACK_TITLE   :"titl",
  PCP_CHAN_TRACK_CREATOR :"crea",
  PCP_CHAN_TRACK_URL     :"url",
  PCP_CHAN_TRACK_ALBUM   :"albm",

  PCP_BCST       :"bcst",
  PCP_BCST_TTL   :"ttl",
  PCP_BCST_HOPS  :"hops",
  PCP_BCST_FROM  :"from",
  PCP_BCST_DEST  :"dest",
  PCP_BCST_GROUP :"grp",
  PCP_BCST_GROUP_ALL :0xff,
  PCP_BCST_GROUP_ROOT :1,
  PCP_BCST_GROUP_TRACKERS :2,
  PCP_BCST_GROUP_RELAYS :4,
  PCP_BCST_CHANID  :"cid",
  PCP_BCST_VERSION :"vers",
  PCP_BCST_VERSION_VP :"vrvp",
  PCP_BCST_VERSION_EX_PREFIX :"vexp",
  PCP_BCST_VERSION_EX_NUMBER :"vexn",
  PCP_HOST         :"host",
  PCP_HOST_ID      :"id",
  PCP_HOST_IP      :"ip",
  PCP_HOST_PORT    :"port",
  PCP_HOST_CHANID  :"cid",
  PCP_HOST_NUML    :"numl",
  PCP_HOST_NUMR    :"numr",
  PCP_HOST_UPTIME  :"uptm",
  PCP_HOST_TRACKER :"trkr",
  PCP_HOST_VERSION :"ver",
  PCP_HOST_VERSION_VP :"vevp",
  PCP_HOST_VERSION_EX_PREFIX :"vexp",
  PCP_HOST_VERSION_EX_NUMBER :"vexn",
  PCP_HOST_CLAP_PP :"clap",
  PCP_HOST_OLDPOS  :"oldp",
  PCP_HOST_NEWPOS  :"newp",
  PCP_HOST_FLAGS1  :"flg1",
  PCP_HOST_FLAGS1_TRACKER :0x01,
  PCP_HOST_FLAGS1_RELAY   :0x02,
  PCP_HOST_FLAGS1_DIRECT  :0x04,
  PCP_HOST_FLAGS1_PUSH    :0x08,
  PCP_HOST_FLAGS1_RECV    :0x10,
  PCP_HOST_FLAGS1_CIN     :0x20,
  PCP_HOST_FLAGS1_PRIVATE :0x40,
  PCP_HOST_UPHOST_IP   :"upip",
  PCP_HOST_UPHOST_PORT :"uppt",
  PCP_HOST_UPHOST_HOPS :"uphp",

  PCP_ROOT          :"root",
  PCP_ROOT_UPDINT   :"uint",
  PCP_ROOT_CHECKVER	:"chkv",
  PCP_ROOT_URL      :"url",
  PCP_ROOT_UPDATE   :"upd",
  PCP_ROOT_NEXT     :"next",

  PCP_QUIT :"quit",
  PCP_ERROR_QUIT    :1000,
  PCP_ERROR_BCST    :2000,
  PCP_ERROR_READ    :3000,
  PCP_ERROR_WRITE   :4000,
  PCP_ERROR_GENERAL :5000,

  PCP_ERROR_SKIP             :1,
  PCP_ERROR_ALREADYCONNECTED :2,
  PCP_ERROR_UNAVAILABLE      :3,
  PCP_ERROR_LOOPBACK         :4,
  PCP_ERROR_NOTIDENTIFIED    :5,
  PCP_ERROR_BADRESPONSE      :6,
  PCP_ERROR_BADAGENT         :7,
  PCP_ERROR_OFFAIR           :8,
  PCP_ERROR_SHUTDOWN         :9,
  PCP_ERROR_NOROOT           :10,
  PCP_ERROR_BANNED           :11,
};

exports.PCP_CONST = PCP_CONST;

var PacketType = {};

PacketType[PCP_CONST.PCP_HELO              ]="parent";
PacketType[PCP_CONST.PCP_OLEH              ]="parent";
PacketType[PCP_CONST.PCP_CHAN              ]="parent";
PacketType[PCP_CONST.PCP_CHAN_PKT          ]="parent";
PacketType[PCP_CONST.PCP_CHAN_INFO         ]="parent";
PacketType[PCP_CONST.PCP_CHAN_TRACK        ]="parent";
PacketType[PCP_CONST.PCP_BCST              ]="parent";
PacketType[PCP_CONST.PCP_HOST              ]="parent";
PacketType[PCP_CONST.PCP_HELO_AGENT        ]="string";
PacketType[PCP_CONST.PCP_HELO_SESSIONID    ]="gid";
PacketType[PCP_CONST.PCP_HELO_PORT         ]="short";
PacketType[PCP_CONST.PCP_HELO_PING         ]="short";
PacketType[PCP_CONST.PCP_HELO_REMOTEIP     ]="ip";
PacketType[PCP_CONST.PCP_HELO_VERSION      ]="int";
PacketType[PCP_CONST.PCP_HELO_BCID         ]="gid";
PacketType[PCP_CONST.PCP_HELO_DISABLE      ]="int";
PacketType[PCP_CONST.PCP_OK                ]="int";
PacketType[PCP_CONST.PCP_CHAN_ID           ]="gid";
PacketType[PCP_CONST.PCP_CHAN_BCID         ]="gid";
PacketType[PCP_CONST.PCP_CHAN_PKT_TYPE     ]="bytes";
PacketType[PCP_CONST.PCP_CHAN_PKT_POS      ]="int";
PacketType[PCP_CONST.PCP_CHAN_PKT_DATA     ]="bytes";
PacketType[PCP_CONST.PCP_CHAN_INFO_TYPE    ]="bytes";
PacketType[PCP_CONST.PCP_CHAN_INFO_BITRATE ]="int";
PacketType[PCP_CONST.PCP_CHAN_INFO_GENRE   ]="string";
PacketType[PCP_CONST.PCP_CHAN_INFO_NAME    ]="string";
PacketType[PCP_CONST.PCP_CHAN_INFO_URL     ]="string";
PacketType[PCP_CONST.PCP_CHAN_INFO_DESC    ]="string";
PacketType[PCP_CONST.PCP_CHAN_INFO_COMMENT ]="string";
PacketType[PCP_CONST.PCP_CHAN_INFO_PPFLAGS ]="int";
PacketType[PCP_CONST.PCP_CHAN_TRACK_TITLE  ]="string";
PacketType[PCP_CONST.PCP_CHAN_TRACK_CREATOR]="string";
PacketType[PCP_CONST.PCP_CHAN_TRACK_URL    ]="string";
PacketType[PCP_CONST.PCP_CHAN_TRACK_ALBUM  ]="string";
PacketType[PCP_CONST.PCP_BCST_TTL          ]="byte";
PacketType[PCP_CONST.PCP_BCST_HOPS         ]="byte";
PacketType[PCP_CONST.PCP_BCST_FROM         ]="gid";
PacketType[PCP_CONST.PCP_BCST_DEST         ]="gid";
PacketType[PCP_CONST.PCP_BCST_GROUP        ]="byte";
PacketType[PCP_CONST.PCP_BCST_CHANID       ]="gid";
PacketType[PCP_CONST.PCP_BCST_VERSION      ]="int";
PacketType[PCP_CONST.PCP_BCST_VERSION_VP   ]="int";
PacketType[PCP_CONST.PCP_HOST_ID           ]="gid";
PacketType[PCP_CONST.PCP_HOST_IP           ]="ip";
PacketType[PCP_CONST.PCP_HOST_PORT         ]="short";
PacketType[PCP_CONST.PCP_HOST_CHANID       ]="gid";
PacketType[PCP_CONST.PCP_HOST_NUML         ]="int";
PacketType[PCP_CONST.PCP_HOST_NUMR         ]="int";
PacketType[PCP_CONST.PCP_HOST_UPTIME       ]="int";
PacketType[PCP_CONST.PCP_HOST_VERSION      ]="int";
PacketType[PCP_CONST.PCP_HOST_VERSION_VP   ]="int";
PacketType[PCP_CONST.PCP_HOST_CLAP_PP      ]="int";
PacketType[PCP_CONST.PCP_HOST_OLDPOS       ]="int";
PacketType[PCP_CONST.PCP_HOST_NEWPOS       ]="int";
PacketType[PCP_CONST.PCP_HOST_FLAGS1       ]="byte";
PacketType[PCP_CONST.PCP_HOST_UPHOST_IP    ]="ip";
PacketType[PCP_CONST.PCP_HOST_UPHOST_PORT  ]="int";
PacketType[PCP_CONST.PCP_HOST_UPHOST_HOPS  ]="int";
PacketType[PCP_CONST.PCP_QUIT              ]="int";
PacketType[PCP_CONST.PCP_ROOT              ]="parent";
PacketType[PCP_CONST.PCP_ROOT_UPDINT       ]="int";
PacketType[PCP_CONST.PCP_ROOT_NEXT         ]="int";
PacketType[PCP_CONST.PCP_ROOT_CHECKVER     ]="int";
PacketType[PCP_CONST.PCP_ROOT_URL          ]="string";
PacketType[PCP_CONST.PCP_BCST_VERSION_EX_PREFIX]="bytes";
PacketType[PCP_CONST.PCP_BCST_VERSION_EX_NUMBER]="short";
PacketType[PCP_CONST.PCP_HOST_VERSION_EX_PREFIX]="bytes";
PacketType[PCP_CONST.PCP_HOST_VERSION_EX_NUMBER]="short";


function PCPHost(session_id, broadcast_id, agent, ip, port, version, vp_version) {
  this.sessionId = session_id;
  this.broadcastId = broadcast_id;
  this.agent = agent;
  this.ip = ip;
  this.port = port;
  this.version = version;
  this.vpVersion = vp_version;
}
exports.PCPHost = PCPHost;


function GID(raw) {
  this.id = raw;
  
}

GID.prototype.toString = function() {
  return this.id.toString('hex');
};

GID.prototype.hash = function() {
  h = crypto.createHash('md5');
  h.write(this.id);
  return h.digest();
}

GID.fromString = function(s) {
  return new this(new Buffer(s, 'hex'));
};

GID.generate = function() {
  return new this(crypto.pseudoRandomBytes(16));
};

exports.GID = GID;


function PCPAtom(name, children, content) {
  this.name = name ? name : "";
  this.children = children ? children : [];
  this.content = content ? content : new Buffer(0);
  this.name = this.name.replace("\u0000", "");
  this.name = this.name.replace("\u0000", "");
}

PCPAtom.prototype.getValue = function() {
  var type = PacketType[this.name];
  switch (type) {
    case undefined:
    case null:
      return this.children ? this : this.content;
      break;
    case "parent":
      return this;
      break;
    case "byte":
      return this.content.readUInt8(0);
      break;
    case "gid":
      return new GID(this.content);
      break;
    case "int":
      return this.content.readUInt32LE(0);
      break;
    case "ip":
      return ip.toString(this.content);
      break;
    case "short":
      return this.content.readUInt16LE(0);
      break;
    case "string":
      return this.content.toString('utf8', 0, this.content.length-1).replace("\u0000", "");
      break;
    case "bytes":
      return this.content;
      break;
    default:
      return new Error("Unknown PacketType: " + type);
      break;
  }
};

PCPAtom.prototype.setValue = function(v) {
  var type = PacketType[this.name];
  switch (type) {
    case undefined:
    case null:
      if (v instanceof Array) {
        this.children = v;
      } else {
        this.content = v;
      }
      break;
    case "parent":
      this.children = v;
      break;
    case "byte":
      this.content = new Buffer(1);
      this.content.writeUInt8(v, 0);
      break;
    case "gid":
      this.content = v.id;
      break;
    case "int":
      this.content = new Buffer(4);
      this.content.writeUInt32LE(v, 0);
      break;
    case "ip":
      this.content = ip.toBuffer(v);
      break;
    case "short":
      this.content = new Buffer(2);
      this.content.writeUInt16LE(v, 0);
      break;
    case "string":
      this.content = new Buffer(v + "\0");
      break;
    case "bytes":
      this.content = v;
      break;
    default:
      throw new Error("Unknown packet type: " + type);
      break;
  }
};

PCPAtom.prototype.getFromName = function(n) {
  var c = this.children.filter(
      function(param) {
        //console.log("getFromName : " + n + " - " + param.name);
        if (n == param.name) {
          return true;
        } else {
          return false;
        }
      }
      );
  switch (c.length) {
    case 0:
      return null;
      break;
    case 1:
      return c[0].getValue();
      break;
    default:
      return c.map(
          function(param) {
            return param.getValue();
          }
          );
      break;
  }
};

PCPAtom.prototype.setFromName = function(name, value) {
  this.children = this.children.filter(
      function(param) {
        return (param.name != name);
      }
      );
  var atom = new PCPAtom(name, null, null);
  atom.setValue(value);
  this.children.push(atom);
  return value;
};

PCPAtom.prototype.write = function(stream) {
  if ((this.children != null) & (this.children.length > 0)) {
    var buf = new Buffer(8);
    buf.fill(0x0);
    var c_count = this.children.length;
    c_count = c_count + 0x80000000;
    buf.write(this.name, 0);
    buf.writeUInt32LE(c_count, 4);
    stream.write(buf);
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].write(stream);
    }
  } else {
    var buf = new Buffer(8);
    buf.fill(0x0);
    buf.write(this.name, 0);
    buf.writeUInt32LE(this.content.length, 4);
    buf = Buffer.concat([buf, this.content]);
    stream.write(buf);
  }
};

PCPAtom.PCPAtomReader = function(stream) {
  this.state = "INITIAL";
  this.stream = stream;
  this.atom = {};

  this.read = function() {
    while (true) {
      //console.log("PCPAtom Reader : state " + this.state);
      switch (this.state) {
        case "":
        case "INITIAL":
          var buf = this.stream.read(8);
          if (!(buf)) {  // Can't read from stream
            return null;
          } else {
            var cmdstr = buf.toString('utf8',0,4);  // cmd must be 4 or less letters
            cmdlen = buf.readUInt32LE(4);
            //console.log("PCPAtom Reader : cmd '"+cmdstr+"'");
            if ((cmdlen & 0x80000000) != 0) {  // cmd has children
              this.atom.childlength = cmdlen & 0x7fffffff;
              //console.log("PCPAtom Reader : has child x " + this.atom.childlength.toString());
              this.state = "WAITCHILD";
              this.atom.command = cmdstr;
              this.atom.childreader = new PCPAtom.PCPAtomReader(this.stream);
              this.atom.children = [];
              continue;
            } else {
              this.state = "WAITCONTENTS";
              this.atom.command = cmdstr;
              this.atom.length = cmdlen;
              continue;
            }
          }
          break;
        case "WAITCONTENTS":
          var buf = this.stream.read(this.atom.length);
          //console.log("PCP Atom Reader : Length = " + this.atom.length.toString());
          if (!(buf)) {
            return null;
          } else {
            var res = new PCPAtom(this.atom.command, null, buf);
            this.state = "INITIAL";
            this.atom = {};
            return res;
          }
          break;
        case "WAITCHILD":
          var child = this.atom.childreader.read();
          if (!(child)) {
            return null;
          } else {
            this.atom.children.push(child);
            this.atom.childlength = this.atom.childlength - 1;
            if (this.atom.childlength > 0) {
              continue;
            } else {
              var res = new PCPAtom(this.atom.command, this.atom.children, null);
            this.state = "INITIAL";
            this.atom = {};
            return res;
          }
        }
        break;
      }
    }
  }
}

exports.PCPAtom = PCPAtom;

