// fileencoding=utf-8
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.locals.pecaAddr = req.cookies.pecaAddr || '127.0.0.1';
  res.locals.pecaPort = req.cookies.pecaPort || '7144';
  res.render('index', { title: 'YPStandJS' });
};

exports.setCookie = function(req, res) {
  res.cookie('pecaAddr', req.param('pecaAddr'));
  res.cookie('pecaPort', req.param('pecaPort'));
  res.redirect(303, '/');
};

exports.index_txt = function(req, res) {
  function escapeBrancket(str) {
    return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  res.type("text/plain");
  var channels = res.locals.channels;
  var r = ""
  for (var i in channels) {
    var data = [];
    data.push(channels[i].name);  // チャンネル名
    data.push(channels[i].channelId.toString());  // チャンネルID
    data.push(channels[i].tracker);  // TIP
    data.push(encodeURI(channels[i].contactUrl));  // コンタクトURL
    data.push(channels[i].genre);  // ジャンル
    data.push(channels[i].description);  // 詳細
    data.push(channels[i].directs.toString());  // リスナー数
    data.push(channels[i].relays.toString());  // リレー数
    data.push(channels[i].bitrate.toString());  // ビットレート
    data.push(channels[i].type);  // 配信種別
    data.push(channels[i].artist);  // トラックアーティスト
    data.push(channels[i].title);  // トラックタイトル
    data.push(channels[i].album);  // トラックアルバム
    data.push(encodeURI(channels[i].trackUrl));  // トラックのコンタクトURL
    data.push(escapeBrancket(encodeURI(channels[i].name)));  // チャンネル名
    var uptime = channels[i].lastUpdated - channels[i].startFrom;
    var uptimeHour = Math.floor(uptime / (1000 * 60 * 60));
    var uptimeMin = Math.floor(uptime / (1000 * 60));
    data.push(uptimeHour.toString() + ":" + uptimeMin.toString());  // 配信時間
    data.push("click");  // ステータス
    data.push(escapeBrancket(channels[i].comment));  // コメント
    data.push("0"); // ダイレクトの有無
    r = r + data.join("<>") + "\n";
  }
  res.send(r);
}
