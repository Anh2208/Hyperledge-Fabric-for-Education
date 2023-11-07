import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Admin from "../models/Admin.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { create_user } from "./hyperledgerController.js";

import { Wallets, Gateway } from "fabric-network";
import FabricCAServices from "fabric-ca-client";
import {
  enrollAdmin,
  buildCAClient,
  registerAndEnrollUser,
} from "../services/fabric/enrollment.js";
import { buildWallet, buildCCPOrg1 } from "../services/fabric/AppUtil.js";

import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const walletPath = path.join(__dirname, "..", "wallet");

dotenv.config();
const userId = "admin";
const channelName = "mychannel";
const chaincodeName = "ledger";
const mspOrg1 = "Org1MSP";
const cppUser = JSON.parse(fs.readFileSync(process.env.ccpPATH, "utf8"));

function prettyJSONString(inputString) {
  return JSON.stringify(JSON.parse(inputString), null, 2);
}
//create new student
export const createStudent = async (req, res) => {

  try {
    // connect sdk
    // const wallet = await buildWallet(Wallets, walletPath);
    // const gateway = new Gateway();

    // await gateway.connect(cppUser, {
    //   wallet,
    //   identity: String(userId),
    //   discovery: { enabled: true, asLocalhost: true },
    // });
    // const network = await gateway.getNetwork(channelName);
    // const contract = network.getContract(chaincodeName);

    // // check user exists
    // const checkLedger = (
    //   await contract.evaluateTransaction("CheckUserLedger", req.body.email)
    // ).toString("utf8");
    // const checkWallet = await wallet.get(req.body.email, 'student');

    // let saveStudent = await Student.create({
    //   email: req.body.email,
    //   mssv: req.body.mssv,
    //   name: req.body.name,
    //   sex: req.body.sex,
    //   password: req.body.password,
    // });

    // if (checkLedger || checkWallet) {
    //   res
    //     .status(500)
    //     .json({
    //       success: false,
    //       message: "Failed to create student. User exists!!!",
    //     });
    //   return;
    // }

    // console.log("Create student in mongodb successfully");

    // const studentID = saveStudent._id;
    // const studentPass = saveStudent.password;

    // await registerStudentInLedger(req, studentID, studentPass); //problem

    // console.log("Create student in blockchain successfully");

    // const publicKey = await create_user(req.body.email);

    // await Student.findByIdAndUpdate(studentID, {
    //   $set: { publicKey: publicKey },
    // });

    let createStudent = new Student(req.body);

    const saveStudent = await createStudent.save();

    console.log("Create student successfully");

    res
      .status(200)
      .json({
        success: true,
        message: "Create student successfully!!!",
        data: saveStudent,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to create student. Try again" });
  }
};

// create new Teacher
export const createTeacher = async (req, res) => {
  try {
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    // // check user exists
    const checkLedger = (
      await contract.evaluateTransaction("CheckUserLedger", req.body.email)
    ).toString("utf8");
    const checkWallet = await wallet.get(req.body.email);

    let saveTeacher = await Teacher.create({
      email: req.body.email,
      msgv: req.body.msgv,
      name: req.body.name,
      sex: req.body.sex,
      password: req.body.password,
    });

    if (checkLedger || checkWallet) {
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to create teacher. User exists!!!",
        });
      return;
    }

    console.log("Create teacher in mongodb successfully");

    const teacherID = saveTeacher._id;
    const teacherPass = saveTeacher.password;

    await registerTeacherInLedger(req, teacherID, teacherPass);

    console.log("Create teacher in blockchain successfully");

    const publicKey = await create_user(req.body.email, "teacher");

    await Teacher.findByIdAndUpdate(teacherID, {
      $set: { publicKey: publicKey },
    });

    console.log("Create teacher in wallet successfully");

    res
      .status(200)
      .json({
        success: true,
        message: "Create teacher successfully!!!",
        data: saveTeacher,
      });
  } catch (error) {
    console.error(error); // Log lỗi vào console
    res
      .status(500)
      .json({ success: false, message: "Failed to create teacher. Try again" });
  }
};

// create admin for department
export const createAdmin = async (req, res) => {
  try {
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
      discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    // check user exists
    const checkLedger = (
      await contract.evaluateTransaction("CheckUserLedger", req.body.email)
    ).toString("utf8");
    const checkWallet = await wallet.get(req.body.email, 'admin');

    let saveAdmin = await Admin.create({
      adminMS: req.body.adminMS,
      email: req.body.email,
      name: req.body.name,
      sdt: req.body.sdt,
      date: req.body.date,
      password: req.body.password,
    });

    if (checkLedger || checkWallet) {
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to create admin. User exists!!!",
        });
      return;
    }

    console.log("Create teacher in mongodb successfully");

    const adminID = saveAdmin._id;
    const adminPass = saveAdmin.password;

    await registerAdminInLedger(req, adminID, adminPass);

    console.log("Create teacher in blockchain successfully");

    const publicKey = await create_user(req.body.email, 'admin');

    await Admin.findByIdAndUpdate(adminID, {
      $set: { publicKey: publicKey },
    });

    console.log("Create teacher in wallet successfully");

    res
      .status(200)
      .json({
        success: true,
        message: "Create admin successfully!!!",
        data: saveAdmin,
      });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to create admin. Try again" });
  }
};

// student login
export const userLogin = async (req, res) => {
  const email = req.body.email;
  const role = req.body.role;
  try {
    const userModel = role === "Student" ? Student : role === "Teacher" ? Teacher : Admin;
    const user = await userModel.findOne({ email });

    //if student doesn't exit
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng hoặc chọn sai vai trò" });
    }
    const checkCorrectPassword = await bcrypt.compare(
      req.body.password,
      user.password,
    );

    // if password is incorrect
    if (!checkCorrectPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Email hoặc mật khẩu chưa đúng" });
    }

    //create token
    const { password, ...rest } = user._doc;

    // create jwt token
    const token = jwt.sign(
      { id: user._id, email: email },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15d" }
    );

    // set token in the browser cookies and send the response to the client
    res
      .cookie("UserToken", token, {
        httpOnly: true,
        expires: token.expiresIn,
      })
      .status(200)
      .json({
        token,
        data: { ...rest, role },//thêm role vào jwt
      });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Failed to user login" });
  }
};

// register user to ledger blockchain
async function registerStudentInLedger(req, ID, Pass) {
  try {
    // connect sdk
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    // Submit the specified transaction.
    // const test = (await contract.evaluateTransaction('CheckUserLedger',req.body.email)).toString('utf8');

    await contract.submitTransaction(
      "CreateStudent",
      ID,
      req.body.email,
      req.body.mssv,
      req.body.name,
      req.body.sex,
      Pass,
    );

    // Disconnect from the gateway.
    gateway.disconnect();
  } catch (error) {
    console.log(
      ` ... Failed to submit Transaction to the ledger ${error} ... `,
    );
  }
}

async function registerTeacherInLedger(req, ID, Pass) {
  try {
    // connect sdk
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    // Submit the specified transaction.

    await contract.submitTransaction(
      "CreateTeacher",
      ID,
      req.body.email,
      req.body.msgv,
      req.body.name,
      req.body.sex,
      Pass,
    );

    // Disconnect from the gateway.
    gateway.disconnect();
  } catch (error) {
    console.log(
      ` ... Failed to submit Transaction to the ledger ${error} ... `,
    );
  }
}

async function registerAdminInLedger(req, ID, Pass) {
  try {
    // connect sdk
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    // Submit the specified transaction.

    await contract.submitTransaction(
      "CreateAdmin",
      ID,
      req.body.email,
      req.body.adminMS,
      req.body.name,
      req.body.date,
      req.body.sdt,
      Pass,
    );

    // Disconnect from the gateway.
    gateway.disconnect();
  } catch (error) {
    console.log(
      ` ... Failed to submit Transaction to the ledger ${error} ... `,
    );
  }
}

export const getStudentByID = async (req, res) => {
  const id = req.params.id;
  try {

    const user = await Student.findById(id);

    res.status(200).json({ success: 200, message: "find user successfully.", data: user });

  } catch (err) {
    res.status(400).json({ success: false, message: "Failed get user by ID, try again" });
  }
}


export const getStudentByMSSV = async (req, res) => {
  const mssv = req.query.mssv;
  try {

    const user = await Student.findOne({ mssv: mssv });

    res.status(200).json({ success: 200, message: "find user successfully.", data: user });

  } catch (err) {
    res.status(400).json({ success: false, message: "Failed get user by MSSV, try again" });
  }
}