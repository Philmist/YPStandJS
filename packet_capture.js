// fileencoding=utf-8
// 簡易ぱけっときゃぷちゃ

var net = require("net");
var util = require("util");

sv = net.createServer(
  function(s) {
    s.on("readable",
      function() {
        d = s.read();
        if (d != null) {
          console.log(util.inspect(d));
        }
      }
    );
  }
);

sv.listen(7146,
  function() {
    console.log("Sever listen on port 7146.");
  }
);
