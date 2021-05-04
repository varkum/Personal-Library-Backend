const mongoose = require('mongoose');
const router = require('express').Router();   
const User = mongoose.model('User');
const passport = require('passport');
const utils = require('../lib/utils');

router.get('/deleteall', (req, res) => {
  User.deleteMany((err, data) => {
    if (err) res.json(err);
    res.send('success!');
  })
})
router.post('/login', (req, res, next) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (err) { next(err) }
    if (!user) {
      res.status(401).json({ success: false, msg: "could not find user" });
    } else {

    const isValid = utils.validPassword(req.body.password, user.hash, user.salt);

    if(isValid) {
      const tokenObject = utils.issueJWT(user);
      res.status(200).json({ success: true, user: user,token: tokenObject.token, expiresIn: tokenObject.expires })
    } else {
        res.status(401).json({ success: false, msg: "you entered the wrong password" });
    }
    }
  })
});

router.post('/register', (req, res, next) => {
  User.findOne({ username: req.body.username }, (err, user) => {
    if (!user) {
      const saltHash = utils.genPassword(req.body.password);
      const salt = saltHash.salt;
      const hash = saltHash.hash;

      const newUser = new User({
        username: req.body.username,
        hash: hash,
        salt: salt,
        books: []
      })

      newUser.save((err, user) => {
        if (err) res.json({ success: false, msg: err })

        const jwt = utils.issueJWT(user);
    
        res.json({ success: true, user: user, token: jwt.token, expiresIn: jwt.expires });

  })
    } else {
      res.status(401).json({ success: false, msg: "username is already taken!"})
    }
  })
  
});

module.exports = router;