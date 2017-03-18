var app = angular.module('mainController', ['authServices', 'userServices']);

app.controller('mainCtrl', function(Auth, $timeout, $location, $rootScope, User, $interval, $window, $route, AuthToken){
	var appData = this;	
	appData.loadme = false;

	appData.checkSession = function(){
		if(Auth.isLoggedIn()){
			appData.checkingSession = true;
			var interval = $interval(function(){
				var token = $window.localStorage.getItem('token');
				if(token === null){
					$interval.cancel(interval);
				}else{
					self.parseJwt = function(token){
						var base64Url = token.split('.')[1];
						var base64 = base64Url.replace('-', '+').replace('_', '/');
						return JSON.parse($window.atob(base64));
					}
					var expiredTime = self.parseJwt(token);
					var timestamp = Math.floor(Date.now()/1000);
					//console.log(expiredTime.exp);
					//console.log(timestamp);
					var timecheck = expiredTime.exp - timestamp;
					//console.log("timecheck: "+timecheck);
					if(timecheck<=25){
						showModal(1);
						$interval.cancel(interval);
					}
				}

			}, 2000);
		}
	};

	appData.checkSession();

	var showModal = function(option){
		appData.choice = false;
		appData.modalHeader = undefined;
		appData.modalBody = undefined;
		appData.hideButton = false;

		if(option === 1){
			appData.modalHeader = "Timeout Warning";
			appData.modalBody = "Your session will expire in 5 minutes. Would you like to renew it?";
			$("#myModal").modal({backdrop: "static"});
			
		}else if(option === 2){
			//logout portion
			appData.hideButton = true;
			appData.modalHeader = "Logging Out";			
			$("#myModal").modal({backdrop: "static"});
			$timeout(function(){
				Auth.logout();
				$location.path('/logout');
				hideModal();
				$route.reload();
			}, 2000);
		}
		$timeout(function(){
			if(!appData.choice){
				hideModal();
			}
		}, 4000);
		
	}

	var hideModal = function(){
		$("#myModal").modal("hide");
	};

	appData.renewSession = function(){
		appData.choice = true;
		User.renewSession(appData.username).then(function(data){
			if(data.data.success){
				AuthToken.setToken(data.data.token);
				appData.checkSession();
			}else{
				appData.modalBody = data.data.message;
			}
		});
		hideModal();
	};

	appData.endSession = function(){
		appData.choice = true;
		hideModal();	
		$timeout(function(){
			showModal(2);
		}, 1000);
	};

	$rootScope.$on('$routeChangeStart', function(){	
		if(!appData.checkingSession){
			appData.checkSession();
		}

		if(Auth.isLoggedIn()){
			console.log("Success: Logged In");
			appData.currentPath = $location.path();
			console.log("Location: "+appData.currentPath);
			appData.isLoggedIn = true;
			Auth.getUser().then(function(data){
				//console.log(data);
				appData.username = data.data.username;
				appData.useremail = data.data.email;
				appData.fname = data.data.fname;
				appData.lname = data.data.lname;
				if(data.data.active){
					appData.active = 'active';	
				}
				
				//console.log("Permission: "+data.data.permission);
				User.getPermission().then(function(data){
					if(data.data.permission === 'admin' || data.data.permission === 'moderator'){
						appData.authored = true;
						appData.loadme = true;
					}else{
						appData.loadme = true;
					}
				});				
			});
		}else{
			appData.authored = false;
			appData.isLoggedIn = false;
			appData.username = {};
			appData.useremail = {};
			appData.fname = {};
			appData.lname = {};
			appData.active = false;
			appData.loadme = true;
		}
	});



	appData.doLogin = function(loginData){
		appData.loading = true;
		appData.errorMsg = false;
		
		Auth.login(appData.loginData).then(function(data){
			if(data.data.success){
				appData.loading = false;
				//CReate Success msg
				appData.successMsg = data.data.message + '...Redirecting to Home';
				//redirect to home page
				$timeout(function() {
					$location.path('/');	
					appData.loginData = '';
					appData.successMsg = false;
					appData.checkSession();
				}, 2000);
				
			}else{
				appData.loading = false;
				//create error msg
				appData.errorMsg = data.data.message;
			}
		});
	};

	appData.logout = function(){
		showModal(2);
		//Auth.logout();
		//$location.path('/logout');
		/*
		$timeout(function(){
			$location.path('/');
		}, 2000);
		*/
	}
});

app.controller('page1Ctrl', function($scope, $routeParams) {
     $scope.sub = $routeParams.sub;
});