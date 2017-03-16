var app = angular.module('mainController', ['authServices']);

app.controller('mainCtrl', function(Auth, $timeout, $location, $rootScope, User){
	var appData = this;	
	appData.loadme = false;

	$rootScope.$on('$routeChangeStart', function(){	
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
			appData.username = '';
			appData.useremail = '';
			appData.fname = '';
			appData.lname = '';
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

app.controller('page1Ctrl', function($scope, $routeParams) {
     $scope.sub = $routeParams.sub;
});