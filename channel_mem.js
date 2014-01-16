// fileencoding=utf-8

var util = require('util');
var secret = require('secret');
var pcpconst = require('./peca').PCP_CONST;
var pcpatom = require('./peca').PCPAtom;

var chan_list = {};

function channel() {
}

channel.getall = function() {
  return chan_list;
}

channel.get = function(chanid) {
  return chan_list[chanid];
}

channel.set = function(chanid, obj) {
  chan_list[chanid] = obj;
  //console.log(util.inspect(obj));
  var info = obj.info;
  if (!info) {
    info = new pcpatom();
  }
  var track = obj.track;
  if (!track) {
    track = new pcpatom();
  }
  chan_list[chanid].name = info.getFromName(pcpconst.PCP_CHAN_INFO_NAME) || '';
  chan_list[chanid].genre = info.getFromName(pcpconst.PCP_CHAN_INFO_GENRE) || '';
  chan_list[chanid].description = info.getFromName(pcpconst.PCP_CHAN_INFO_DESC) || '';
  chan_list[chanid].comment = info.getFromName(pcpconst.PCP_CHAN_INFO_COMMENT) || '';
  chan_list[chanid].contactUrl = info.getFromName(pcpconst.PCP_CHAN_INFO_URL) || '';
  chan_list[chanid].artist = track.getFromName(pcpconst.PCP_CHAN_TRACK_CREATOR) || '';
  chan_list[chanid].title = track.getFromName(pcpconst.PCP_CHAN_TRACK_TITLE) || '';
  chan_list[chanid].album = track.getFromName(pcpconst.PCP_CHAN_TRACK_ALBUM) || '';
  chan_list[chanid].trackUrl = track.getFromName(pcpconst.PCP_CHAN_TRACK_URL) || '';
  chan_list[chanid].bitrate  = info.getFromName(pcpconst.PCP_CHAN_INFO_BITRATE) || 0;
  chan_list[chanid].type = (info.getFromName(pcpconst.PCP_CHAN_INFO_TYPE) || '').replace(/\0/g, "");
  //chan_list[chanid].startFrom
  var relays = 0;
  for (var i in obj.hosts) {
    if (obj.hasOwnProperty(i)) {
      relays = relays + obj.hosts[i].getFromName(pcpconst.PCP_HOST_NUMR);
    }
  }
  var directs = 0;
  for (var i in obj.hosts) {
    if (obj.hasOwnProperty(i)) {
      directs = directs + obj.hosts[i].getFromName(pcpconst.PCP_HOST_NUML);
    }
  }
  chan_list[chanid].relays = relays;
  chan_list[chanid].directs = directs;
  var host = Object.getOwnPropertyNames(obj.hosts);
  if (host.length > 0) {
    if ((obj.hosts[host[0]].getFromName(pcpconst.PCP_HOST_IP)) && (obj.hosts[host[0]].getFromName(pcpconst.PCP_HOST_PORT))) {
      var host_ip = obj.hosts[host[0]].getFromName(pcpconst.PCP_HOST_IP)[0];
      var host_port = obj.hosts[host[0]].getFromName(pcpconst.PCP_HOST_PORT)[0];
      //console.log("IP:"+util.inspect(host_ip));
      //console.log("PORT:"+util.inspect(host_port));
      chan_list[chanid].tracker = host_ip + ":" + host_port;
    }
  } else {
    chan_list[chanid].tracker = '';
  }
  //console.log(util.inspect(chan_list[chanid]));
}

channel.del = function(chanid) {
  delete chan_list[chanid];
}

exports.channel_mem = channel;

