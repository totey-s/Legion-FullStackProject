var app = angular.module('appRoutes',['ngRoute']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
	
	$locationProvider.html5Mode(true);

	//"authenticated: false" for all facebook, twitter and google logins
	$routeProvider
	.when('/', {
		templateUrl:'app/views/pages/home.html'
	})
	.when('/about',{
		templateUrl:'app/views/pages/about.html'	
	})
	.when('/register',{
		templateUrl:'app/views/pages/users/register.html',
		controller: 'registerController',
		controllerAs: 'register',
		authenticated: false
	})
	.when('/login',{
		templateUrl:'app/views/pages/users/login.html',
		authenticated: false
	})
	.when('/logout',{
		templateUrl:'app/views/pages/users/logout.html',
		authenticated: true
	})
	.when('/profile', {
		templateUrl:'app/views/pages/users/profile.html',
		authenticated: true	
	})
	.when('/profile/yourprojects', {
		templateUrl:'app/views/pages/users/yourprojects.html',
		authenticated: true
	})
	.when('/profile/fundedprojects', {
		templateUrl:'app/views/pages/users/fundedprojects.html',
		authenticated: true
	})
	.when('/management', {
		templateUrl:'app/views/pages/management/management.html',
		controller: 'managementCtrl',
		controllerAs: 'management',
		authenticated: true,
		permission: ['admin', 'moderator']
	})	
	.when('/edit/:id', {
		templateUrl:'app/views/pages/management/edit.html',
		controller: 'editCtrl',
		controllerAs: 'edit',
		authenticated: true,
		permission: ['admin', 'moderator']
	})
	.otherwise({redirectTo:'/'});	
}]);	

app.run(['$rootScope', 'Auth', '$location', 'User', function($rootScope, Auth, $location, User){
	$rootScope.$on('$routeChangeStart', function(event, next, current){
		if(next.$$route !== undefined){
			if(next.$$route.authenticated == true){
				if(!Auth.isLoggedIn()){
					event.preventDefault();
					$location.path('/');
				} else if(next.$$route.permission){
					User.getPermission().then(function(data){
						if(next.$$route.permission[0] !== data.data.permission){
							if(next.$$route.permission[1] !== data.data.permission){
								event.preventDefault();
								$location.path('/');
							}	
						}
					});
				}
			}else if(next.$$route.authenticated == false){
				if(Auth.isLoggedIn()){
					event.preventDefault();
					$location.path('/profile');
				}	
			}			
		}		
	});	
}]);