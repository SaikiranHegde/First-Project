angular.module('mainController', ['authServices'])

.controller('mainCtrl', function ($location, $timeout, Auth) {
    var app = this;

    if (Auth.isLoggedIn()) {
        console.log("Success: User is Logged In");
        Auth.getUser().then(function (data) {
            console.log(data);
        });
    } else {
        console.log("Failure: User is Not Logged In");
    }

    app.doLogin = function () {

        Auth.login(app.loginData).then(function (data) {
            app.errorMsg = false;

            /* console.log(data.data.success);
             console.log(data.data.message);*/

            if (data.data.success) {
                app.successMsg = data.data.message;

                $timeout(function () {
                    $location.path('/'); //For re-directing
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