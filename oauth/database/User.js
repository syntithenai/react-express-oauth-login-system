const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  password: String,
  name: String,
  avatar: String,
  scope: String,
  signup_token: String,
  forgot_password_token: String,
//  access_token: String,
//  access_token_created: String,
//  token: Object,
  tmp_password: String
});

module.exports = mongoose.model('User', UserSchema);
