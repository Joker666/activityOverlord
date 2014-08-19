/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	'new': function(req, res){
    res.view();
  },

  create: function(req, res, next){
    var userObj = {
      name: req.param('name'),
      title: req.param('title'),
      email: req.param('email'),
      password: req.param('password'),
      confirmation: req.param('confirmation')
    }

    User.create(userObj, function userCreated(err, user){
      if(err) {
        req.session.flash = { err:err };
        return res.redirect('/user/new');
      }
      //res.json(user);

      req.session.authenticated = true;
      req.session.User = user;

      user.online = true;
      user.save(function (err, user) {
        if (err) return next(err);
        User.publishCreate(user);
        res.redirect('/user/show/'+user.id);
      });
    });
  },

  show: function(req, res, next){
    User.findOne(req.param('id'), function foundUser(err, user){
      if(err) return next(err);
      if(!user) return next();
      res.view({
        user: user
      });
    });
  },

  index: function(req, res, next){
    User.find(function foundUsers(err, users){
      if (err) return next(err);
      res.view({ users: users });
    });
  },

  edit: function(req, res, next) {
    // Find the user from the id passed in via params
    User.findOne(req.param('id'), function foundUser(err, user) {
      if (err) return next(err);
      if (!user) return next('User doesn\'t exist.');

      res.view({
        user: user
      });
    });
  },

  update: function(req, res, next) {

    if (req.session.User.admin) {
      if(req.param('admin') !== undefined) var bucky = true;
      var userObj = {
        name: req.param('name'),
        title: req.param('title'),
        email: req.param('email'),
        admin: bucky
      }
    } else {
      var userObj = {
        name: req.param('name'),
        title: req.param('title'),
        email: req.param('email')
      }
    }
    User.update(req.param('id'), userObj, function userUpdated(err) {
      if (err) {
        return res.redirect('/user/edit/' + req.param('id'));
      }

      res.redirect('/user/show/' + req.param('id'));
    });
  },

  destroy: function(req, res, next){
    User.findOne(req.param('id'), function foundUser(err, user){
      if(err) return next(err);
      if (!user) return next('User doesn\'t exist.');
      User.destroy(req.param('id'), function userDestroyed(err){
        if (err) return next(err);
        User.publishDestroy(user.id);
      })
      res.redirect('/user');
    })
  },

  subscribe: function(req, res){
    User.find({}).exec(function foundUsers(err, users){
      if(err) return next(err);
      User.subscribe(req.socket, users);
      res.send(200);
    });
  }
};

