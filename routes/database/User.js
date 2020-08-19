const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: String,
  password: String,
  name: String,
  avatar: String,
  scope: String,
  signup_token: String,
  recover_password_token: String,
  signup_token_timestamp: String,
  recover_password_token_timestamp: String,
  refresh_token: String,
//  access_token_created: String,
//  token: Object,
  tmp_password: String
});
UserSchema.virtual('id').get(function () {
  return this._id;
});
module.exports = mongoose.model('User', UserSchema);
