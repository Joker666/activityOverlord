module.exports = function(req, res, next) {


  if (req.session.authenticated && req.session.User.admin) {
    return next();
  }

  return res.forbidden('You are not permitted to perform this action.');
};