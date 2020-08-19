var express = require('express');
var fetch = require('node-fetch');
const mustache = require('mustache');
const crypto = require("crypto"); 
var faker = require('faker');
var btoa = require('btoa');
const mongoose = require('mongoose');
mongoose.Promise = Promise;
var md5 = require('md5');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bluebird = require('bluebird');
//const oauthMiddlewares = require('../oauth/oauthServerMiddlewares');
const OAuthServer = require('express-oauth-server')
const model = require('./model')
const {sendWelcomeEmail} = require('./utils')

var oauthServer = new OAuthServer({
  model: model,
  grants: ['authorization_code', 'refresh_token','password'],
  accessTokenLifetime: 60 * 60 * 24, // 24 hours, or 1 day
  allowEmptyState: true,
  allowExtendedTokenAttributes: true,
})
var passport = require('./passport')
let config = global.gConfig;
var router = express.Router();

/******************************************************
 * This module exports a router that includes routes for a login system and oauth server
 * 
 *****************************************************/

var utils = require("./utils")
	// INITIALISE MONGOOSE AND RAW MONGODB CONNECTIONS
	var ObjectId = require('mongodb').ObjectID;

	//const User F= require('./User');

	mongoose.connect(config.databaseConnection + config.database,{useMongoClient: true}).then(() => {
		console.log('Mongoose Connected');
	}).catch((err) => {
		console.log(err);
	});


	const database = require('./database');
	
	// INITIALSE OAUTH SERVER - create client if not exists
	database.OAuthClient.findOne({clientId: config.clientId}).then(function(client) {
		let clientFields = 	{clientId: config.clientId, clientSecret:config.clientSecret,name:config.clientName,website_url:config.clientWebsite,privacy_url:config.clientPrivacyPage,redirectUris:[],image:config.clientImage};
		if (client!= null) {
			// OK
			database.OAuthClient.update({clientId:config.clientId},clientFields);
		} else {
			let client = new database.OAuthClient(clientFields);
			client.save().then(function(r) {
			});
		}
	}).catch(function(e) {
		console.log(e);
	});
	global.Promise = bluebird;

	router.use(bodyParser.json());
	router.use(bodyParser.urlencoded({ extended: false }));


	// CALLBACK WHEN USER IS IDENTIFIED TO ADD TOKEN AND SET ACCESS COOKIE
	function loginSuccessJson(user,res,cb) {
		console.log(['SAVE USER',user]);
		requestToken(user).then(function(userAndToken) {
				// cache the refresh token in the user db collection
				console.log(['Done SAVE USER',userAndToken]);
				//user.token = userAndToken.token;
				//user.save().then(function(err,result) {
					let token = userAndToken.token;
					//don't send the refresh token to the client
					if (token) {
						token.refresh_token = null;
						res.cookie('access-token',token.access_token);
						cb(null,Object.assign(sanitizeUser(userAndToken),{token:token}))
					} else {
						cb('missing token on login success',null)
					}
				//})                      
		  });
	}

	// CALLBACK TO SUPPORT PASSPORT STRATEGIES
	function findOrCreateUser(name,email,cb) {
		console.log(['FIND AND CREATE USER ',name,email])
								
		if (email && email.length > 0) {
			if (!config.allowedUsers || config.allowedUsers.length === 0 ||  (config.allowedUsers.indexOf(email.toLowerCase().trim()) >= 0 )) {
				
			 console.log(['/findorcreate have mail',email]);
				 database.User.findOne({username:email.trim()}).then(function(user) {
					 console.log(['/findorcreate fnd',user]);
					  if (user!=null) {
						  	// USER LOGIN SUCCESS JSON
							cb(null,user.toObject());
					  } else {
						  var pw = crypto.randomBytes(20).toString('hex');
						  let item={name:name,username:email,password:pw};
						  //item.access_token = generateToken();
						  //item.access_token_created = new Date().getTime();
						   if (!item.avatar) item.avatar = faker.commerce.productAdjective()+faker.name.firstName()+faker.name.lastName()
						  
						  let user = new database.User(item);
						  user.save().then(function() {;
								console.log(['FIND AND CREATE USER COMPLETE ',user])
								// USER LOGIN SUCCESS JSON
								cb(null,user.toObject());
						  });
					  }
				 }).catch(function(e) {
					 //console.log(e);
					 cb(e, null);
				 });
			} else {
				cb('Not allowed to register', null);
			}		 
		} else {
			cb('no user', null);
		}
	}

	function generateToken() {	
		return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
	}
	
	// MAKE A USER/PASS REQUEST FOR A TOKEN AND RESOLVE THE EXTENDED USER 
	function requestToken(user) {
		 return new Promise(function(resolve,reject) {
			 var params={
				username: user.username,
				password: user.password,
				'grant_type':'password',
				'client_id':config.clientId,
                'client_secret':config.clientSecret,
			};
			  console.log(['RQUEST TOKEN',params])
			  return fetch(config.authServer+"/token", {
				  method: 'POST',
				  headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				  },
				  
				  body: Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&')
				}).then(function(response) {
					return response.json();
				}).then(function(token) {
					if (token && token.access_token && token.access_token.length > 0) {
						user.token = token;
						resolve(user);
					} else {
						console.log(['ERROR REQUESTING TOKEN',token])
					}
					reject();
				}).catch(function(err) {
						console.log(['ERROR REQUESTING TOKEN',err])
						reject();
				});
		});
	}
	
	
	// SANITIZE USER TO BE DELIVERED TO THE CLIENT, ONLY ALLOWED FIELDS FROM config.userFields and no password fields
	function sanitizeUser(user) {
		let item={};
		//console.log(['sanitize user',config.userFields]);
		if (!config.userFields || config.userFields.length === 0) config.userFields=['name','avatar','username','token','password','tmp_password']

		config.userFields.map(function(fieldName) {
			let key = fieldName.trim();
			item[key] = typeof user[key] ==="string" ? user[key].trim() : '';
		 });
		 if (user._id) item._id = user._id;
		 delete item.password;
		 delete item.tmp_password;
		 return item;
	}
    

	// implement csrf check locally so fine grain selection of protected paths can be applied (leaving oauth paths public)
	// can be enabled/disabled in configuration
	let csrfCheck = function(req,res,next) { next()}
	if (config.csrfCheck) {
		csrfCheck = function(req,res,next) {
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
				res.send({error:'Failed CSRF check'});
			}
		} 
	}
	
	
    router.post('/authorize', (req,res,next) => {
      console.log('ddInitial User Authentication')
      const {username, password} = req.body
      console.log('HAVE dets',username, password)
      if(username  && password) {
        req.body.user = model.getUser(username, password)
        console.log('HAVE USER',req.body.user)
        return next()
      }
      const params = [ // Send params back down
        'client_id',
        'redirect_uri',
        'response_type',
        'grant_type',
        'state',
      ]
        .map(a => `${a}=${req.body[a]}`)
        .join('&')
      return res.redirect(`/oauth?success=false&${params}`)
    }, (req,res, next) => { // sends us to our redirect with an authorization code in our url
      console.log('Authorization')
      return next()
    }, oauthServer.authorize({
      authenticateHandler: {
        handle: req => {
          console.log('Authenticate Handler')
          console.log(Object.keys(req.body).map(k => ({name: k, value: req.body[k]})))
          return req.body.user
        }
      }
    }))

    router.post('/token', (req,res,next) => {
      console.log('Token')
      next()
    },oauthServer.token({
      requireClientAuthentication: { // whether client needs to provide client_secret
        //'authorization_code': false,
      },
    }))  // Sends back token


	
	
	//passport.use(new AmazonStrategy({
		//clientID: config.amazonClientId,
		//clientSecret: config.amazonClientSecret,
		//callbackURL: config.authServer+"/amazoncallback",
	  //},
	  //function(accessToken, refreshToken, profile, done) {
		//User.findOrCreate({ amazonId: profile.id }, function (err, user) {
		  //return done(err, user);
		//});
	  //}
	//));
	
	router.use(passport.initialize());
	// END CONFIGURE AND INITIALISE PASSPORT
	
	
    /*********************************
	 * API ROUTES
	 *********************************/
	
	router.use('/login',csrfCheck,function(req, res, next) {	  //  console.log('do login NOW')
		passport.authenticate('local', function(err, user, info) {
			loginSuccessJson(user,res,function(err,finalUser) {
				if (err) console.log(err);
				res.json(finalUser);
			})
		})(req, res, next);
	})  

	router.use('/google',function(req, res, next) {
		passport.authenticate('google', { scope: ['profile','email'] })(req,res,next);
	}) 
	
	router.get('/googlecallback', 
		passport.authenticate('google', { failureRedirect: '/login' }),
		function(req, res) {
			loginSuccessJson(req.user,res,function(err,user) {
				res.redirect('/login/success');
			});
		}
	);
	
	router.use('/twitter',function(req, res, next) {
		passport.authenticate('twitter', { scope: ['email'] })(req,res,next);
	}) 
	router.get('/twittercallback', 
	  passport.authenticate('twitter', { failureRedirect: '/login' }),
	  function(req, res, next)	 {
		loginSuccessJson(req.user,res,function(err,user) {
			res.redirect('/login/success');
		});
	});
	
	router.use('/facebook',function(req, res, next) {
		passport.authenticate('facebook', { scope: ['email'] })(req,res,next);
	}) 
	router.get('/facebookcallback', 
	  passport.authenticate('facebook', { failureRedirect: '/login' }),
	  function(req, res, next) {
		loginSuccessJson(req.user,res,function(err,user) {
			res.redirect('/login/success');
		});
	 });
	
	// NO ACCESS TO EMAIL ADDRESS
	//router.use('/instagram',function(req, res, next) {
	  //console.log('do instagram login NOW')
		//passport.authenticate('instagram', { scope: ['basic'] })(req,res,next);
	////	next();
	//}) 
	//router.get('/instagramcallback', 
	  //passport.authenticate('instagram', { failureRedirect: '/login' }),
	  //function(req, res, next) {
		//// Successful authentication, redirect home
		//console.log('instagram CALLBACK USER',req.user)
		//res.redirect('/login'+'?code='+req.user.refresh_token);
     //});
	
	
	router.use('/github',function(req, res, next) {
	  passport.authenticate('github', { scope: ['user:email'] })(req,res,next);
	}) 
	router.get('/githubcallback', 
	  passport.authenticate('github', { failureRedirect: '/login' }),
	  function(req, res, next) {
			loginSuccessJson(req.user,res,function(err,user) {
			res.redirect('/login/success');
		});
	 });
	
	//app.get('/amazon',
	  //passport.authenticate('amazon'));

	//app.get('/amazoncallback', 
	  //passport.authenticate('amazon', { failureRedirect: '/login' }),
	  //function(req, res) {
		//// Successful authentication, redirect home.
		//res.redirect('/');
	  //});
	
	
	/********************
	 * SIGNUP
	 ********************/
	router.post('/signup', csrfCheck,function(req, res) {
			if (req.body.username && req.body.username.length > 0 && req.body.name && req.body.name.length>0 && req.body.avatar && req.body.avatar.length>0 && req.body.password && req.body.password.length>0 && req.body.password2 && req.body.password2.length>0) {
			if (!config.allowedUsers || config.allowedUsers.length === 0 ||  (config.allowedUsers.indexOf(req.body.username.toLowerCase().trim()) >= 0 )) {
				
				if (req.body.password2 != req.body.password)  {
					res.send({message:'Passwords do not match.'});
				} else {
					database.User.findOne({username:req.body.username.trim()}, function(err, ditem) {
						if (err) console.log(err)
						if (ditem) {
							res.send({'warning':'There is already a user registered with the email address '+req.body.username});
						} else {
							let item = {}
							config.userFields.map(function(fieldName) {
								let key = fieldName.trim();
								item[key] = req.body[key] ? req.body[key].trim() : '';
							});
							item.password = req.body.password.trim();
							database.User.findOne({avatar:{$eq:req.body.avatar.trim()}}).then(function(avUser) {
									if (avUser!=null && avUser.length>0) {
										res.send({message:'Avatar name is already taken, try something different.'});
									} else {
										item.signup_token =  generateToken();
										item.signup_token_timestamp =  new Date().getTime();
										
										item.tmp_password=item.password;
										item.password='';
										item.password2='';
										let user = new database.User(item)
										user.save().then(function(result2) {
											res.send(sendWelcomeEmail(item.signup_token,req.body.name,item.username));
										});                                        
									}
							});
						}
					});
				}
			} else {
				res.send({message:'Sorry. You are not allowed to register and login.'});
			}
		} else {
			res.send({message:'Missing required information.'});
		}
	});
	  

	/********************
	 * CONFIRM REGISTRATION
	 ********************/
	router.get('/doconfirm',function(req,res) {
		let params = req.query;
		if (params && params.code && params.code.length > 0) {
		    database.User.findOne({ signup_token:params.code.trim()})
			.then(function(user)  {
					if (user != null) {
						if (new Date().getTime() - parseInt(user.signup_token_timestamp,10) < 600000) {
							
							var userId = user._id;
							user.password = user.tmp_password;
							user.signup_token = undefined;
							user.signup_token_timestamp =  undefined;
							user.tmp_password = undefined;
							user.save().then(function() {
								loginSuccessJson(user,res,function(err,user) {
									res.redirect('/login/success');
								});
							});
					   } else {
						   res.send('token timeout. restart request')
					   }
					} else {
						res.send({message:'No matching registration'} );
					}
			   // }
			}).catch(function(e) {
				console.log(['failed',e]);
				res.send({message:'failed'});
			});
		} else {
				res.send({message:'missing code	'})
		}
	})


	/********************
	 * SIGN OUT
	 ********************/
	router.post('/logout', function(req, res) {
		res.clearCookie('access-token');
		res.send({})
	});
	
	/********************
	 * SIGN IN
	 ********************/
	router.post('/signin',csrfCheck, function(req, res) {
		if (req.body.username && req.body.username.length > 0 && req.body.password && req.body.password.length>0) {
				database.User.findOne({username:req.body.username.trim(),password:req.body.password.trim()})
				.then(function(user)  {
						if (user != null) {
						   loginSuccessJson(user,res,function(err,finalUser) {
								if (err) console.log(err);
								res.json(finalUser); 
							})
						} else {
							res.send({message:'No matching user'} );
						}
				}).catch(function(e) {
					console.log(e);
					res.send({message:'failed'});
				});		
		} else {
			 res.send({message:'Missing required login credentials'});
		}
	});



	/********************
	 * REQUEST  PASSWORD RECOVERY EMAIL
	 ********************/
	router.post('/recover', csrfCheck,function(req, res) {
		if (req.body.email && req.body.email.length > 0 && req.body.code && req.body.code.length > 0) {
			if (!req.body.password || req.body.password.length==0 || !req.body.password2 || req.body.password2.length==0) {
				res.send({warning_message:'Empty password is not allowed'});
			} else if (req.body.password2 != req.body.password)  {
				res.send({warning_message:'Passwords do not match'});
			} else {
				database.User.findOne({username:req.body.email}, function(err, user) {
				  if (err) {
					  res.send({warning_message:err,here:1});
				  } else if (user!=null) {
					  user.tmp_password = req.body.password;
					  user.recover_password_token=generateToken(); //req.body.code;
					  user.recover_password_token_timestamp =  new Date().getTime();
					  // no update email address, item.username = req.body.username;
					  user.save().then(function(xres) {
						   var link = config.authServer + '/dorecover?code='+user.recover_password_token;
						   var mailTemplate = config.recoveryEmailTemplate && config.recoveryEmailTemplate.length > 0 ? config.recoveryEmailTemplate : `<div>Hi {{name}}! <br/>

	To confirm your password recovery of your account , please click the link below.<br/>

	<a href="{{link}}" >Confirm your password update</a><br/>

	If you did not recently request a password recovery for your account, please ignore this email.<br/><br/>

									  </div>`;
						   
						   
						   var mailTemplate =  mustache.render(mailTemplate,{link:link,name:user.name});
						   utils.sendMail(config.mailFrom,req.body.email,"Update your password ",
									 mailTemplate
								  );  
						  user.warning_message="Sent recovery email";
						  res.send({warning_message: "Sent recovery email"});
					  });  
					  
				  } else {
					  res.send({warning_message:'No matching email address found for recovery'});
				  }
				}); 
			}
		} else {
			res.send({warning_message:'Missing required information.'});
		}
	});
	/********************
	 * PASSWORD RECOVERY 
	 ********************/
	router.get('/dorecover',function(req,res) {
			let params = req.query;
		 	  database.User.findOne({ recover_password_token:params.code})
				.then(function(user)  {
					if (user != null) {
					  if (new Date().getTime() - parseInt(user.recover_password_token_timestamp,10) < 600000) {
						user.password = user.tmp_password;
						user.recover_password_token = undefined;
						user.recover_password_token_timestamp = undefined;
						user.tmp_password = undefined;
						var userId = user._id;
						  user.save().then(function() {
							 loginSuccessJson(user,res,function(err,finalUser) {
								if (err) console.log(err);
								res.redirect('/login/success'); 
							})
						  });	
					   } else {
						   	  res.send('token timeout restart request' );
					   }
					} else {
						res.send('no matching registration' );
					}
				}).catch(function(e) {
					res.send('failed');
				});		
	})


	// MAKE OAUTH REFRESH REQUEST
	//function requestRefreshToken(refreshToken) {
		 //return new Promise(function(resolve,reject) {
			 //var params={
				//refresh_token: refreshToken,
				//'grant_type':'refresh_token',
				//'client_id':config.clientId,
				//'client_secret':config.clientSecret
			  //};
			////  console.log(['RQUEST TOKEN',params])
			  //return fetch(config.authServer+"/token", {
				  //method: 'POST',
				  //headers: {
					//'Content-Type': 'application/x-www-form-urlencoded',
				  //},
				  
				  //body: Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&')
				//}).then(function(response) {
					//return response.json();
				//}).then(function(token) {
					//if (token.access_token && token.access_token.length > 0) {
						//resolve(token);
					//} else {
						//console.log(['ERROR REQUESTING TOKEN',token])
						//reject(token);
					//}
				//}).catch(function(err) {
						//console.log(['ERROR REQUESTING TOKEN',err])
				//});
		//});
	//}
	

	/********************
	 * Update the access token and return the current user(+token) as JSON
	 ********************/
	router.post('/me',csrfCheck,oauthServer.authenticate,function(req,res) {
		if (req.user && req.user._id) {
			loginSuccessJson(req.user.user,res,function(err,finalUser) {
				if (err) console.log(err);
				res.json(finalUser); 
			})
			 			
		}
	})

	/********************
	 * SAVE USER, oauthMiddlewares.authenticate
	 ********************/
	router.post('/saveuser',csrfCheck,oauthServer.authenticate, function(req, res) {
		if (req.body._id && req.body._id.length > 0) {
			if (req.body.password && req.body.password.length > 0 && req.body.password2 && req.body.password2.length > 0 && req.body.password2 != req.body.password)  {
				res.send({warning_message:'Passwords do not match'});
			} else {
				database.User.findOne(ObjectId(req.body._id), function(err, user) {
				  if (err) {
					  res.send({warning_message:err,here:2});
				  } else if (user!=null) {
					 config.userFields.map(function(fieldName) {
						let key = fieldName.trim();
						// don't update username
						if (key !== 'username' && key !== 'password') {
							user[key] = req.body[key] && req.body[key].trim  ? req.body[key].trim() : '';
						}
				     });
				    
				     if (req.body.password && req.body.password.trim().length > 0 && req.body.password2 && req.body.password2.trim().length > 0 && req.body.password === req.body.password2) {
						  user.password=req.body.password.trim();
					 }
					
					  // update avatar only when changed
					  if (req.body.avatar && user.avatar != req.body.avatar) {
						  database.User.findOne({avatar:{$eq:req.body.avatar}}, function(err, avUser) {
							  if (avUser!=null) {
								  res.send({warning_message:"Avatar name is already taken, try something different."});
							  } else {
								  user.save().then(function(xres) {
									  user.warning_message="Saved changes";
									  res.send(user);
								  });  
							  }
						  });
					  } else {
						user.save().then(function(xres) {
							  user.warning_message="Saved changes";
							  res.send(user);
						  });  
					  }
				  } else {
					  res.send({warning_message:'ERROR: No user found for update'});
				  }
				}); 
			}
		} else {
			res.send({warning_message:'Missing required information.'});
		}
	});

	//router.get('/oauthclient',function(req,res) {
		//let clientId = req.query.clientId;
		//database.OAuthClient.findOne({clientId:clientId}, function (err, client) {
		    //if (err) { 
				//res.send({error:err})  
			//} else {
				//if (client) {
					//res.send({name:client.name,website_url:client.website_url,privacy_url:client.privacy_url,image:client.image});
				//} else {
						//res.send({error:'no match'})  
				//}
			//}
		//});	 
			 
			 
	//})
	// error handlers
	router.use((req, res, next) => {
	  const err = new Error('Not Found');
	  err.status = 404;
	  next(err);
	});

	router.use((err, req, res, next) => {
	  res.status(err.status || 500);
	  console.log(err);
	  res.json({
		message: err.message,
		error: err
	  });
	});



	

module.exports =  router;

