var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'secret7'
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

module.exports = function (router) {

    //Sendgrid configuration settings
    var options = {
        auth: {
            api_user: '<username>',
            api_key: '<password>'
        }
    }

    //Nodemailer options
    var client = nodemailer.createTransport(sgTransport(options));

    //Route to register new users
    router.post('/users', function (req, res) {
        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;
        user.name = req.body.name;
        user.temptoken = jwt.sign({
            username: user.username,
            email: user.email
        }, secret, {
            expiresIn: '24h'
        });

        if (req.body.username == null || req.body.username == "" || req.body.password == "" || req.body.email == null || req.body.email == "" || req.body.name == null || req.body.name == "") {
            res.json({
                success: false,
                message: 'Please provide all the Fields'
            });
        } else {
            user.save(function (err) {
                if (err) {
                    if (err.errors != null) {
                        if (err.errors.name) {
                            res.json({
                                success: false,
                                message: err.errors.name.message
                            });
                        } else if (err.errors.email) {
                            res.json({
                                success: false,
                                message: err.errors.email.message
                            });
                        } else if (err.errors.username) {
                            res.json({
                                success: false,
                                message: err.errors.username.message
                            });
                        } else if (err.errors.password) {
                            res.json({
                                success: false,
                                message: err.errors.password.message
                            });
                        }
                    } else {
                        if (err.code == 11000) {
                            res.json({
                                success: false,
                                message: "Username or Email already taken"
                            });
                        } else {
                            res.json({
                                success: false,
                                message: err
                            });
                        }

                    }
                } else {

                    var email = {
                        from: 'staff@localhost.com',
                        to: user.email,
                        subject: 'Localhost Activation Link',
                        text: 'Hello ' + user.name + ', thank you for registering. http://localhost:8080/activate/' + user.temptoken,
                        html: 'Hello <b>' + user.name + '</b>, <br><br>Thank you for registering.<br><a href="http://localhost:8080/activate/' + user.temptoken + '">Link</a>'
                    };

                    client.sendMail(email, function (err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Message sent: ' + info.response);
                        }
                    });

                    res.json({
                        success: true,
                        message: 'Account created, Please check your email for activation link!!'
                    });
                }
            });
        }
    });

    //Route for user login
    router.post('/authenticate', function (req, res) {
        var validPassword;
        User.findOne({
            username: req.body.username
        }).select('email username password active').exec(function (err, user) {
            if (err) throw err;

            if (!user) {
                res.json({
                    success: false,
                    message: 'Could not authenticate User!'
                });
            } else if (user) {
                if (req.body.password) {
                    /*console.log(req.body.password);
                    validPassword = user.comparePassword(req.body.password);
                    console.log(validPassword);*/
                    if (req.body.password == user.password)
                        validPassword = true;
                    else
                        validPassword = false;
                } else {
                    res.json({
                        success: false,
                        message: 'No Password provided!'
                    });
                }

                if (!validPassword) {
                    res.json({
                        success: false,
                        message: 'Could not authenticate Password!'
                    });
                } else if (!user.active) {
                    res.json({
                        success: false,
                        message: 'Account is not yet Activated. Please check your email!',
                        expired: true
                    });
                } else {
                    var token = jwt.sign({
                        username: user.username,
                        email: user.email
                    }, secret, {
                        expiresIn: '24h'
                    });
                    res.json({
                        success: true,
                        message: 'User Authenticated!!',
                        token: token
                    });
                }
            }

        });
    });

    //Route to verify user credentials before re-sending a new activation link 
    router.post('/resend', function (req, res) {
        var validPassword;
        User.findOne({
            username: req.body.username
        }).select('username password active').exec(function (err, user) {
            if (err) throw err;

            if (!user) {
                res.json({
                    success: false,
                    message: 'Could not authenticate User!'
                });
            } else if (user) {
                if (req.body.password) {
                    /*console.log(req.body.password);
                    validPassword = user.comparePassword(req.body.password);
                    console.log(validPassword);*/
                    if (req.body.password == user.password)
                        validPassword = true;
                    else
                        validPassword = false;
                } else {
                    res.json({
                        success: false,
                        message: 'No Password provided!'
                    });
                }

                if (!validPassword) {
                    res.json({
                        success: false,
                        message: 'Could not authenticate Password!'
                    });
                } else if (user.active) {
                    res.json({
                        success: false,
                        message: 'Account is already Activated!'
                    });
                } else {
                    res.json({
                        success: true,
                        user: user
                    });
                }
            }

        });
    });

    //Route to send user a new activation link
    router.put('/resend', function (req, res) {
        var validPassword;
        User.findOne({
            username: req.body.username
        }).select('username name email temptoken').exec(function (err, user) {
            if (err) throw err;
            user.temptoken = jwt.sign({
                username: user.username,
                email: user.email
            }, secret, {
                expiresIn: '24h'
            });
            user.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    var email = {
                        from: 'staff@localhost.com',
                        to: user.email,
                        subject: 'Localhost Activation Link',
                        text: 'Hello ' + user.name + ', You recently requested new account activation link. http://localhost:8080/activate/' + user.temptoken,
                        html: 'Hello <b>' + user.name + '</b>, <br><br>You recently requested new account activation link: <a href="http://localhost:8080/activate/' + user.temptoken + '">Link</a>'
                    };

                    client.sendMail(email, function (err, info) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('Message sent: ' + info.response);
                        }
                    });
                    res.json({
                        success: true,
                        message: 'Activation link has been sent to ' + user.email + '!!'
                    });
                }
            })
        });
    });

    //Route to check if username is already taken
    router.post('/checkusername', function (req, res) {
        var validPassword;
        User.findOne({
            username: req.body.username
        }).select('username').exec(function (err, user) {
            if (err) throw err;

            if (user) {
                res.json({
                    success: false,
                    message: 'Username is already taken!!'
                });
            } else {
                res.json({
                    success: true,
                    message: 'Valid Username'
                });
            }

        });
    });

    // Route to check if e-mail is already taken
    router.post('/checkemail', function (req, res) {
        User.findOne({
            email: req.body.email
        }).select('email').exec(function (err, user) {
            if (err) throw err;

            if (user) {
                res.json({
                    success: false,
                    message: 'E-Mail is already taken!!'
                });
            } else {
                res.json({
                    success: true,
                    message: 'Valid E-Mail'
                });
            }

        });
    });

    //Route to activate the user's account 
    router.put('/activate/:token', function (req, res) {
        User.findOne({
            temptoken: req.params.token
        }, function (err, user) {
            if (err) throw err;
            var token = req.params.token;

            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Activation link has expired.'
                    });
                } else if (!user) {
                    res.json({
                        success: false,
                        message: 'Activation link has expired.'
                    });
                } else {
                    user.temptoken = false;
                    user.active = true;
                    user.save(function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            var email = {
                                from: 'Localhost Staff, staff@localhost.com',
                                to: user.email,
                                subject: 'Localhost Account Activated',
                                text: 'Hello ' + user.name + ', Your account has been successfully activated!',
                                html: 'Hello <b>' + user.name + '</b>, <br><br> Your account has been successfully activated!'
                            };

                            client.sendMail(email, function (err, info) {
                                if (err) {
                                    console.log(error);
                                } else {
                                    console.log('Message sent: ' + info.response);
                                }
                            });
                            res.json({
                                success: true,
                                message: 'Account activated.'
                            });
                        }
                    })
                }
            })
        });
    });

    //Route to send user's username
    router.get('/sendusername/:email', function (req, res) {
        User.findOne({
            email: req.params.email
        }).select('email name username').exec(function (err, user) {
            if (err) {
                res.json({
                    success: false,
                    message: err
                });
            } else {
                if (!user) {
                    res.json({
                        success: false,
                        message: 'E-mail was not found'
                    });
                } else {
                    var email = {
                        from: 'Localhost Staff, staff@localhost.com',
                        to: user.email,
                        subject: 'Localhost Username Request',
                        text: 'Hello ' + user.name + ', Your recently requested your username. Please save it: ' + user.username,
                        html: 'Hello <b>' + user.name + '</b>, <br><br> Your recently requested your username. Please save it:' + user.username
                    };

                    client.sendMail(email, function (err, info) {
                        if (err) {
                            console.log(error);
                        } else {
                            console.log('Message sent: ' + info.response);
                        }
                    });
                    res.json({
                        success: true,
                        message: 'Username has been sent to email: ' + user.email
                    });
                }
            }
        });
    });

    //Route to send reset link
    router.put('/resetpassword', function (req, res) {
        User.findOne({
            email: req.body.email
        }).select('email name username resettoken active').exec(function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({
                    success: false,
                    message: 'Username was not found!!'
                });
            } else if (!user.active) {
                res.json({
                    success: false,
                    message: 'Account has not been Activated!!'
                });
            } else {
                user.resettoken = jwt.sign({
                    username: user.username,
                    email: user.email
                }, secret, {
                    expiresIn: '24h'
                });
                user.save(function (err) {
                    if (err) {
                        res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        var email = {
                            from: 'Localhost Staff, staff@localhost.com',
                            to: user.email,
                            subject: 'Localhost Reset Password Request',
                            text: 'Hello ' + user.name + ', You recently requested a password reset link. Please click on the link to reset password: http://localhost:8080/reset/' + user.resettoken,
                            html: 'Hello <b>' + user.name + '</b>, <br><br>You recently requested a password reset link. Please click on the link to reset password:<a href="http://localhost:8080/reset/' + user.resettoken + '">Link</a>'
                        };

                        client.sendMail(email, function (err, info) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Message sent: ' + info.response);
                            }
                        });

                        res.json({
                            success: true,
                            message: 'Account created, Please check your email for password reset link!!'
                        });
                    }
                });
            }
        });
    });

    //Route to verify user's e-mail activation link
    router.get('/resetpassword/:token', function (req, res) {
        User.findOne({
            resettoken: req.params.token
        }).select().exec(function (err, user) {
            if (err) throw err;
            var token = req.params.token;
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Token Invalid'
                    });
                } else {
                    if (!user) {
                        res.json({
                            success: false,
                            message: 'Token Invalid'
                        });
                    } else {
                        res.json({
                            success: true,
                            user: user
                        });
                    }
                }
            });
        });
    });

    //Route to save user's new password
    router.put('/savepassword', function (req, res) {
        User.findOne({
            username: req.body.username
        }).select('email name username resettoken active').exec(function (err, user) {
            if (err) throw err;
            if (req.body.password == null || req.body.password == '') {
                res.json({
                    success: false,
                    message: 'Password not provided'
                });
            } else {
                user.password = req.body.password;
                user.resettoken = false;
                user.save(function (err) {
                    if (err) {
                        res.json({
                            success: false,
                            message: err
                        });
                    } else {
                        var email = {
                            from: 'Localhost Staff, staff@localhost.com',
                            to: user.email,
                            subject: 'Localhost Reset Password',
                            text: 'Hello ' + user.name + ', This e-mail is to notify you that your Password has been reset',
                            html: 'Hello <b>' + user.name + '</b>, <br><br>This e-mail is to notify you that your Password has been reset'
                        };

                        client.sendMail(email, function (err, info) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log('Message sent: ' + info.response);
                            }
                        });

                        res.json({
                            success: true,
                            message: 'Password has been reset!!'
                        });
                    }
                });
            }
        });
    });

    // Middleware for Routes that checks for token - Place all routes after this, that require the user to already be logged in
    router.use(function (req, res, next) {
        var token = req.body.token || req.body.query || req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, secret, function (err, decoded) {
                if (err) {
                    res.json({
                        success: false,
                        message: 'Token Invalid'
                    });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.json({
                success: false,
                message: 'Token not provided'
            });
        }

    });

    //Route to get currently logged in user
    router.post('/userInfo', function (req, res) {
        res.send(req.decoded);
    });

    //Route to provide the user with a new token
    router.get('/renewToken/:username', function (req, res) {
        User.findOne({
            username: req.params.username
        }).select('username email').exec(function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({
                    success: false,
                    message: 'No user was found'
                });
            } else {
                var newToken = jwt.sign({
                    username: user.username,
                    email: user.email
                }, secret, {
                    expiresIn: '24h'
                });
                res.json({
                    success: true,
                    token: newToken
                });
            }
        });
    });

    //Route to get the current user's permission
    router.get('/permission', function (req, res) {
        User.findOne({
            username: req.decoded.username
        }).select('username permission').exec(function (err, user) {
            if (err) throw err;
            if (!user) {
                res.json({
                    success: false,
                    message: 'No user was found'
                });
            } else {
                res.json({
                    success: true,
                    permission: user.permission
                });
            }
        });
    });

    //Route to get all users for management page
    router.get('/management', function (req, res) {
        User.find({}, function (err, users) {
            if (err) throw err;
            User.findOne({
                username: req.decoded.username
            }, function (err, mainUser) {
                if (err) throw err;
                if (!mainUser) {
                    res.json({
                        success: false,
                        message: 'No user was found'
                    });
                } else {
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        if (!users) {
                            res.json({
                                success: false,
                                message: 'Users not found'
                            });
                        } else {
                            res.json({
                                success: true,
                                users: users,
                                permission: mainUser.permission
                            });
                        }
                    } else {
                        res.json({
                            success: false,
                            message: 'Insufficient Permission'
                        });
                    }
                }
            });
        });
    });

    //Route to delete a user
    router.delete('/management/:username', function (req, res) {
        var deletedUser = req.params.username;

        User.findOne({
            username: req.decoded.username
        }, function (err, mainUser) {
            if (err) throw err;
            if (!mainUser) {
                res.json({
                    success: false,
                    message: 'No user was found'
                });
            } else {
                if (mainUser.permission !== 'admin') {
                    res.json({
                        success: false,
                        message: 'Insufficient Permission'
                    });
                } else {
                    User.findOneAndRemove({
                        username: deletedUser
                    }, function (err, user) {
                        if (err) throw err;
                        res.json({
                            success: true
                        });
                    });
                }
            }
        });
    });

    //Route to get the user that needs to be edited
    router.get('/edit/:id', function (req, res) {
        var editUser = req.params.id;

        User.findOne({
            username: req.decoded.username
        }, function (err, mainUser) {
            if (err) throw err;
            if (!mainUser) {
                res.json({
                    success: false,
                    message: 'No user was found'
                });
            } else {
                if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                    User.findOne({
                        _id: editUser
                    }, function (err, user) {
                        if (err) throw err;
                        if (!user) {
                            res.json({
                                success: false,
                                message: 'No user was found'
                            });
                        } else {
                            res.json({
                                success: true,
                                user: user
                            });
                        }
                    });
                } else {
                    res.json({
                        success: false,
                        message: 'Insufficient Permission'
                    });
                }
            }
        });
    });

    //Route to update/edit a user
    router.put('/edit', function (req, res) {
        var editUser = req.body.id;

        if (req.body.name) var newName = req.body.name;
        if (req.body.username) var newUsername = req.body.username;
        if (req.body.email) var newEmail = req.body.email;
        if (req.body.permission) var newPermission = req.body.permission;

        User.findOne({
            username: req.decoded.username
        }, function (err, mainUser) {
            if (err) throw err;
            if (!mainUser) {
                res.json({
                    success: false,
                    message: 'No user was found'
                });
            } else {
                if (newName) {
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        User.findOne({
                            _id: editUser
                        }, function (err, user) {
                            if (err) throw err;
                            if (!user) {
                                res.json({
                                    success: false,
                                    message: 'No user was found'
                                });
                            } else {
                                user.name = newName;
                                user.save(function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        res.json({
                                            success: true,
                                            message: 'Name has been updated'
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        res.json({
                            success: false,
                            message: 'Insufficient Permission'
                        });
                    }
                }

                if (newUsername) {
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        User.findOne({
                            _id: editUser
                        }, function (err, user) {
                            if (err) throw err;
                            if (!user) {
                                res.json({
                                    success: false,
                                    message: 'No user was found'
                                });
                            } else {
                                user.username = newUsername;
                                user.save(function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        res.json({
                                            success: true,
                                            message: 'Username has been updated'
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        res.json({
                            success: false,
                            message: 'Insufficient Permission'
                        });
                    }
                }

                if (newEmail) {
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        User.findOne({
                            _id: editUser
                        }, function (err, user) {
                            if (err) throw err;
                            if (!user) {
                                res.json({
                                    success: false,
                                    message: 'No user was found'
                                });
                            } else {
                                user.email = newEmail;
                                user.save(function (err) {
                                    if (err) {
                                        console.log(err);
                                    } else {
                                        res.json({
                                            success: true,
                                            message: 'E-mail has been updated'
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        res.json({
                            success: false,
                            message: 'Insufficient Permission'
                        });
                    }
                }

                if (newPermission) {
                    if (mainUser.permission === 'admin' || mainUser.permission === 'moderator') {
                        User.findOne({
                            _id: editUser
                        }, function (err, user) {
                            if (err) throw err;
                            if (!user) {
                                res.json({
                                    success: false,
                                    message: 'No user was found'
                                });
                            } else {
                                if (newPermission === 'user') {
                                    if (user.permission === 'admin') {
                                        if (mainUser.permission !== 'admin') {
                                            res.json({
                                                success: false,
                                                message: 'Insufficient Permission. You are not Admin!!'
                                            });
                                        } else {
                                            user.permission = newPermission;
                                            user.save(function (err) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    res.json({
                                                        success: true,
                                                        message: 'Permission has been updated'
                                                    });
                                                }
                                            });
                                        }
                                    } else {
                                        user.permission = newPermission;
                                        user.save(function (err) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                res.json({
                                                    success: true,
                                                    message: 'Permission has been updated'
                                                });
                                            }
                                        });
                                    }
                                }

                                if (newPermission === 'moderator') {
                                    if (user.permission === 'admin') {
                                        if (mainUser.permission !== 'admin') {
                                            res.json({
                                                success: false,
                                                message: 'Insufficient Permission. You are not Admin!!'
                                            });
                                        } else {
                                            user.permission = newPermission;
                                            user.save(function (err) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    res.json({
                                                        success: true,
                                                        message: 'Permission has been updated'
                                                    });
                                                }
                                            });
                                        }
                                    } else {
                                        user.permission = newPermission;
                                        user.save(function (err) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                res.json({
                                                    success: true,
                                                    message: 'Permission has been updated'
                                                });
                                            }
                                        });
                                    }
                                }

                                if (newPermission === 'admin') {
                                    if (mainUser.permission === 'admin') {
                                        user.permission = newPermission;
                                        user.save(function (err) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                res.json({
                                                    success: true,
                                                    message: 'Permission has been updated'
                                                });
                                            }
                                        });
                                    } else {
                                        res.json({
                                            success: false,
                                            message: 'Insufficient Permission. You are not Admin!!'
                                        });
                                    }
                                }

                            }
                        });
                    } else {
                        res.json({
                            success: false,
                            message: 'Insufficient Permission'
                        });
                    }
                }

            }
        });
    });

    return router;
}