var app = angular.module('userServices',[]);

app.factory('User', function($http, AuthToken){
	var userFactory = {};

//	User.create(regData);
	userFactory.create = function(regData){
		return $http.post('/api/users', regData).then(function(data){
			AuthToken.setToken(data.data.token);
			return data;
		});
	}

	//User.checkUsername(regData)
	userFactory.checkUsername = function(regData){
		return $http.post('/api/checkusername', regData);
	}

	//User.checkEmail(regData)
	userFactory.checkEmail = function(regData){
		return $http.post('/api/checkemail', regData);
	}

	return userFactory;
});