angular.module('managementController', ['userServices'])

    //Controller: managementCtrl is used to control the management page and managing of user accounts
    .controller('managementCtrl', function (User, $scope) {
        var app = this;

        app.accessDenied = true;
        app.errorMsg = false;
        app.editAccess = false;
        app.deleteAccess = false;
        app.limit = 10;
        app.searchLimit = 0;
    
        //Function to get all the users
        function getUsers() {
            User.getUsers().then(function (data) {
                if (data.data.success) {
                    if (data.data.permission === 'admin' || data.data.permission === 'moderator') {
                        app.users = data.data.users;
                        app.accessDenied = false;
                        if (data.data.permission === 'admin') {
                            app.editAccess = true;
                            app.deleteAccess = true;
                        } else {
                            app.editAccess = true;
                        }
                    } else {
                        app.errorMsg = 'Insufficient Permissions';
                    }
                } else {
                    app.errorMsg = data.data.message;
                }
            });
        }

        getUsers();

        //Function to show more results on page
        app.showMore = function (number) {
            app.showMoreError = false;

            if (number > 0) {
                app.limit = number;
            } else {
                app.showMoreError = 'Please enter a valid number';
            }
        };

        //Function to show all results on page
        app.showAll = function () {
            app.limit = undefined;
            app.showMoreError = false;
        };

        //Function to delete a user
        app.deleteUser = function (username) {
            User.deleteUser(username).then(function (data) {
                if (data.data.success) {
                    getUsers();
                } else {
                    app.showMoreError = data.data.message;
                }
            });
        };
    
        //Function to perform a basic search
        app.search = function (searchKeyword, number) {
            if (searchKeyword) {
                if (searchKeyword.length > 0) {
                    app.limit = 0;
                    $scope.searchFilter = searchKeyword;
                    app.limit = number;
                } else {
                    $scope.searchFilter = undefined;
                    app.limit = 0;
                }
            } else {
                $scope.searchFilter = undefined;
                app.limit = 0;
            }
        };

        //Function to clear all fields
        app.clear = function () {
            $scope.number = 0;
            app.limit = 0;
            $scope.searchKeyword = undefined;
            $scope.searchFilter = undefined;
            $scope.showMoreError = false;
        };
    
        //Function to set sort order of results
        app.sortOrder = function(order){
          app.sort = order;  
        };
    
         //Function to perform an advanced search
        app.advanceSearch = function(searchByUsername, searchByEmail, searchByName){
            if(searchByUsername || searchByEmail || searchByName){
                $scope.advanceSearchFilter = {};
                if(searchByUsername) {
                    $scope.advanceSearchFilter.username = searchByUsername;
                }
                if(searchByEmail) {
                    $scope.advanceSearchFilter.email = searchByEmail;
                }
                if(searchByName) {
                    $scope.advanceSearchFilter.name = searchByName;
                }
                app.searchLimit = undefined;
            }
        };
    })

    // Controller: editCtrl is used to edit users
    .controller('editCtrl', function ($scope, $routeParams, User, $timeout) {
        var app = this;
        $scope.nameTab = 'active';
        app.phase1 = true;

        //Function to get the user to be edited
        User.getUser($routeParams.id).then(function (data) {
            if (data.data.success) {
                $scope.newName = data.data.user.name;
                $scope.newUsername = data.data.user.username;
                $scope.newEmail = data.data.user.email;
                $scope.newPermission = data.data.user.permission;
                app.currentUser = data.data.user._id;
            } else {
                app.errorMsg = data.data.message;
            }
        });

        //Function to set the name pill to active
        app.namePhase = function () {
            $scope.nameTab = 'active';
            $scope.usernameTab = 'default';
            $scope.emailTab = 'default';
            $scope.permissionsTab = 'default';
            app.phase1 = true;
            app.phase2 = false;
            app.phase3 = false;
            app.phase4 = false;
            app.errorMsg = false;
        };

        //Function to set the username pill to active
        app.usernamePhase = function () {
            $scope.nameTab = 'default';
            $scope.usernameTab = 'active';
            $scope.emailTab = 'default';
            $scope.permissionsTab = 'default';
            app.phase1 = false;
            app.phase2 = true;
            app.phase3 = false;
            app.phase4 = false;
            app.errorMsg = false;
        };

        //Function to set the e-mail pill to active
        app.emailPhase = function () {
            $scope.nameTab = 'default';
            $scope.usernameTab = 'default';
            $scope.emailTab = 'active';
            $scope.permissionsTab = 'default';
            app.phase1 = false;
            app.phase2 = false;
            app.phase3 = true;
            app.phase4 = false;
            app.errorMsg = false;
        };

        //Function to set the permission pill to active
        app.permissionsPhase = function () {
            $scope.nameTab = 'default';
            $scope.usernameTab = 'default';
            $scope.emailTab = 'default';
            $scope.permissionsTab = 'active';
            app.phase1 = false;
            app.phase2 = false;
            app.phase3 = false;
            app.phase4 = true;
            app.errorMsg = false;
            app.disableUser = false;
            app.disableModerator = false;
            app.disableAdmin = false;

            if ($scope.newPermission === 'user') {
                app.disableUser = true;
            } else if ($scope.newPermission === 'moderator') {
                app.disableModerator = true;
            } else if ($scope.newPermission === 'admin') {
                app.disableAdmin = true;
            }
        };

        //Function to update user's name
        app.updateName = function (newName, valid) {
            app.errorMsg = false;
            app.disabled = true;
            var userObject = {};

            if (valid) {
                userObject.id = app.currentUser;
                userObject.name = $scope.newName;

                User.editUser(userObject).then(function (data) {
                    if (data.data.success) {
                        app.successMsg = data.data.message;
                        $timeout(function () {
                            app.nameForm.name.$setPristine();
                            app.nameForm.name.$setUntouched();
                            app.successMsg = false;
                            app.disabled = false;
                        }, 2000);
                    } else {
                        app.errorMsg = data.data.message;
                        app.disabled = false;
                    }
                });
            } else {
                app.errorMsg = 'Fill out the Form Properly!!';
                app.disabled = false;
            }
        };

        //Function to update user's username
        app.updateUsername = function (newUsername, valid) {
            app.errorMsg = false;
            app.disabled = true;
            var userObject = {};

            if (valid) {
                userObject.id = app.currentUser;
                userObject.username = $scope.newUsername;

                User.editUser(userObject).then(function (data) {
                    if (data.data.success) {
                        app.successMsg = data.data.message;
                        $timeout(function () {
                            app.usernameForm.username.$setPristine();
                            app.usernameForm.username.$setUntouched();
                            app.successMsg = false;
                            app.disabled = false;
                        }, 2000);
                    } else {
                        app.errorMsg = data.data.message;
                        app.disabled = false;
                    }
                });
            } else {
                app.errorMsg = 'Fill out the Form Properly!!';
                app.disabled = false;
            }
        };

        //Function to update user's e-mail
        app.updateEmail = function (newEmail, valid) {
            app.errorMsg = false;
            app.disabled = true;
            var userObject = {};

            if (valid) {
                userObject.id = app.currentUser;
                userObject.email = $scope.newEmail;

                User.editUser(userObject).then(function (data) {
                    if (data.data.success) {
                        app.successMsg = data.data.message;
                        $timeout(function () {
                            app.emailForm.email.$setPristine();
                            app.emailForm.email.$setUntouched();
                            app.successMsg = false;
                            app.disabled = false;
                        }, 2000);
                    } else {
                        app.errorMsg = data.data.message;
                        app.disabled = false;
                    }
                });
            } else {
                app.errorMsg = 'Fill out the Form Properly!!';
                app.disabled = false;
            }
        };

        //Function to update user's permission
        app.updateEmail = function (newPermission) {
            app.errorMsg = false;
            app.disableUser = true;
            app.disableModerator = true;
            app.disableAdmin = true;

            var userObject = {};
            userObject.id = app.currentUser;
            userObject.permission = newPermission;

            User.editUser(userObject).then(function (data) {
                if (data.data.success) {
                    app.successMsg = data.data.message;
                    $timeout(function () {
                        app.successMsg = false;
                        $scope.newPermission = newPermission;

                        if (newPermission === 'user') {
                            app.disableUser = true;
                            app.disableModerator = false;
                            app.disableAdmin = false;
                        } else if (newPermission === 'moderator') {
                            app.disableUser = false;
                            app.disableModerator = true;
                            app.disableAdmin = false;
                        } else if (newPermission === 'admin') {
                            app.disableUser = false;
                            app.disableModerator = false;
                            app.disableAdmin = true;
                        }

                    }, 2000);
                } else {
                    app.errorMsg = data.data.message;
                    app.disabled = false;
                }
            });
        };
    });