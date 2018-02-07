var app = angular.module('appRoutes', ['ngRoute'])

    //Configure Routes; 'authenticated = true' means the user must be logged in to access the route
    .config(function ($routeProvider, $locationProvider) {
        $routeProvider

            //Route: Home
            .when('/', {
                templateUrl: 'app/views/pages/home.html'
            })

            //Route: About Us
            .when('/about', {
                templateUrl: 'app/views/pages/about.html'
            })

            //Route: User Registration
            .when('/register', {
                templateUrl: 'app/views/pages/users/register.html',
                controller: 'regCtrl',
                controllerAs: 'register',
                authenticated: false
            })

            //Route: User Login
            .when('/login', {
                templateUrl: 'app/views/pages/users/login.html',
                authenticated: false
            })

            //Route: User Logout
            .when('/logout', {
                templateUrl: 'app/views/pages/users/logout.html',
                authenticated: true
            })

            //Route: User Profile
            .when('/profile', {
                templateUrl: 'app/views/pages/users/profile.html',
                authenticated: true
            })

            //Route: Activate Account 
            .when('/activate/:token', {
                templateUrl: 'app/views/pages/activation/activate.html',
                controller: 'emailCtrl',
                controllerAs: 'email',
                authenticated: false
            })

            //Route: Request New Activation Link  
            .when('/resend', {
                templateUrl: 'app/views/pages/activation/resend.html',
                controller: 'resendCtrl',
                controllerAs: 'resend',
                authenticated: false
            })

            //Route: Send Password Reset Link
            .when('/resetpassword', {
                templateUrl: 'app/views/pages/reset/password.html',
                controller: 'passwordCtrl',
                controllerAs: 'password',
                authenticated: false
            })

            //Route: Send Username
            .when('/resendusername', {
                templateUrl: 'app/views/pages/reset/username.html',
                controller: 'usernameCtrl',
                controllerAs: 'username',
                authenticated: false
            })

            //Route: New password
            .when('/reset/:token', {
                templateUrl: 'app/views/pages/reset/newpassword.html',
                controller: 'resetCtrl',
                controllerAs: 'reset',
                authenticated: false
            })

            //Route: Manage User Accounts
            .when('/management', {
                templateUrl: 'app/views/pages/management/management.html',
                controller: 'managementCtrl',
                controllerAs: 'management',
                authenticated: true,
                permission: ['admin', 'moderator']
            })

            //Route: Edit a user
            .when('/edit/:id', {
                templateUrl: 'app/views/pages/management/edit.html',
                controller: 'editCtrl',
                controllerAs: 'edit',
                authenticated: true,
                permission: ['admin', 'moderator']
            })

            //Route: Search Users
            .when('/search', {
                templateUrl: 'app/views/pages/management/search.html',
                controller: 'managementCtrl',
                controllerAs: 'management',
                authenticated: true,
                permission: ['admin', 'moderator']
            })

            //If user tries any other routes, redirect to home page
            .otherwise({
                redirectTo: '/'
            });

        //Required to remove AngularJS hash from URL
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    });

//Run Block - Restricting Routes
app.run(['$rootScope', 'Auth', '$location', 'User', function ($rootScope, Auth, $location, User) {

    $rootScope.$on('$routeChangeStart', function (event, next, current) {

        if (next.$$route !== undefined) {

            if (next.$$route.authenticated === true) {
                if (!Auth.isLoggedIn()) {
                    event.preventDefault();
                    $location.path('/');
                } else if (next.$$route.permission) {
                    User.getPermission().then(function (data) {
                        if (next.$$route.permission[0] !== data.data.permission) {
                            if (next.$$route.permission[1] !== data.data.permission) {
                                event.preventDefault();
                                $location.path('/');
                            }
                        }
                    });
                }
            } else if (next.$$route.authenticated === false) {
                if (Auth.isLoggedIn()) {
                    event.preventDefault();
                    $location.path('/profile');
                }
            }
        }

    });
}]);