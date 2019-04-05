module.exports = {	
	setToken: function csrf(req,res,next) {
		if (!req.cookies['csrf-token']) {
			res.cookie('csrf-token',require('crypto').randomBytes(64).toString('hex'));
		}
		next()
	},
	
	checkToken: function(req,res,next) {
		//console.log(['CHECK TOKEN',req.cookies,req.headers])
		if (req.cookies && req.cookies['csrf-token'] && req.cookies['csrf-token'].length > 0) {
			if (req.headers && req.headers['x-csrf-token'] && req.headers['x-csrf-token'].length > 0 && req.headers['x-csrf-token'] === req.cookies['csrf-token']) {
				next();
			} else if (req.query && req.query['_csrf'] && req.query['_csrf'].length > 0 && req.query['_csrf'] === req.cookies['csrf-token']) {
				next();
			} else if (req.body && req.body['_csrf'] && req.body['_csrf'].length > 0 && req.body['_csrf'] === req.cookies['csrf-token']) {
				next();
			} else {
				res.send({error:'Failed CSRF check'});
			}
		} else {
			res.send({error:'Failed check'});
		}
	}
}
