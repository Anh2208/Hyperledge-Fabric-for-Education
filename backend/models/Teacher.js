// const mongoose = require('mongoose');
// const validator = require('validator');
// const bcrypt = require('bcryptjs');

import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const teacherSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    validate: {
      validator: validator.isEmail,
      message: "{VALUE} is not a valid email",
    },
  },
  msgv: {
    type: String,
    require: true,
    // minlength: 8,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sex: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 2,
  },
  // dateofbirth: {
  //     type: Date,
  //     required: true,
  // },
  publicKey: {  //hex value of key
    type: String,
    // required: true,
    // unique: true,
    // minlength: 10
}
});

teacherSchema.statics.saltAndHashPassword = async function (password) {
  //mã hóa và hash mật khẩu

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, function (err, hash) {
      if (err) {
        reject(err);
      }
      resolve(hash);
    });
  });
};

teacherSchema.statics.validateByCredentials = function (email, password) {
  //check password
  let User = this;

  return User.findOne({ email }).then((user) => {
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

teacherSchema.pre("save", async function (next) {
  //check password when save create student and save in db
  let user = this;
  //isModified(password) returns true if in this database update the password was modified.
  //We only resalt the password if the password was modified. Otherwise password is already salted.

  if (user.isModified("password")) {
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

let Teacher = mongoose.model("Teacher", teacherSchema);

// module.exports = Teacher;
export default Teacher;
