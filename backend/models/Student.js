// const mongoose = require('mongoose');
// const validator = require('validator');
// const bcrypt = require('bcryptjs');

import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs"

const studentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    mssv: {
        type: String,
        require: true,
        minlength: 8,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,

    },
    password: {
        type: String,
        required: true,
        minlength: 2
    },
    // dateofbirth: {
    //     type: Date,
    //     required: true,
    // },

    // publicKey: {  //hex value of key
    //     type: String,
    //     required: true,
    //     unique: true,
    //     minlength: 10
    // }


});

studentSchema.statics.saltAndHashPassword = async function (password) { //mã hóa và hash mật khẩu

    return new Promise( (resolve, reject) => {
        bcrypt.hash(password, 10, function(err, hash) {
            if (err) {
                reject(err);
            }
            resolve(hash);
        });
    })

};

studentSchema.statics.validateByCredentials = function (email, password) {//check password
    let User = this;

    return User.findOne({email}).then((user) => {
        if (!user) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            // Use bcrypt.compare to compare password and user.password
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    //Login was successful. Signals a successful login. Update
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
};


studentSchema.pre('save', async function (next) {//check password when save create student and save in db
    let user = this;
    //isModified(password) returns true if in this database update the password was modified.
    //We only resalt the password if the password was modified. Otherwise password is already salted.

    if (user.isModified('password')) {

        try {
            let hash = await user.schema.statics.saltAndHashPassword(this.password);
            user.password = hash;
        } catch (e) {
            return next();
        }
    } else {
        return next();
    }
});


studentSchema.index({"email" : 1}, {unique: true});// tạo chỉ mục, đảm bảo email là duy nhất
studentSchema.index({"mssv" : 1}, {unique: true});// tạo chỉ mục, đảm bảo mã số sinh viên (mssv) là duy nhất
let Student = mongoose.model("Student", studentSchema);
Student.createIndexes();

// module.exports = Student;
export default Student;

