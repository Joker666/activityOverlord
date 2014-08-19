module.exports = function(req, res, next){
  var sessionUserMatchesId = req.session.User.id === req.param('id');
  var isAdmin = req.session.User.admin;

  if(!(sessionUserMatchesId || isAdmin)){
    return res.forbidden('You are not permitted to perform this action.');
  }

  return next();
}