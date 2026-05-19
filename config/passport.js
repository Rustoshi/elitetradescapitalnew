const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

// Load User model
const User = require('../model/User');

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (username, password, done) => {
      try {
        // Match user
        const user = await User.findOne({ email: username });
        if (!user) {
          return done(null, false, { message: 'invalid email or password' });
        }
        if (user.disabled) {
          return done(null, false, { message: 'sorry, your account has been deactivated' });
        }
        // Match password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'invalid email or password' });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(async function (id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};