var User = require('../models/user');

module.exports = function (router) {
    
    //User Registration
    //http://localhost:8080/api/users
    router.post('/users', function (req, res) {
        var user = new User();
        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;

        if (req.body.username == null || req.body.username == "" || req.body.password == "" || req.body.email == null || req.body.email == "") {
            res.json({
                success: false,
                message: 'Please provide all the Fields'
            });
        } else {
            user.save(function (err) {
                if (err)
                    res.json({
                        success: false,
                        message: 'Username or Email already exists!'
                    });
                else
                    res.json({
                        success: true,
                        message: 'User created'
                    });
            });
        }
    });
    
    //User Login
    //http://localhost:8080/api/aunthenticate
    router.post('/authenticate', function(req, res){
        var validPassword;
        User.findOne({username: req.body.username}).select('email username password').exec(function(err, user){
           if(err) throw err;
            
            if(!user){
                res.json({success: false, message: 'Could not authenticate User!'});
            }
            else if(user){
                if(req.body.password){
                    /*console.log(req.body.password);
                    validPassword = user.comparePassword(req.body.password);
                    console.log(validPassword);*/
                    if(req.body.password == user.password)
                        validPassword = true;
                    else
                        validPassword = false;
                }
                else{
                    res.json({success: false, message: 'No Password provided!'});
                }
                
                if(!validPassword){
                    res.json({success: false, message: 'Could not authenticate Password!'});
                }
                else{
                    res.json({success: true, message: 'User Authenticated!!'});
                }
            }
            
        });
    });
    
    
    return router;
}