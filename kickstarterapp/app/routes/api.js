var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'kickstarter';

module.exports = function(router){
	//http://localhost:8080/users
	//USER REGISTRATION ROUTE
	router.post('/users', function(req, res){	
		var user = new User();
		//console.log(req.body);
		user.username = req.body.username;
		user.password = req.body.password;
		user.email = req.body.email;
		user.fname = req.body.fname;
		user.lname = req.body.lname;
		if(req.body.username==null || req.body.username=='' || req.body.password==null || req.body.password=='' || 
			req.body.email==null || req.body.email=='' || req.body.fname==null || req.body.fname==''){
			//res.send("NO Data provided");
			res.json({success:false, message: 'No Data provided'});
		}else{
			user.save(function(err){
				if(err){

					if(err.errors != null){
						if(err.errors.fname){
							res.json({success:false, message: err.errors.fname.message});
						}
						else if(err.errors.lname){
							res.json({success:false, message: err.errors.lname.message});	
						}
						else if(err.errors.email){
							res.json({success:false, message: err.errors.email.message});	
						}
						else if(err.errors.username){
							res.json({success:false, message: err.errors.username.message});	
						}
						else if(err.errors.password){
							res.json({success:false, message: err.errors.password.message});	
						}else{
							res.json({success:false, message: err});
						}
					} else if(err){
						if(err.code == 11000){
							
							if(err.errmsg[64] == 'u'){
								res.json({success:false, message: "Username already taken."});		
							}else if(err.errmsg[64] == 'e'){
								res.json({success:false, message: "Account with this email already exists."});
							}
						} else{
							res.json({success:false, message: err});
						}						
					}				
				} else {
					//res.send("User Created");
					var token = jwt.sign({ fname: user.fname, lname: user.lname, username: user.username, email: user.email }, secret, {expiresIn: '24h'});
					res.json({success:true, message:'User Created successfully', token: token});
				}
			});
		}
	});

	router.post('/checkusername', function(req, res){
		User.findOne({ username: req.body.username }).select('username').exec(function(err, user){
			if(err) throw err;
			if(user){
				res.json({success: false, message: 'That Username is already taken.'});
			}else{
				res.json({success: true, message: 'Valid Username'})
			}

		});
	});

	router.post('/checkemail', function(req, res){
		User.findOne({ email: req.body.email }).select('email').exec(function(err, user){
			if(err) throw err;
			if(user){
				res.json({success: false, message: 'An account with this email already exists.'});
			}else{
				res.json({success: true, message: 'Valid Email'})
			}

		});
	});

	//USER LOGIN ROUTE
	//http://localhost:8080/api/authenticate
	router.post('/authenticate', function(req, res){
		User.findOne({ username: req.body.username }).select('fname lname email username password').exec(function(err, user){
			if(err) throw err;
			if(!user) {
				res.json({success:false, message:'Could not authenticate user'});
			}else if(user){
				if(req.body.password){
					var validPassword = user.comparePassword(req.body.password);
				}else{
					res.json({success:false, message:'No password provided'});
				}
				if(!validPassword){
					res.json({success:false, message:'Could not authenticate password'});
				}else{					
					//res.json({success:true, message:'User Authenticated!', token: user.fname});
					var token = jwt.sign({ fname: user.fname, lname: user.lname, username: user.username, email: user.email }, secret, {expiresIn: '24h'});
					res.json({success:true, message:'User Authenticated!', token: token});
				}
			}

		});
	});


	router.use(function(req, res, next){
		var token = req.body.token || req.body.query || req.headers['x-access-token'];
		if(token){
			jwt.verify(token, secret, function(err, decoded){
				if(err){
					res.json({ success:false, message:'Token Invalid' });		
				}else{
					req.decoded = decoded;
					next();
				}
			});
		}else{
			res.json({ success:false, message:'No token provided' });
		}
	});

	router.post('/me', function(req, res){
		res.send(req.decoded);
	});	
	return router;
}