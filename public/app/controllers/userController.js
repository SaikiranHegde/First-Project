angular.module('userControllers', ['userServices'])

    .controller('regCtrl', function ($location, $timeout, User) {

        var app = this;

        app.regUser = function () {

            User.create(app.regData).then(function (data) {
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
    });