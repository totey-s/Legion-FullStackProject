var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'kickstarter';
var bcrypt = require('bcrypt-nodejs');

//-------------------------------------MySQL Connection---------------------------------------------
var Sequelize = require('sequelize');
var mysql = require('mysql');

var sequelize = new Sequelize('legion', 'root', 'root', {
  host: "localhost",
  port: 3306
});

sequelize.authenticate().then(function(err){
	if(err){
		console.log('Unable to connect to the database:', err);
	}else{
		console.log('Connection has been established successfully.');
	}
});

var UserTable = sequelize.define('user', {
	id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
  	firstname: Sequelize.STRING,
  	lastname:	Sequelize.STRING,
  	email: Sequelize.STRING,
  	password:	Sequelize.STRING,	  
  	username: Sequelize.STRING,
  	permission: {type: Sequelize.STRING, allowNull: false, defaultValue: 'user'},
  	active: {type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true}
});
//---------------------------------------------------------------------------------------------------

module.exports = function(router){
	//http://localhost:8080/users
	//USER REGISTRATION ROUTE
	router.post('/users', function(req, res){	
		var user = new User();
		console.log(req.body);
		user.username = req.body.username;
		user.password = req.body.password;
		bcrypt.hash(user.password, null, null, function(err, hash){
		    if(err) console.log(err);
		    user.password = hash;		
		    console.log("Encrypted Pass: "+hash);		    
		    console.log("Encrypted Pass: "+user.password);
		  });
		user.email = req.body.email;
		user.fname = req.body.fname;
		user.lname = req.body.lname;
		if(req.body.username==null || req.body.username=='' || req.body.password==null || req.body.password=='' || 
			req.body.email==null || req.body.email=='' || req.body.fname==null || req.body.fname==''){
			//res.send("NO Data provided");
			res.json({success:false, message: 'No Data provided'});
		}else{
			//-----------------Save in MongoDB---------------------------------------------------------------------
			/*user.save(function(err){
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
					var token = jwt.sign({ fname: user.fname, lname: user.lname, username: user.username, email: user.email, active: user.active}, secret, {expiresIn: '24h'});
					res.json({success:true, message:'User Created successfully', token: token});
				}
			});*/
			//-----------------------------------------------------------------------------------------------------------------------------
			
			//-------------------Save in MySQL---------------------------------------------------------------------------------------------			
			sequelize.sync().then(function() {				
			  return UserTable.create({			  	
			    firstname: user.fname,
			 	lastname:	user.lname,
			  	email: user.email,
			  	password: user.password,	  
			  	username: user.username
			  });
			}).then(function(record) {
			  console.log(record.get({
			    plain: true
			  }));
			  var token = jwt.sign({ fname: user.fname, lname: user.lname, username: user.username, email: user.email, active: user.active}, secret, {expiresIn: '24h'});
			  res.json({success:true, message:'User Created successfully', token: token});
			});
			//-----------------------------------------------------------------------------------------------------------------------------
		}
	});

	router.post('/checkusername', function(req, res){
		//--------------------------MySQL------------------------------------------------------------
		UserTable.find({
		  where: {username: req.body.username},
		  attributes: ['username']
		}).then(function(userData){
			if(userData){
				res.json({success: false, message: 'That Username is already taken.'});
			}else{
				res.json({success: true, message: 'Valid Username'})
			}
		});
		//-------------------------------------------------------------------------------------------
		//--------------------------MongoDB----------------------------------------------------------
		/*User.findOne({ username: req.body.username }).select('username').exec(function(err, user){
			if(err) throw err;
			if(user){
				res.json({success: false, message: 'That Username is already taken.'});
			}else{
				res.json({success: true, message: 'Valid Username'})
			}

		});*/
		//---------------------------------------------------------------------------------------------
	});

	router.post('/checkemail', function(req, res){
		//--------------------------MySQL------------------------------------------------------------
		UserTable.find({
		  where: {email: req.body.email},
		  attributes: ['email']
		}).then(function(userData){
			if(userData){
				res.json({success: false, message: 'An account with this email already exists.'});
			}else{
				res.json({success: true, message: 'Valid Username'})
			}
		});
		//-------------------------------------------------------------------------------------------
		//--------------------------MongoDB----------------------------------------------------------
		/*User.findOne({ email: req.body.email }).select('email').exec(function(err, user){
			if(err) throw err;
			if(user){
				res.json({success: false, message: 'An account with this email already exists.'});
			}else{
				res.json({success: true, message: 'Valid Email'})
			}

		});*/
		//----------------------------------------------------------------------------------------------
	});

	//USER LOGIN ROUTE
	//http://localhost:8080/api/authenticate
	router.post('/authenticate', function(req, res){
		console.log("Authenticating....")
		//-----------------Find in MongoDB---------------------------------------------------------------------
		/*
		User.findOne({ username: req.body.username }).select('fname lname email username password permission active').exec(function(err, user){
			if(err) throw err;
			if(!user) {
				res.json({success:false, message:'Could not authenticate user'});
			}else if(user){
				if(req.body.password){
					var validPassword = user.comparePassword(req.body.password);
				}else{
					res.json({success:false, message:'No password provided'});
				}
				if(!user.active){
					res.json({success:false, message:'Account is no longer active.'});
				}				
				if(!validPassword){
					res.json({success:false, message:'Could not authenticate password'});
				}else{					
					//res.json({success:true, message:'User Authenticated!', token: user.fname});
					var token = jwt.sign({ fname: user.fname, lname: user.lname, username: user.username, email: user.email, permission: user.permission, active: user.active }, secret, {expiresIn: '24h'});
					res.json({success:true, message:'User Authenticated!', token: token});
				}
			}

		});
		*/
		//----------------------------------------------------------------------------------------------------
		
		//-----------------Find in MySQL----------------------------------------------------------------------
		UserTable.find({
		  where: {username: req.body.username, active: true}
		}).then(function(userData) {
			//console.log(userData.dataValues);
			//console.log("Password: "+userData.dataValues.password);
			if(userData){
				bcrypt.compare(req.body.password, userData.dataValues.password, function(err, match) {
				    //console.log(match);
				    if(!match){
						res.json({success:false, message:'Could not authenticate password'});
					}
					else
					{
						var token = jwt.sign({ fname: userData.dataValues.firstname, lname: userData.dataValues.lastname, username: userData.dataValues.username, 
							email: userData.dataValues.email, permission: userData.dataValues.permission, active: userData.dataValues.active }, 
							secret, {expiresIn: '24h'});
						//console.log(token);
						res.json({success:true, message:'User Authenticated!', token: token});
					}
				});
			} else{
				res.json({success:false, message:'Incorrect Username or Password.'});
			}
			
		}).catch(function(err){
			if(err) throw err;
		});		
		//----------------------------------------------------------------------------------------------------
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

	router.get('/renewToken/:username', function(req, res){
		UserTable.find({
		  where: {username: req.params.username, active: true}
		}).then(function(userData) {
			if(!userData){
				res.json({ success: false, message: 'No user was found' });
			} else{
				var newtoken = jwt.sign({ fname: userData.dataValues.firstname, lname: userData.dataValues.lastname, username: userData.dataValues.username,
					email: userData.dataValues.email, permission: userData.dataValues.permission, active: userData.dataValues.active }, 
					secret, {expiresIn: '24h'});
				//console.log(token);
				res.json({success:true, token: newtoken});
			}
		});
	});

	router.get('/permission', function(req, res){
		//------------------MySQL--------------------------------------------------
		UserTable.find({
		  where: {username: req.decoded.username, active: true}
		}).then(function(userData) {
			if(!userData){
				res.json({ success: false, message: 'No user was found' });
			} else{
				res.json({ success: true, permission: userData.permission});
			}
		});
		//---------------------------------------------------------------------------
		//--------------------MongoDB------------------------------------------------
		/*
		User.findOne({ username: req.decoded.username }, function(err, user){
			if(err) throw err;
			if(!user){
				res.json({ success: false, message: 'No user was found' });
			} else{
				res.json({ success: true, permission: user.permission});
			}
		});
		*/
		//----------------------------------------------------------------------------
	});

	router.get('/management', function(req, res){	
		console.log("Current Permission: "+req.decoded.permission);
		//-------------------------MySQL---------------------------------------------------------------
		if(req.decoded.permission == 'admin' || req.decoded.permission == 'moderator'){
			UserTable.findAll().then(function(users) {
				
					if(!users){
						//console.log("No Users");
						res.json({ success: false, message: 'No users was found' });
					} else{
						//console.log("Users found");
						res.json({success: true, users: users, permission: req.decoded.permission, curUser: req.decoded.username});
					}				
			});
		}else{
				res.json({success: false, message: 'Insufficient Privileges'});
			}
		//---------------------------------------------------------------------------------------------
		//-------------------------MongoDB-------------------------------------------------------------
		/*User.find({}, function(err, users){
			if(err) throw err;	
			User.findOne({username: req.decoded.username}, function(err, mainUser){
				if(err) throw err;
				if(!mainUser){
					res.json({success: false, message: 'No User Found.'});
				}else{
					if(mainUser.permission == 'admin' || mainUser.permission == 'moderator'){
						if(!users){
							res.json({success: false, message: 'No users found'});		
						}else{
							res.json({success: true, users: users, permission: mainUser.permission});		
						}
					}else{
						res.json({success: false, message: 'Insufficient Privileges'});	
					}
				}
			});
		});*/
		//---------------------------------------------------------------------------------------------------------
	});

	router.delete('/management/:username', function(req, res){
		var deletedUser = req.params.username;
		//-------------------------MySQL---------------------------------------------------------------
		UserTable.find({
		  where: {username: deletedUser, active: true}
		}).then(function(userData){
			if(userData){
				userData.updateAttributes({
					active:false
				}).then(function(){
					res.json({success: true});
				});
			}
		});
		//---------------------------------------------------------------------------------------------
		//-------------------------MongoDB-------------------------------------------------------------
		/*User.findOne({ username: deletedUser }, function(err, mainUser){
			if(err) throw err;
			if(!mainUser){
				res.json({success: false, message: 'No users found'});
			}else{
				if(mainUser.permission !== 'admin'){
					res.json({success: false, message: 'Insufficient Privileges'});
				}else{
					User.findOneAndRemove({ username: deletedUser }, function(err, user){
						if(err) throw err;
						res.json({success: true});		
					});
				}
			}
		});*/
		//---------------------------------------------------------------------------------------------
	});

	router.get('/edit/:id', function(req, res){
		var editUser = req.params.id;
		var permission =  req.decoded.permission;
		//-------------------------MySQL---------------------------------------------------------------
		if(permission === 'admin' || permission === 'moderator'){
			UserTable.find({
			  where: {id: editUser}
			}).then(function(userData) {
				if(!userData){
					res.json({ success: false, message: 'No user was found' });
				} else{
					console.log(userData.dataValues);
					res.json({ success: true, user: userData.dataValues});
				}
			});
		}else{
			res.json({success: false, message: 'Insufficient Privileges'});	
		}		
		//---------------------------------------------------------------------------------------------

		//-------------------------MongoDB-------------------------------------------------------------
		/*User.findOne({ username: req.decoded.username }, function(err, mainUser){
			if(err) throw err;
			if(!mainUser){
				res.json({success: false, message: 'No User found'});
			}else{
				if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
					User.findOne({ _id: editUser}, function(err, user){
						if(err) throw err;
						if(!user){
							res.json({success: false, message: 'No User found'});			
						}else{
							res.json({success: true, user: user});
						}
					});
				}else{
					res.json({success: false, message: 'Insufficient Privileges'});	
				}
			}
		});*/
		//---------------------------------------------------------------------------------------------
	});

	 router.put('/edit', function(req, res) {
	 	console.log("In '/edit'");
	 	var editUser = req.body._id;
	 	var permission =  req.decoded.permission;
	 	console.log(req.decoded.username+" : "+permission)
	 	//console.log(req.body._id+" "+req.body.fname);
	 	if(req.body.fname) var newfname = req.body.fname;
	 	if(req.body.lname) var newlname = req.body.lname;
		if(req.body.username) var newUsername = req.body.username;	 	
		if(req.body.email) var newEmail = req.body.email;	 
		if (req.body.permission) var newPermission = req.body.permission; 
		//-------------------------MySQL---------------------------------------------------------------
		if(newfname || newlname){
			if(permission === 'admin' || permission === 'moderator'){
				UserTable.find({
				  where: {id: editUser}
				}).then(function(userData){
					if(userData){
						userData.updateAttributes({
							firstname:newfname, 
							lastname:newlname
						}).then(function(){
							res.json({success:true, message: "Name has been updated"});
						}).catch(function(err){
							if(err) throw err;
						});
					}
				}).catch(function(err){
					if(err) throw err;
				});
			}else{				
				res.json({success: false, message: 'Insufficient Privileges'});	
			}
		}
		if(newUsername){
			if(permission === 'admin' || permission === 'moderator'){
				UserTable.find({
				  where: {id: editUser}
				}).then(function(userData){
					if(userData){
						userData.updateAttributes({
							username:newUsername
						}).then(function(){
							res.json({success:true, message: "Username has been updated"});
						}).catch(function(err){
							if(err) throw err;
						});
					}
				}).catch(function(err){
					if(err) throw err;
				});
			}else{				
				res.json({success: false, message: 'Insufficient Privileges'});	
			}
		}
		if(newEmail){
			console.log("In newEmail");
			if(permission === 'admin' || permission === 'moderator'){
				console.log("in If for admin or moderator");
				UserTable.find({
				  where: {id: editUser}
				}).then(function(userData){
					if(userData){
						userData.updateAttributes({
							email:newEmail
						});
						return res.json({success:true, message: "Email has been updated"});						
					}else{
						return res.json({ success: false, message: 'No user found' }); // Return error
					}
				});
			}else{				
				res.json({success: false, message: 'Insufficient Privileges'});	
			}
		}
		if(newPermission){
			console.log("In Permissions");
			if(permission === 'admin' || permission === 'moderator'){
				UserTable.find({
				  where: {id: editUser}
				}).then(function(userData){
					//console.log(userData);
					if(userData){
						// Check if attempting to set the 'user' permission
                        if (newPermission === 'user') {
                            // Check the current permission is an admin
                            if (userData.permission === 'admin') {
                                // Check if user making changes has access
                                if (permission !== 'admin') {
                                    res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade an admin.' }); // Return error
                                } else {
                                    //user.permission = newPermission; // Assign new permission to user
                                    // Save changes
                                    userData.updateAttributes({
										permission:newPermission
									}).then(function(){
										res.json({success:true, message: "Permissions have been updated"});
									}).catch(function(err){
										if(err) throw err;
									}); 
                                }
                            } else {
                                //user.permission = newPermission; // Assign new permission to user
                                // Save changes
                                userData.updateAttributes({
									permission:newPermission
								}).then(function(){
									res.json({success:true, message: "Permissions have been updated"});
								}).catch(function(err){
									if(err) throw err;
								});                                
                            }
                        }
                        // Check if attempting to set the 'moderator' permission
                        if (newPermission === 'moderator') {
                            // Check if the current permission is 'admin'
                            if (userData.permission === 'admin') {
                                // Check if user making changes has access
                                if (permission !== 'admin') {
                                    res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade another admin' }); // Return error
                                } else {
                                    //user.permission = newPermission; // Assign new permission
                                    // Save changes
                                    userData.updateAttributes({
										permission:newPermission
									}).then(function(){
										res.json({success:true, message: "Permissions have been updated"});
									}).catch(function(err){
										if(err) throw err;
									});                                   
                                }
                            } else {
                                //user.permission = newPermission; // Assign new permssion
                                // Save changes
                                userData.updateAttributes({
									permission:newPermission
								}).then(function(){
									res.json({success:true, message: "Permissions have been updated"});
								}).catch(function(err){
									if(err) throw err;
								});
                            }
                        }
                        // Check if assigning the 'admin' permission
                        if (newPermission === 'admin') {
                            // Check if logged in user has access
                            if (permission === 'admin') {                                
                                // Save changes
                                userData.updateAttributes({
									permission:newPermission
								}).then(function(){
									res.json({success:true, message: "Permissions have been updated"});
								}).catch(function(err){
									if(err) throw err;
								});
                            } else {
                                res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to upgrade someone to the admin level' }); // Return error
                            }
                        }
					}else{
						res.json({ success: false, message: 'No user found' }); // Return error
					}
				}).catch(function(err){
					if(err) throw err;
				});
			}else{							
				res.json({success: false, message: 'Insufficient Privileges'});	
			}
		}
		//---------------------------------------------------------------------------------------------

		//-------------------------MongoDB-------------------------------------------------------------
		/*User.findOne({ username: req.decoded.username }, function(err, mainUser){
			if(err) throw err;
				if(!mainUser){
					//res.json({success: false, message: 'No User found'});
				}else{
					if(newfname || newlname){
						if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
						User.findOneAndUpdate({_id: editUser}, {$set:{fname:newfname, lname:newlname}}, {new: true}, function(err){
							if(err){
								console.log(err);
							}else{
								res.json({success:true, message: "Name has been updated"});
							}
						});

						}else{
							res.json({success: false, message: 'Insufficient Privileges'});	
						}
					}
					if (newUsername) {
                        // Check if person making changes has appropriate access
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            // Look for user in database
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {                                    
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if user is in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        //user.username = newUsername; // Save new username to user in database
                                        // Save changes
                                        user.update({$set:{username:newUsername}}, {new: true}, function(err) {
                                            if (err) {
                                                console.log(err); // Log error to console
                                            } else {
                                                res.json({ success: true, message: 'Username has been updated' }); // Return success
                                            }
                                        });
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
					if(newEmail){
						if(mainUser.permission === 'admin' || mainUser.permission === 'moderator'){
						User.findOneAndUpdate({_id: editUser}, {$set:{email:newEmail}}, {new: true}, function(err){
							if(err){
								console.log(err);
							}else{
								res.json({success:true, message: "Email has been updated"});
							}
						});

						}else{
							res.json({success: false, message: 'Insufficient Privileges'});	
						}
					}
					if (newPermission) {
                        // Check if user making changes has appropriate access
                        if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                            // Look for user to edit in database
                            User.findOne({ _id: editUser }, function(err, user) {
                                if (err) {
                                    // Create an e-mail object that contains the error. Set to automatically send it to myself for troubleshooting.                                    
                                    res.json({ success: false, message: 'Something went wrong. This error has been logged and will be addressed by our staff. We apologize for this inconvenience!' });
                                } else {
                                    // Check if user is found in database
                                    if (!user) {
                                        res.json({ success: false, message: 'No user found' }); // Return error
                                    } else {
                                        // Check if attempting to set the 'user' permission
                                        if (newPermission === 'user') {
                                            // Check the current permission is an admin
                                            if (user.permission === 'admin') {
                                                // Check if user making changes has access
                                                if (mainUser.permission !== 'admin') {
                                                    res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade an admin.' }); // Return error
                                                } else {
                                                    //user.permission = newPermission; // Assign new permission to user
                                                    // Save changes
                                                    user.update({$set:{permission:newPermission}}, {new: true}, function(err) {
                                                        if (err) {
                                                            console.log(err); // Long error to console
                                                        } else {
                                                            res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                        }
                                                    });
                                                }
                                            } else {
                                                //user.permission = newPermission; // Assign new permission to user
                                                // Save changes
                                                user.update({$set:{permission:newPermission}}, {new: true}, function(err) {
                                                    if (err) {
                                                        console.log(err); // Log error to console
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                    }
                                                });
                                            }
                                        }
                                        // Check if attempting to set the 'moderator' permission
                                        if (newPermission === 'moderator') {
                                            // Check if the current permission is 'admin'
                                            if (user.permission === 'admin') {
                                                // Check if user making changes has access
                                                if (mainUser.permission !== 'admin') {
                                                    res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to downgrade another admin' }); // Return error
                                                } else {
                                                    //user.permission = newPermission; // Assign new permission
                                                    // Save changes
                                                    user.update({$set:{permission:newPermission}}, {new: true}, function(err) {
                                                        if (err) {
                                                            console.log(err); // Log error to console
                                                        } else {
                                                            res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                        }
                                                    });
                                                }
                                            } else {
                                                //user.permission = newPermission; // Assign new permssion
                                                // Save changes
                                                user.update({$set:{permission:newPermission}}, {new: true}, function(err) {
                                                    if (err) {
                                                        console.log(err); // Log error to console
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                    }
                                                });
                                            }
                                        }

                                        // Check if assigning the 'admin' permission
                                        if (newPermission === 'admin') {
                                            // Check if logged in user has access
                                            if (mainUser.permission === 'admin') {
                                                user.permission = newPermission; // Assign new permission
                                                // Save changes
                                                user.update({$set:{permission:newPermission}}, {new: true}, function(err) {
                                                    if (err) {
                                                        console.log(err); // Log error to console
                                                    } else {
                                                        res.json({ success: true, message: 'Permissions have been updated!' }); // Return success
                                                    }
                                                });
                                            } else {
                                                res.json({ success: false, message: 'Insufficient Permissions. You must be an admin to upgrade someone to the admin level' }); // Return error
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            res.json({ success: false, message: 'Insufficient Permissions' }); // Return error
                        }
                    }
				}
		});	*/
		//------------------------------------------------------------------------------------------------------------------------	
	 });


	return router;
}