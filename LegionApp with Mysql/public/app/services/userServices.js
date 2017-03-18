var app = angular.module('userServices',[]);

app.factory('User', function($http, AuthToken){
	var userFactory = {};

//	User.create(regData);
	userFactory.create = function(regData){
		return $http.post('/api/users', regData).then(function(data){
			AuthToken.setToken(data.data.token);
			return data;
		});
	};

	//User.checkUsername(regData)
	userFactory.checkUsername = function(regData){
		return $http.post('/api/checkusername', regData);
	};

	//User.checkEmail(regData)
	userFactory.checkEmail = function(regData){
		return $http.post('/api/checkemail', regData);
	};

	userFactory.getPermission = function(){
		return $http.get('/api/permission');
	};

	userFactory.getUsers = function(){
		return $http.get('/api/management');
	};

	userFactory.getUser = function(id){
		return $http.get('/api/edit/'+id);
	};

	userFactory.deleteUser = function(username){
		return $http.delete('/api/management/'+username);
	};

	userFactory.editUser = function(id){
		console.log("services: "+id);
		return $http.put('/api/edit', id);
	};

	userFactory.renewSession = function(username){
		return $http.get('/api/renewToken/'+username);
	};

	return userFactory;
});