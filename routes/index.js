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

