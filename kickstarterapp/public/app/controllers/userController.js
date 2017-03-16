var app = angular.module('userControllers',['userServices']);

app.controller('registerController', function($http, $location, $timeout, User){

	var appData = this;

	appData.regUser = function(regData, valid){
		appData.loading = true;
		appData.errorMsg = false;
		if(valid){
			console.log(appData.regData);
			User.create(appData.regData).then(function(data){
				if(data.data.success){
					appData.loading = false;
					//CReate Success msg
					appData.successMsg = data.data.message + '...Redirecting to Home';
					//redirect to home page
					$timeout(function() {
						$location.path('/');	
					}, 2000);
					
				}else{
					appData.loading = false;
					//create error msg
					appData.errorMsg = data.data.message;
				}
			});
		}else{
			appData.loading = false;
			//create error msg
			appData.errorMsg = "Please ensure form is filled properly.";
		}

	};

	this.checkUsername = function(regData){
		appData.checkingUsername = true;
		appData.usernameMsg = false;
		appData.usernameInvalid = false;
		User.checkUsername(appData.regData).then(function(data){
			//console.log(data);
			if(data.data.success){
				appData.checkingUsername = false;
				appData.usernameInvalid = false;
				appData.usernameMsg = data.data.message;
			}else{
				appData.checkingUsername = false;
				appData.usernameInvalid = true;
				appData.usernameMsg = data.data.message;
			}
		});
	}

	this.checkEmail = function(regData){
		appData.checkingEmail = true;
		appData.emailMsg = false;
		appData.emailInvalid = false;
		User.checkEmail(appData.regData).then(function(data){
			if(data.data.success){
				appData.checkingEmail = false;
				appData.emailInvalid = false;
				appData.emailMsg = data.data.message;
			}else{
				appData.checkingEmail = false;
				appData.emailInvalid = true;
				appData.emailMsg = data.data.message;
			}
		});
	}
//User.checkEmail(appData.regData);
});

app.directive('match', function() {
  return {
  	restrict: 'A',
    controller: function($scope){
    	$scope.confirmed = false;
    	$scope.doConfirm = function(values){
    		values.forEach(function(ele){
    			if($scope.confirm == ele){
    				$scope.confirmed = true;
    			}else{
    				$scope.confirmed = false;
    			}
    		});
    	}
    },    
    link: function(scope, element, attrs){
    	attrs.$observe('match', function(){
    		scope.matches = JSON.parse(attrs.match);
    		scope.doConfirm(scope.matches);
    	});

    	scope.$watch('confirm', function(){
    		scope.matches = JSON.parse(attrs.match);
    		scope.doConfirm(scope.matches);
    	});
    }
  };
});