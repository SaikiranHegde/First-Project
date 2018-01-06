angular.module('userControllers', ['userServices'])

    .controller('regCtrl', function ($location, $timeout, User) {

        var app = this;

        app.regUser = function (regData, valid) {

            app.errorMsg = false;

            if (valid) {
                User.create(app.regData).then(function (data) {
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
            } else {
                app.errorMsg = "Please ensure form is filled properly";
            }
        };

        app.checkUsername = function (regData) {

            app.usernameInvalid = false;
            app.usernameMsg = false;

            User.checkUsername(app.regData).then(function (data) {
                /* console.log(regData);
                 console.log(data);*/
                app.usernameMsg = data.data.message;
                if (!data.data.success) {
                    app.usernameInvalid = true;
                }
            });
        };

        app.checkEmail = function (regData) {

            app.emailInvalid = false;
            app.emailMsg = false;

            User.checkEmail(app.regData).then(function (data) {
                /* console.log(app.regData);
                console.log(data);*/
                app.emailMsg = data.data.message;
                if (!data.data.success) {
                    app.emailInvalid = true;
                }
            });
        };
    })

    .directive('match', function () {
        return {
            restrict: 'A',
            controller: function ($scope) {
                $scope.doConfirm = function (values) {
                    $scope.confirmed = false;
                    values.forEach(function (element) {
                        if ($scope.confirm == element) {
                            $scope.confirmed = true;
                        }
                    });
                }
            },

            link: function (scope, element, attributes) {
                attributes.$observe('match', function () {
                    scope.matches = JSON.parse(attributes.match);
                    scope.doConfirm(scope.matches);
                });

                scope.$watch('confirm', function () {
                    scope.matches = JSON.parse(attributes.match);
                    scope.doConfirm(scope.matches);
                });
            }
        };
    });