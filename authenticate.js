let config = global.gConfig;
	
const oauthMiddlewares = require('./oauth/oauthServerMiddlewares');
const database = require('./oauth/database');
database.connect(config.databaseConnection+config.database);

// wrap the oauth middleware to catch exceptions quietly
let authWrap = function(req,res,next) {
	try {
		oauthMiddlewares.authenticate(req,res,next);
	} catch (e) {
		console.log('AUTH ERR');
	}
}
module.exports =  authWrap
