var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var titlize = require('mongoose-title-case');
var validate = require('mongoose-validator');

//User Name Validator
var nameValidator = [
  validate({
        validator: 'matches',
        arguments: /^[a-zA-Z ]+$/,
        message: 'No Special Characters except Space'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 20],
        message: 'Name should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

//E-mail Validator
var emailValidator = [
  validate({
        validator: 'isEmail',
        message: 'Not a Valid Email'
    }),
    validate({
        validator: 'isLength',
        arguments: [5, 50],
        message: 'Email should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

//Username Validator
var usernameValidator = [
  validate({
        validator: 'isAlphanumeric',
        message: 'Username should contain only Alphabets & Numerals'
    }),
    validate({
        validator: 'isLength',
        arguments: [3, 25],
        message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

//Password Validator
var passwordValidator = [
     validate({
        validator: 'isLength',
        arguments: [8, 25],
        message: 'Password should be between {ARGS[0]} and {ARGS[1]} characters'
    })
];

//User Mongoose Schema
var UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        validate: nameValidator
    },
    username: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
        validate: usernameValidator
    },
    password: {
        type: String,
        required: true,
        validate: passwordValidator,
        select: false
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        validate: emailValidator
    },
    active: {
        type: Boolean,
        required: true,
        default: false
    },
    temptoken: {
        type: String,
        required: true
    },
    resettoken: {
        type: String,
        required: false
    },
    permission: {
        type: String,
        required: true,
        default: 'user'
    }
});

//Mongoose Plugin to change fields to title case
UserSchema.plugin(titlize, {
    paths: ['name']
});

module.exports = mongoose.model('User', UserSchema);