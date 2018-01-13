var User = require('../models/user');
var jwt = require('jsonwebtoken');
var secret = 'secret7'
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

module.exports = function (router) {

    var options = {
        auth: {
            api_user: 'saikiran_hegde',
            api_key: 'send1234'
        }
        /*,
        	options: {
        		proxy: 'http://saikiran_hegde:Passwd%402018@goaproxy.persistent.co.in:8080',
                
        	}*/
    }

    var client = nodemailer.createTransport(sgTransport(options));

    //User Registration
    //http://localhost:8080/api/users
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

    //User Login
    //http://localhost:8080/api/aunthenticate
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

    //Resend Activation Link
    //http://localhost:8080/api/resend
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

    //http://localhost:8080/api/checkusername
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

    //http://localhost:8080/api/checkemail
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

    //To get Username
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
                    res.json({
                        success: false,
                        user: user
                    });
                }
            });
        });
    });


    router.put('/resetpassword', function (req, res) {
        User.findOne({
            username: req.body.username
        }).select('email name username resettoken active').exec(function (err, user) {
                if (err) throw err;
            if(req.body.password == null || req.body.password == ''){
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

    //Middleware
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

    //http://localhost:8080/api/userInfo
    router.post('/userInfo', function (req, res) {
        res.send(req.decoded);
    });

    return router;
}