var app = angular.module('managementController',[])

.controller('managementCtrl', function(User){
	var appData = this;
	
	appData.loading = true;
	appData.accessDenied = true;
	appData.errorMsg = false;
	appData.editAccess = false;
	appData.deleteAccess = false;
	appData.limit = 5;

	function getUsers(){
		User.getUsers().then(function(data){
			if(data.data.success){
				if(data.data.permission === 'admin' || data.data.permission === 'moderator'){
					appData.users = data.data.users;
					appData.loading = false;
					appData.accessDenied = false;
					appData.curUser = data.data.curUser;
					if(data.data.permission === 'admin'){
						appData.editAccess = true;
						appData.deleteAccess = true;
					}else if(data.data.permission === 'moderator'){
						appData.editAccess = true;
					}
				} else {					
					appData.errorMsg = "Insufficient Privileges";
					appData.loading = false;		
				}
			}else{
				appData.errorMsg = data.data.message;
				appData.loading = false;
			}
		});
	}

	getUsers();

	appData.showMore = function(number){
		appData.showMoreError = false;
		if(number>0){
			appData.limit = number;
		}else{
			appData.showMoreError = 'Please enter a valid number';
		}
	};

	appData.showAll = function(){
		appData.limit = undefined;
		appData.showMoreError = false;
	};

	appData.deleteUser = function(username){
		User.deleteUser(username).then(function(data){
			if(data.data.success){
				getUsers();
			}else{
				app.showMoreError = data.data.message;
			}
		});
	}

})

.controller('editCtrl', function($scope, $routeParams, User, $timeout){
	var app = this;
	$scope.nameTab = 'active';
	app.phase1 = true;

	User.getUser($routeParams.id).then(function(data){
		console.log(data);
		if(data.data.success){
			$scope.newfname = data.data.user.firstname;
			$scope.newlname = data.data.user.lastname;
			$scope.newUsername = data.data.user.username;
			$scope.newEmail = data.data.user.email;
			$scope.newPermission = data.data.user.permission;
			app.currentUser = data.data.user.id;
		}else{
			app.errorMsg = data.data.message;
		}
	});	

	app.fnamePhase = function(){
		$scope.nameTab = 'active';
		$scope.usernameTab = 'default';
		$scope.emailTab = 'default';
		$scope.permissionTab = 'default';
		
		app.phase1 = true;
		app.phase2 = false;
		app.phase3 = false;
		app.phase4 = false;
	};
	app.usernamePhase = function(){
		$scope.nameTab = 'default';
		$scope.usernameTab = 'active';
		$scope.emailTab = 'default';
		$scope.permissionTab = 'default';
		
		app.phase1 = false;
		app.phase2 = true;
		app.phase3 = false;
		app.phase4 = false;
	};
	app.emailPhase = function(){
		$scope.nameTab = 'default';
		$scope.usernameTab = 'default';
		$scope.emailTab = 'active';
		$scope.permissionTab = 'default';
		
		app.phase1 = false;
		app.phase2 = false;
		app.phase3 = true;
		app.phase4 = false;
	};
	app.permissionPhase = function(){
		$scope.nameTab = 'default';
		$scope.usernameTab = 'default';
		$scope.emailTab = 'default';
		$scope.permissionTab = 'active';
		
		app.phase1 = false;
		app.phase2 = false;
		app.phase3 = false;
		app.phase4 = true;
	};

	app.updateName = function(newfname, newlname, valid){
		console.log("Update Name: "+newfname+" "+newlname+" "+valid);
		app.errorMsg = false;
		app.disabled = true;
		var userObject = {};		

		if(valid){
			userObject._id = app.currentUser;
			userObject.fname = $scope.newfname;
			userObject.lname = $scope.newlname;
			User.editUser(userObject).then(function(data){
				if(data.data.success){
					app.successMsg = data.data.message;					
					$timeout(function(){
						app.nameForm.fname.$setPristine();
						app.nameForm.fname.$setUntouched();
						app.nameForm.lname.$setPristine();
						app.nameForm.lname.$setUntouched();
						app.successMsg = false;
						app.disabled = false;
					}, 2000);
					app.disabled = false;
				}else{
					app.errorMsg = data.data.message;
					app.disabled = false;
				}
			});
		}else{
			app.errorMsg = "Please enter a valid name";
			app.disabled = false;
		}
	};

	app.updateUsername = function(newUsername, valid) {
        app.errorMsg = false; // Clear any error message
        app.disabled = true; // Lock form while processing
        // Check if username submitted is valid
        if (valid) {
            var userObject = {}; // Create the user object to pass to function
            userObject._id = app.currentUser; // Pass current user _id in order to edit
            userObject.username = $scope.newUsername; // Set the new username provided
            // Runs function to update the user's username
            User.editUser(userObject).then(function(data) {
                // Check if able to edit user
                if (data.data.success) {
                    $scope.alert = 'alert alert-success'; // Set class for message
                    app.successMsg = data.data.message; // Set success message
                    // Function: After two seconds, clear and re-enable
                    $timeout(function() {
                        app.usernameForm.username.$setPristine(); // Reset username form
                        app.usernameForm.username.$setUntouched(); // Reset username form
                        app.successMsg = false; // Clear success message
                        app.disabled = false; // Enable form for editing
                    }, 2000);
                    app.disabled = false;
                } else {
                    app.errorMsg = data.data.message; // Set error message
                    app.disabled = false; // Enable form for editing
                }
            });
        } else {
            app.errorMsg = 'Please ensure form is filled out properly'; // Set error message
            app.disabled = false; // Enable form for editing
        }
    };

	app.updateEmail = function(newEmail, valid){
		app.errorMsg = false;
		app.disabled = true;
		var userObject = {};

		if(valid){
			userObject._id = app.currentUser;
			userObject.email = $scope.newEmail;
			
			User.editUser(userObject).then(function(data){
				if(data.data.success){
					app.successMsg = data.data.message;
					$timeout(function(){
						app.emailForm.email.$setPristine();
						app.emailForm.email.$setUntouched();
						app.successMsg = false;
						app.disabled = false;
					}, 2000);
					app.disabled = false;
				}else{
					app.errorMsg = data.data.message;
					app.disabled = false;
				}
			});
		}else{
			app.errorMsg = "Please enter a valid Email";
			app.disabled = false;
		}
	};

	app.updatePermissions = function(newPermission) {
        app.errorMsg = false; // Clear any error messages
        app.disableUser = true; // Disable button while processing
        app.disableModerator = true; // Disable button while processing
        app.disableAdmin = true; // Disable button while processing
        var userObject = {}; // Create the user object to pass to function
        userObject._id = app.currentUser; // Get the user _id in order to edit
        userObject.permission = newPermission; // Set the new permission to the user
        // Runs function to udate the user's permission
        User.editUser(userObject).then(function(data) {
            // Check if was able to edit user
            if (data.data.success) {
                $scope.alert = 'alert alert-success'; // Set class for message
                app.successMsg = data.data.message; // Set success message
                // Function: After two seconds, clear and re-enable
                $timeout(function() {
                    app.successMsg = false; // Set success message
                    $scope.newPermission = newPermission; // Set the current permission variable
                    // Check which permission was assigned to the user
                    if (newPermission === 'user') {
                        app.disableUser = true; // Lock the 'user' button
                        app.disableModerator = false; // Unlock the 'moderator' button
                        app.disableAdmin = false; // Unlock the 'admin' button
                    } else if (newPermission === 'moderator') {
                        app.disableModerator = true; // Lock the 'moderator' button
                        app.disableUser = false; // Unlock the 'user' button
                        app.disableAdmin = false; // Unlock the 'admin' button
                    } else if (newPermission === 'admin') {
                        app.disableAdmin = true; // Lock the 'admin' buton
                        app.disableModerator = false; // Unlock the 'moderator' button
                        app.disableUser = false; // unlock the 'user' button
                    }
                }, 2000);
            } else {
                $scope.alert = 'alert alert-danger'; // Set class for message
                app.errorMsg = data.data.message; // Set error message
                app.disabled = false; // Enable form for editing
            }
        });
    };
});