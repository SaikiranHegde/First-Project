var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');

var UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        lowercase: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    }
});

UserSchema.plugin(titlize, {
    paths: ['name']
});


/*UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, null , null, function (err, hash) {
        if (err) return next(err);
        user.password = hash;
        next();
    });
});

UserSchema.methods.comparePassword = function (password) {
    //return bcrypt.compareSync(password, this.password);
    bcrypt.compare(password, this.password, function (err, res){
                    console.log(res);
                   return res;
    });
    bcrypt.hash(password, null, null, function (err, hash) {
        console.log(hash);
    });
};*/


module.exports = mongoose.model('User', UserSchema);