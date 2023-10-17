import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const adminScheme = new mongoose.Schema({
  adminMS: {
    type: String,
    required: true,
  },
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
  name: {
    type: String,
    required: true,
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
  password: {
    type: String,
    required: true,
    minlength: 2,
  },
  publicKey: {  //hex value of key
    type: String,
    // required: true,
    // unique: true,
    // minlength: 10
}
});

adminScheme.statics.saltAndHashPassword = async function (password) {
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

adminScheme.pre("save", async function (next) {
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

const Admin = mongoose.model("Admin", adminScheme);
Admin.createIndexes();

export default Admin;
