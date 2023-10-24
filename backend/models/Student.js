// const mongoose = require('mongoose');
// const validator = require('validator');
// const bcrypt = require('bcryptjs');

import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema({
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
  mssv: {
    type: String,
    require: true,
    minlength: 8,
  },
  class: {
    type: String,
    require: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sdt: {
    type: String,
    validate: {
      validator: function (value) {
        // Sử dụng regex để kiểm tra số điện thoại bắt đầu bằng 0 và có đúng 10 số.
        return /^0\d{9}$/.test(value);
      },
      message:
        "Số điện thoại không hợp lệ, số điện thoại phải bắt đầu bằng 0 và có đúng 10 số.",
    },
  },
  date: {
    type: String,
    required: true,
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
  // publicKey: {  //hex value of key
  //   type: String,
  //   // required: true,
  //   // unique: true,
  //   // minlength: 10
  // }
});

studentSchema.statics.saltAndHashPassword = async function (password) {
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

studentSchema.statics.validateByCredentials = function (email, password) {
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

studentSchema.pre("save", async function (next) {
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

let Student = mongoose.model("Student", studentSchema);
Student.createIndexes();

// module.exports = Student;
export default Student;
