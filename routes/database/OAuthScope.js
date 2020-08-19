// Currently not used - still needed?
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OAuthScopeSchema = new Schema({
  scope: String,
  is_default: Boolean
});
OAuthScopeSchema.virtual('id').get(function () {
  return this._id;
});
module.exports = mongoose.model('OAuthScope', OAuthScopeSchema);
