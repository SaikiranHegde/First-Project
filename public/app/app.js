angular.module('userApp', ['appRoutes', 'userController', 'userServices', 'ngAnimate', 'mainController', 'authServices', 'emailController', 'managementContoller'])

.config(function($httpProvider){
    $httpProvider.interceptors.push('AuthInterceptors');
});