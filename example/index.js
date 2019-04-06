const express = require('express');
const bodyParser= require('body-parser')
const cookieParser = require('cookie-parser');
var session = require('express-session')
let config = require('./config');
global.gConfig = config;
const proxy = require('http-proxy-middleware')
const path = require('path');
const fs = require('fs'),
    http = require('http'),
    https = require('https')

let app = express();
var flash = require('connect-flash');
var md5 = require('md5');
//var authenticate = require('react-express-oauth-login-system/authenticate');
var authenticate = require('../authenticate');
// csrf  middleware
var csrf = require('../csrf');	

app.use(bodyParser.json());
app.use(cookieParser());
// session required for twitter login
app.use(session({ secret: config.sessionSalt ? config.sessionSalt : 'board GOAT boring do boat'}));

// logging
app.use(function(req,res,next) {
	console.log(['URL',req.url]);
//	,req.headers,req.cookies
	next()
});

var router = express.Router();


// ENDPOINTS
// login system
//var loginRouter = require('react-express-oauth-login-system/routes/loginsystem.js');
var loginRouter = require('../routes/loginsystem.js');

//console.log(['INIT EXAMPLE login router',loginRouter])
router.use('/api/login',loginRouter);

function checkMedia(req,res,next) {
	let cookie = req.cookies['access-token'] ? req.cookies['access-token']  : '';
	let parameter = req.query._media ? req.query._media : (req.body._media ? req.body._media : '')
	console.log(['MEDIA CHECK',cookie,parameter])
	if (md5(cookie) === parameter) {
		next()
	} else {
		res.send({error:'media check failed'})
	}
}

// use media authentication with cookie and req parameter because media element cannot send auth in header.
router.use('/api/protectedimage',csrf.checkToken, checkMedia,function (req,res) {
	const stream = fs.createReadStream(__dirname + '/lock.jpg')
	stream.pipe(res)
});


router.use('/api/csrfimage',csrf.checkToken,function (req,res) {
	const stream = fs.createReadStream(__dirname + '/protect.jpg')
	stream.pipe(res)
});

// An api endpoint that returns a short list of items
router.use('/api/getlist',csrf.checkToken, authenticate, (req,res) => {
	console.log('getliste')
	var list = ["item1", "item2", "item3"];
	res.send([{items:list}]);
	console.log('Sent list of items');
});

app.use(router);
// Development, proxy to local create-react-app

//let proxyServer = proxy({ target: config.reactServer })
app.use('/',csrf.setToken,proxy({ target: config.reactServer }))

app.use(function (err, req, res, next) {
	console.log(err);
});

// SSL
// allow self generated certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./certificate.pem'),
};
let port='443'
var webServer = https.createServer(options, app).listen(port, function(){
  console.log("Express server listening on port " + port);
});
