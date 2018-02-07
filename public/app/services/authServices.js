angular.module('authServices', [])

    //Factory: Auth handles all login/logout functions
    .factory('Auth', function ($http, AuthToken) {
        authFactory = {};

        //Function to log the user in
        authFactory.login = function (loginData) {
            return $http.post('/api/authenticate', loginData).then(function (data) {
                AuthToken.setToken(data.data.token);
                return data;
            });
        };

        //Function to check if user is logged in
        authFactory.isLoggedIn = function () {
            if (AuthToken.getToken()) return true;
            else return false;
        };

        //Function to get current user's data
        authFactory.getUser = function () {
            if (AuthToken.getToken()) {
                return $http.post('/api/userInfo');
            }
        }

        //Function to logout the user
        authFactory.logOut = function () {
            AuthToken.setToken();
        };

        return authFactory;
    })

    //Factory: AuthToken handles all token related functions
    .factory('AuthToken', function ($window) {
        authTokenFactory = {};

        //Function to set/remove the token to/from local storage
        authTokenFactory.setToken = function (token) {
            if (token) {
                $window.localStorage.setItem('token', token);
            } else {
                $window.localStorage.removeItem('token');
            }
        };

        //Function to get the token
        authTokenFactory.getToken = function () {
            return $window.localStorage.getItem('token');
        };

        return authTokenFactory;
    })

    //Factory: AuthInterceptors is used to configure headers with token
    .factory('AuthInterceptors', function (AuthToken) {
        var authInterceptorsFactory = {};

        //Function to check for token in local storage and attach to header
        authInterceptorsFactory.request = function (config) {
            var token = AuthToken.getToken();

            if (token) config.headers['x-access-token'] = token;

            return config;
        }

        return authInterceptorsFactory;
    })