const fs = require('fs');
const User = require('mongoose').model('User');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const PUB_KEY = fs.readFileSync(process.cwd() + '/id_rsa_pub.pem', 'utf8');

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256']
};


module.exports = (passport) => {
  

  const strategy = new JwtStrategy(options, (payload, done) => {
    User.findOne({ _id: payload.sub }, (err, user) => {
      if (err) {
        return done(err, null);
      } else if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
})

passport.use(strategy);
}