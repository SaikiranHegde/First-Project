angular.module('userServices', [])

    //Factory: User handles all user related functions
    .factory('User', function ($http) {
        userFactory = {};

        //Function to register users in database
        userFactory.create = function (regData) {
            return $http.post('/api/users', regData);
        };

        //Function to check if username is available
        userFactory.checkUsername = function (regData) {
            return $http.post('/api/checkusername', regData);
        };

        //Function to check if e-mail is available
        userFactory.checkEmail = function (regData) {
            return $http.post('/api/checkemail', regData);
        };

        //Function to activate user account
        userFactory.activateAccount = function (token) {
            return $http.put('/api/activate' + token);
        };

        //Function to check credentials before re-sending activation link
        userFactory.checkCredentials = function (loginData) {
            return $http.post('/api/resend', loginData);
        };

        //Function to resend activation link
        userFactory.resendLink = function (loginData) {
            return $http.put('/api/resend', loginData);
        };

        //Function to send user's username
        userFactory.sendUsername = function (userData) {
            return $http.get('/api/sendusername/' + userData);
        };

        //Function to send password reset link
        userFactory.sendPassword = function (resetData) {
            return $http.put('/api/resetpassword', resetData);
        }

        //Function to get user's information from reset link
        userFactory.checkUser = function (token) {
            return $http.get('/api/resetpassword/' + token);
        }

        //Function to save user's new password
        userFactory.savePassword = function (regData) {
            return $http.put('/api/savepassword', regData);
        }

        //Function to provide the user with a new token
        userFactory.renewSession = function (username) {
            return $http.get('/api/renewToken/' + username);
        }

        //Function to get the current user's permission
        userFactory.getPermission = function () {
            return $http.get('/api/permission');
        }

        //Function to get all the users
        userFactory.getUsers = function () {
            return $http.get('/api/management');
        }

        //Function to get user to edit
        userFactory.getUser = function (id) {
            return $http.get('/api/edit/' + id);
        }

        //Function to delete a user
        userFactory.deleteUser = function (username) {
            return $http.delete('/api/management/' + username);
        }

        //Function to edit a user
        userFactory.editUser = function (userObject) {
            return $http.put('/api/edit', userObject);
        }

        return userFactory;
    });