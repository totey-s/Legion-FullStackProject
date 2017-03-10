var app = angular.module('kickstarter',['appRoutes', 'userControllers', 'userServices', 'ngAnimate', 'mainController', 'authServices']);

app.config(function($httpProvider){
	$httpProvider.interceptors.push('AuthInterceptors');
});