const mongoose = require('mongoose');
const config = require('../../config');
const OAuthAccessToken = require('./OAuthAccessToken');
const OAuthAuthorizationCode = require('./OAuthAuthorizationCode');
const OAuthClient = require('./OAuthClient');
const OAuthRefreshToken = require('./OAuthRefreshToken');
const OAuthScope = require('./OAuthScope');
const User = require('./User');

mongoose.Promise = Promise;

function connect(connectString='') {
  if (connectString.length == 0) {
      connectString = config.databaseConnection + config.database;
  }
  mongoose.connect(connectString,{useMongoClient: true}).then(() => {
    //console.log('Mongoose Connected');
  }).catch((err) => {
    //console.log(err);
  });
}

module.exports = {
  connect,
  OAuthAccessToken,
  OAuthAuthorizationCode,
  OAuthClient,
  OAuthRefreshToken,
  OAuthScope,
  User
};
