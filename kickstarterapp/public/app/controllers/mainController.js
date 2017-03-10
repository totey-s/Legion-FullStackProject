var app = angular.module('mainController', ['authServices']);

app.controller('mainCtrl', function(Auth, $timeout, $location, $rootScope){
	var appData = this;

	appData.loadme = false;

	$rootScope.$on('$routeChangeStart', function(){	
		if(Auth.isLoggedIn()){
			console.log("Success: Logged In");
			appData.isLoggedIn = true;
			Auth.getUser().then(function(data){;
				//console.log(data);
				appData.username = data.data.username;
				appData.useremail = data.data.email;
				appData.fname = data.data.fname;
				appData.lname = data.data.lname;
				appData.loadme = true;
			});
		}else{
			appData.isLoggedIn = false;
			appData.username = '';
			appData.useremail = '';
			appData.fname = '';
			appData.lname = '';
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
				}, 2000);
				
			}else{
				appData.loading = false;
				//create error msg
				appData.errorMsg = data.data.message;
			}
		});
	};

	this.logout = function(){
		Auth.logout();
		$location.path('/logout');
		$timeout(function(){
			$location.path('/');
		}, 2000);
	}
});