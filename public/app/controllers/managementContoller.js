angular.module('managementController', ['userServices'])

    .controller('managementCtrl', function (User) {
        var app = this;

        app.accessDenied = true;
        app.errorMsg = false;
        app.editAccess = false;
        app.deleteAccess = false;

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
        })
    });