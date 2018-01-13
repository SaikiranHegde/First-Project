var app = angular.module('appRoutes', ['ngRoute'])

//We use authenticated to set whether or not to access the page when loggedin
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider

            .when('/', {
                templateUrl: 'app/views/pages/home.html'
            })

            .when('/about', {
                templateUrl: 'app/views/pages/about.html'
            })

            .when('/register', {
                templateUrl: 'app/views/pages/users/register.html',
                controller: 'regCtrl',
                controllerAs: 'register',
                authenticated: false
            })

            .when('/login', {
                templateUrl: 'app/views/pages/users/login.html',
                authenticated: false
            })

            .when('/logout', {
                templateUrl: 'app/views/pages/users/logout.html',
                authenticated: true
            })

            .when('/profile', {
                templateUrl: 'app/views/pages/users/profile.html',
                authenticated: true
            })

            .when('/activate/:token', {
                templateUrl: 'app/views/pages/activation/activate.html',
                controller: 'emailCtrl',
                controllerAs: 'email',
                authenticated: false
            })

            .when('/resend', {
                templateUrl: 'app/views/pages/activation/resend.html',
                controller: 'resendCtrl',
                controllerAs: 'resend',
                authenticated: false
            })

            .when('/resetpassword', {
                templateUrl: 'app/views/pages/reset/password.html',
                controller: 'passwordCtrl',
                controllerAs: 'password',
                authenticated: false
            })

            .when('/resendusername', {
                templateUrl: 'app/views/pages/reset/username.html',
                controller: 'usernameCtrl',
                controllerAs: 'username',
                authenticated: false
            })

            .when('/reset/:token', {
                templateUrl: 'app/views/pages/reset/newpassword.html',
                controller: 'resetCtrl',
                controllerAs: 'reset',
                authenticated: false
            })
        
            .otherwise({
                redirectTo: '/'
            });

        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });

//Run Block - Restricting Routes
app.run(['$rootScope', 'Auth', '$location', function ($rootScope, Auth, $location) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        var authenticated = next.$$route.authenticated;
        if (authenticated) {
            if (!Auth.isLoggedIn()) {
                event.preventDefault();
                $location.path('/');
            }
        } else {
            if (Auth.isLoggedIn()) {
                event.preventDefault();
                $location.path('/profile');
            }
        }

    });
}]);