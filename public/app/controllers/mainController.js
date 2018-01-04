angular.module('mainController', ['authServices'])

    .controller('mainCtrl', function ($location, $timeout, Auth, $rootScope, $window) {
        var app = this;

        app.loadme = false;

        $rootScope.$on('$routeChangeStart', function () {
            if (Auth.isLoggedIn()) {
                //console.log("Success: User is Logged In");
                app.isLoggedIn = true;
                Auth.getUser().then(function (data) {
                    //console.log(data.data.username);
                    app.username = data.data.username;
                    app.useremail = data.data.email;
                    app.loadme = true;
                });
            } else {
                //console.log("Failure: User is Not Logged In");
                app.isLoggedIn = false;
                app.username = '';
                app.loadme = true;
            }
        });


        // Function to redirect users to twitter authentication page
        /*this.twitter = function () {
            console.log($window.location.host);
            console.log($window.location.protocol);
            $window.location = $window.location.protocol + '//' + $window.location.host + '/auth/twitter';
        };*/

        app.doLogin = function () {

            Auth.login(app.loginData).then(function (data) {
                app.errorMsg = false;

                /* console.log(data.data.success);
                 console.log(data.data.message);*/

                if (data.data.success) {
                    app.successMsg = data.data.message;

                    $timeout(function () {
                        $location.path('/about'); //For re-directing
                        app.loginData = '';
                        app.successMsg = false;
                    }, 2000);

                } else {
                    app.errorMsg = data.data.message;
                }
            });
        };

        app.logOut = function () {
            Auth.logOut();
            $location.path('/logout');
            $timeout(function () {
                $location.path('/'); //For re-directing
            }, 2000);
        };
    });