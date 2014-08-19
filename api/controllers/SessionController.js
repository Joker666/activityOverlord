/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var bcrypt = require('bcrypt');
module.exports = {
	'new': function(req, res){
		// var oldDateobj = new Date();
		// var newDateobj = new Date(oldDateobj.getTime() + 60000);
		// req.session.cookie.expires = newDateobj;
	  	res.view();
	},
	create: function(req, res, next){
		// email password filed blank
		if(!req.param('email') || !req.param('password')){
			var usernamePasswordRequiredError = [{
				name: 'usernamePasswordRequired',
				message: 'You must both enter username and password'
			}];
			req.session.flash = {
				err: usernamePasswordRequiredError
			}
			res.redirect('/session/new');
			return;
		}
		User.findOneByEmail(req.param('email'), function foundUser(err, user) {
			if(err) return next(err);

			// no email in the database
			if(!user){
				var noAccountError = [{
					name: 'noAccount',
					message: 'The Email address ' + req.param('email') + ' not found'
				}];
				req.session.flash = {
					err: noAccountError
				}
				res.redirect('/session/new');
				return;
			}
			bcrypt.compare(req.param('password'), user.encryptedPassword, function(err, valid){
				if(err) return next(err);

				//username password mismatch
				if(!valid){
					var usernamePasswordMismatchError = [{
						name: 'usernamePasswordMismatch',
						message: 'Invalid Username Password Combination'
					}];
					req.session.flash = {
						err: usernamePasswordMismatchError
					}
					res.redirect('/session/new');
					return;
				}
				req.session.authenticated = true;
				req.session.User = user;

        user.online = true;
        user.save(function (err, user) {
          if (err) return next(err);

          User.publishUpdate(user.id, {
            loggedIn: true,
            id: user.id,
            name: user.name,
            action: ' has logged in.'
          });

          if(req.session.User.admin){
            res.redirect('/user');
            return;
          }

          res.redirect('/user/show/' + user.id);
        });
			});
		});
	},
	destroy: function(req, res, next){
    User.findOne(req.session.User.id, function foundUser(err, user) {

      var userId = req.session.User.id;

      if (user) {
        // The user is "logging out" (e.g. destroying the session) so change the online attribute to false.
        User.update(userId, {
          online: false
        }, function(err) {
          if (err) return next(err);

          // Inform other sockets (e.g. connected sockets that are subscribed) that the session for this user has ended.
          User.publishUpdate(userId, {
            loggedIn: false,
            id: userId,
            name: user.name,
            action: ' has logged out.'
          });

          // Wipe out the session (log out)
          req.session.destroy();

          // Redirect the browser to the sign-in screen
          res.redirect('/session/new');
        });
      } else {

        // Wipe out the session (log out)
        req.session.destroy();

        // Redirect the browser to the sign-in screen
        res.redirect('/session/new');
      }
    });
	}
};

