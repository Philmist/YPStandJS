// fileencoding=utf-8
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'YPStandJS' });
};
