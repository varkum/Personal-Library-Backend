const crypto = require('crypto');
const jsonwebtoken = require('jsonwebtoken');
const fs = require('fs');

const PRIV_KEY = fs.readFileSync(process.cwd() + '/id_rsa_priv.pem');

//decrypt password and compare with password provided at login
function validPassword(password, hash, salt) {
  let hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === hashVerify;
}

//encrypt password with salt and hash to store in db
function genPassword(password) {
  let salt = crypto.randomBytes(32).toString('hex');
  let genHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    
    return {
      salt: salt,
      hash: genHash
    };
}

//issue JWT
function issueJWT(user) {
  const _id = user._id;
  const expiresIn = '1d';

  const payload = {
    sub: _id,
    iat: Date.now()
  };

  const signedToken = jsonwebtoken.sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn
  }
}

module.exports.validPassword = validPassword;
module.exports.genPassword = genPassword;
module.exports.issueJWT = issueJWT;