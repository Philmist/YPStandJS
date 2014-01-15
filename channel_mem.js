// fileencoding=utf-8

var util = require('util');

function Channel() {
  
  this.channel = {};
  
  this.add = function(channelId, obj) {
    this.channel[channelId] = obj;
  }
  
  this.del = function(channelId) {
    delete this.channel[channelId];
  }
  
  this.get = function(channelId) {
    return this.channel[channelId];
  }
}

exports.Channel = Channel;
