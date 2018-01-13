angular.module('userApp', ['appRoutes', 'userController', 'userServices', 'ngAnimate', 'mainController', 'authServices', 'emailController'])

.config(function($httpProvider){
    $httpProvider.interceptors.push('AuthInterceptors');
});