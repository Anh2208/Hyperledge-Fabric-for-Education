import Result from "../models/Result.js";
import Group from "../models/Group.js";
import Subject from "../models/Subject.js";
import mongoose from "mongoose";
import { Wallets, Gateway } from "fabric-network";
import { buildWallet, buildCCPOrg1 } from "../services/fabric/AppUtil.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Student from "../models/Student.js";
import Teacher from "../models/Teacher.js";
import Admin from "../models/Admin.js";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const walletPath = path.join(__dirname, "..", "wallet");
const userId = "appUser";
const channelName = "mychannel";
const chaincodeName = "ledger";
const mspOrg1 = "Org1MSP";
const cppUser = JSON.parse(fs.readFileSync(process.env.ccpPATH, "utf8"));
// create result
function prettyJSONString(inputString) {
  return JSON.stringify(JSON.parse(inputString), null, 2);
}

// create result in block
export const createResultBlock = async (req, res) => {
  const ID = req.body.data._id;

  console.log("Result is : ", req.body.groupID)
  const session = await mongoose.startSession();
  session.startTransaction();

  const token = req.cookies.UserToken;
  const user = await getUserFromToken(token);
  console.log("user in create is", user.email);
  try {

    if (req.body.data.score > 10 || req.body.data.score < 0) {
      res.status(400).json({ success: false, message: 'Điểm không hợp lệ!!!' });
      return;
    }

    //connect to hyperledger fabric network and contract
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
      wallet,
      identity: String(user.email),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    try {
      await Result.findByIdAndUpdate(ID, { $set: req.body.data }, { new: true, session });

      const saveResult = await Result.findById(ID);
      await contract.submitTransaction(
        "CreateResult",
        ID,
        saveResult.groupMa,
        saveResult.subjectMS,
        saveResult.studentMS,
        saveResult.studentName,
        saveResult.teacherMS,
        saveResult.semester,
        req.body.data.score,
        saveResult.date_awarded,
        req.body.access,
      );

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
        success: true,
        message: "Create result successfully!!!",
        data: saveResult,
      });
    } catch (e) {
      let error = "";
      if (e.message.includes("Result exists in blockchain")) {
        // console.log("Lỗi tạo điểm, kết quả đã tồn tại trong Blockchain");
        error = "Lỗi tạo điểm, kết quả đã tồn tại trong học kỳ này";
      }
      if (e.message.includes("Not a valid User")) {
        // console.log("Lỗi tạo điểm, kết quả đã tồn tại trong Blockchain");
        error = "Không có quyền cập nhật điểm!!!";
      }
      if (e.message.includes("The grading deadline has expired")) {
        // console.log("Lỗi tạo điểm, kết quả đã tồn tại trong Blockchain");
        error = "Quá hạn ngày nhập điểm!!!";
      }
      // console.log("dsad", e);
      await session.abortTransaction();
      session.endSession();
      gateway.disconnect();
      res.status(500).json({ success: false, message: error });
    } finally {
      gateway.disconnect();
    }
  } catch (err) {
    session.endSession();
    console.log("loi ne", err);
    if (err.message.includes("Not a valid User") || err.message.includes("Identity not found in wallet")) {
      res.status(400).json({
        success: false,
        message: "Không có quyền ghi điểm!!!",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "lưu điểm sinh viên thất bại !!!",
      });
    }
  }
};

// create result in mongodb
export const createResult = async (req, res) => {
  const groupID = req.params.id;
  // const newResult = new Result({ ...req.body });
  const newResult = new Result(req.body);
  const year = new Date().getFullYear().toString();
  // console.log("groupID is:", groupID);
  try {
    // Check data exists in MongoDB
    const existMongo = await Result.find({
      $and: [
        { subjectMS: req.body.subjectMS },
        { studentMS: req.body.studentMS },
        { semester: req.body.semester },
        { date_awarded: year },
      ],
    });
    console.log("existMongo", existMongo);
    if (existMongo.length > 0) {
      res
        .status(500)
        .json({
          success: false,
          message: "Sinh viên đã đăng ký học phần!!!",
        });
      return;
    }
    const student = await Student.findOne({ mssv: req.body.studentMS });

    if (!student) {
      res.status(400).json({ success: false, message: "Sinh viên không tồn tại!!!" });
      return;
    }

    const saveResult = await newResult.save();
    const subject = await Subject.findOne({ subjectMa: newResult.subjectMS });

    if (student) {
      await Result.findByIdAndUpdate(saveResult._id, {
        studentName: student.name,
        subjectSotc: subject.subjectSotc,
        subjectTen: subject.subjectTen,
      })
    } else {
      res.status(400).json({ success: false, message: "Lỗi lưu trữ" });
      return;
    }
    // update id result of the group
    await Group.findByIdAndUpdate(groupID, {
      $push: { results: saveResult._id },
      $inc: { currentslot: 1 },
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Create Result success",
        data: saveResult,
      });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Create Result Failed, Try again!!!" });
  }
};

// get data in blockchain
// get history result
export const getResultHistory = async (req, res) => {
  const subjectMS = req.body.subjectMS;
  const studentMS = req.body.studentMS;

  const token = req.cookies.UserToken;
  const user = await getUserFromToken(token);

  try {
    const results = await Result.find({
      $and: [
        { subjectMS: req.body.subjectMS },
        { studentMS: req.body.studentMS },
      ],
    });
    if (results == '') {
      res.status(400).json({ success: false, message: "Sinh viên không học học phần này" });
      return;
    }
    // Connect to ledger and contract
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();
    await gateway.connect(cppUser, {
      wallet,
      identity: String(user.email),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    const resultHistory = [];

    for (const result of results) {
      try {
        const resultJSON = await contract.evaluateTransaction(
          "GetResultHistory",
          result.subjectMS,
          result.studentMS,
          result._id,
        );
        console.log("user email is", user.email);

        const jsoncompare = JSON.parse(resultJSON.toString());
        console.log("jsoncompare", jsoncompare);
        if (jsoncompare != '') {
          for (const resulthistory of jsoncompare) {
            resultHistory.push(resulthistory); // Thêm trực tiếp jsoncompare vào mảng
          }
        }
      } catch (e) {
        if (e.message.includes("result does not exist in blockchain")) {
          res.status(400).json({ success: false, message: "Lỗi, học phần chưa được chấm điểm hoặc lỗi dữ liệu" });
          return;
        } else {
          console.log(e);
          res.status(400).json({ success: false, message: "Lỗi truy vấn lịch sử Blockchain" });
          return;
        }

      }
    }

    res.status(200).json({
      success: true,
      message: "Successful find history Result",
      data: resultHistory,
    });

  } catch (err) {
    console.log("err history is ", err)
    if (err.message.includes("Not a valid User") || err.message.includes("Identity not found in wallet")) {
      res.status(400).json({
        success: false,
        message: "Không có quyền truy vấn lịch sử!!!",
      });
    }
    // else if (err.message.includes("result does exist in blockchain")) {
    //   res.status(400).json({
    //     success: false,
    //     message: "Kết quả chưa có điểm hoặc kết quả chưa được lưu vào Blockchain",
    //   });
    // }
    else {
      res.status(400).json({
        success: false,
        message: "Failed get history result l!!!",
      });
    }
  }
};

export const getAllResultByStudentMS = async (req, res) => {
  const MSSV = req.query.mssv;
  try {
    // connect to ledger and contract
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();
    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    const resultJSON = await contract.evaluateTransaction(
      "getAllResultByStudentMS",
      MSSV,
    );

    console.log(`*** Result: ${prettyJSONString(resultJSON.toString())}`);

    res
      .status(200)
      .json({
        success: true,
        message: "Successful find all Result by mssv",
        data: JSON.parse(resultJSON.toString()),
      });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Result by MSSV not found",
    });
  }
};

export const getAllResultByTeacherMS = async (req, res) => {
  const MSGV = req.body.msgv;

  try {
    // connect to ledger and contract
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();
    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    const resultJSON = await contract.evaluateTransaction(
      "getAllResultByTeacherMS",
      MSGV,
    );

    console.log(`*** Result: ${prettyJSONString(resultJSON.toString())}`);

    res
      .status(200)
      .json({
        success: true,
        message: "Successful find all Result by msgv",
        data: JSON.parse(resultJSON.toString()),
      });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Result by MSGV not found",
    });
  }
};

export const getAllResult = async (req, res) => {
  try {
    // connect to ledger and contract
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();
    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    const resultJSON = await contract.evaluateTransaction(
      "getAllResultByType",
      "result",
    );

    console.log(`*** Result: ${prettyJSONString(resultJSON.toString())}`);

    res
      .status(200)
      .json({
        success: true,
        message: "Successful find all Result",
        data: JSON.parse(resultJSON.toString()),
      });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Result not found",
    });
  }
};

export const getDetailGroup = async (req, res) => {

  try {
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    const token = req.cookies.UserToken;
    const user = await getUserFromToken(token);
    await gateway.connect(cppUser, {
      wallet,
      identity: String(user.email),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);


    const result = await Result.findOne({
      $and: [
        { groupMa: req.body.groupMa },
        { subjectMS: req.body.subjectMS },
        { studentMS: req.body.studentMS },
        { semester: req.body.semester },
        { date_awarded: req.body.date_awarded },
      ],
    });
    console.log("result", result);
    if (result == null) {
      res.status(400).json({ success: false, message: "Lỗi, kết quả không tồn tại" });
      return;
    }

    let resultDetail = await contract.evaluateTransaction("getSingleResult", result.subjectMS, result.studentMS, result._id);

    res.status(200).json({ success: true, message: "get result successfully", data: JSON.parse(resultDetail) });

  } catch (e) {
    console.log(e);
    if (e.message.includes("Kết quả không tồn tại")) {
      res.status(400).json({ success: false, message: "Chưa cần thêm quyền!!!" });
      return;
    }
    if (e.message.includes("Identity not found in wallet")) {
      res.status(400).json({ success: false, message: "Lỗi, không có quyền thực hiện chức năng này!!!" });
      return;
    }
    res.status(400).json({ success: false, message: "Get detail group failed" });
  }

}

export const getAllResultByID = async (req, res) => {
  const resultID = req.body.resultID;

  try {
    // connect to ledger and contract
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();
    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    const resultJSON = await contract.evaluateTransaction(
      "getAllResultByID",
      resultID,
    );

    console.log(`*** Result: ${prettyJSONString(resultJSON.toString())}`);

    res
      .status(200)
      .json({
        success: true,
        message: "Successful find all Result by resultID",
        data: JSON.parse(resultJSON.toString()),
      });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Result by resultID not found",
    });
  }
};

export const getAllResultByGroup = async (req, res) => {
  const groupMa = req.body.groupMa;
  const date_awarded = req.body.date_awarded;

  try {
    // connect to ledger and contract
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();
    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    const resultJSON = await contract.evaluateTransaction(
      "getAllResultByGroup",
      groupMa,
      date_awarded,
    );

    console.log(`*** Result: ${prettyJSONString(resultJSON.toString())}`);

    res
      .status(200)
      .json({
        success: true,
        message: "Successful find all result by group",
        data: JSON.parse(resultJSON.toString()),
      });
  } catch (err) {
    res.status(404).json({
      success: false,
      message: "Result by group not found",
    });
  }
};

// get result in mongodb
// get result by id
export const getResultByID = async (req, res) => {
  const id = req.query.id;
  try {
    const result = await Result.findById(id);
    res
      .status(200)
      .json({
        success: true,
        message: "Get result in mongodb successfully!!!",
        data: result,
      });
  } catch (err) {
    res
      .status(404)
      .json({ success: false, message: "Get result in mongdb not found" });
  }
};

// get result by mssv
export const getResultByMSSV = async (req, res) => {
  const studentMS = req.query.studentMS;
  try {
    const result = await Result.find({ studentMS: studentMS });

    res
      .status(200)
      .json({
        success: true,
        message: "Get result in mongodb successfully!!!",
        data: result,
      });
  } catch (err) {
    res
      .status(404)
      .json({ success: false, message: "Get result in mongdb not found" });
  }
};

// get result by mssv
export const getResultByStudentID = async (req, res) => {
  const studentID = req.query.id;
  try {
    const student = await Student.findById(studentID);
    const result = await Result.find({ studentMS: student.mssv });

    res
      .status(200)
      .json({
        success: true,
        message: "Get result in mongodb successfully!!!",
        data: result,
      });
  } catch (err) {
    res
      .status(404)
      .json({ success: false, message: "Get result in mongdb not found" });
  }
};

// get data by msgv
export const getResultByMSGV = async (req, res) => {
  const teacherMS = req.body.teacherMS;

  try {
    const result = await Result.find({ teacherMS: teacherMS });
    res
      .status(200)
      .json({
        success: true,
        message: "Get result in mongodb successfully!!!",
        data: result,
      });
  } catch (err) {
    res
      .status(404)
      .json({ success: false, message: "Get result in mongdb not found" });
  }
};

export const getResultByGroup = async (req, res) => {
  const groupMa = req.body.groupMa;

  try {
    const result = await Result.find({ groupMa: groupMa });
    res
      .status(200)
      .json({
        success: true,
        message: "Get result in mongodb successfully!!!",
        data: result,
      });
  } catch (err) {
    res
      .status(404)
      .json({ success: false, message: "Get result in mongdb not found" });
  }
};

// update result
export const updateResult = async (req, res) => {
  const id = req.body.data._id;
  console.log("course is", req.body.data);
  const session = await mongoose.startSession();
  session.startTransaction();

  const token = req.cookies.UserToken;
  const user = await getUserFromToken(token);

  try {
    //connect to hyperledger fabric network and contract
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
      wallet,
      identity: String(user.email),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    if (req.body.data.score > 10 || req.body.data.score < 0) {
      res.status(400).json({ success: false, message: 'Điểm không hợp lệ!!!' });
      return;
    }

    // check data
    const resultStudent = await Result.findById(id);
    const check = await compareResult(id);

    if (!check) {
      res.status(500).json({
        success: false,
        message: `Kết quả học tập ${resultStudent.subjectMS} của ${resultStudent.studentName} không đồng bộ!!!`,
      });
      return;
    }
    if (check.length > 0) {
      res.status(500).json({
        success: false,
        message: check,
      });
      return;
    }

    //update result in mongodb
    const updateResult = await Result.findByIdAndUpdate(id, { $set: req.body.data }, { new: true, session });

    await Result.findById(updateResult);

    // update result in blockchain
    await contract.submitTransaction(
      "UpdateResult",
      id,
      req.body.data.groupMa,
      req.body.data.subjectMS,
      req.body.data.studentMS,
      req.body.data.studentName,
      req.body.data.teacherMS,
      req.body.data.semester,
      req.body.data.score,
      req.body.data.date_awarded,
      req.body.access,
    );

    // hoàn tất cập nhật và tắt kết nối
    await session.commitTransaction();
    session.endSession();
    gateway.disconnect();

    res.status(200).json({
      success: true,
      message: "Update result successfuly!!!",
      data: updateResult,
    });
  } catch (e) {
    let error = "";
    if (e.message.includes("Result does not exists in blockchain")) {
      error = "Lỗi tạo điểm, kết quả không tồn tại trong học kỳ này";
    } else if (e.message.includes("Not a valid User")) {
      error = "Không có quyền cập nhật điểm!!!";
    } else if (e.message.includes("The grading deadline has expired")) {
      error = "Quá hạn ngày nhập điểm!!!";
    } else {
      error = e.message;
    }
    await session.abortTransaction();
    session.endSession();
    // console.log("dsad", error);

    res.status(400).json({ success: false, message: error });
  }
};

export const grantAccessResult = async (req, res) => {// cập nhật quyền chỉnh sửa điểm của giảng viên

  const token = req.cookies.UserToken;
  const user = await getUserFromToken(token);

  const teacher = await Teacher.findOne({ email: req.body.email });
  const admin = await Admin.findOne({ email: req.body.email });

  try {

    if (teacher == null && admin == null) {
      res.status(400).json({ success: false, message: "Lỗi, Email Quản trị viên hoặc Giảng viên không tồn tại" });
      return;
    }

    //connect to hyperledger fabric network and contract
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
      wallet,
      identity: String(user.email),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    await contract.submitTransaction('grantAccessResult', req.body.resultID, req.body.subjectMS, req.body.studentMS, req.body.email);

    gateway.disconnect();

    res.status(200).json({ success: true, message: "Thêm danh tính thành viên chỉnh sửa điểm thành công" });

  } catch (e) {
    let err = '';
    if (e.message.includes("Not a valid User")) {
      err = "Người dùng không thuộc hệ thống";
    } else if (e.message.includes("You do not have permission to perform this function")) {
      err = 'Lỗi, không có quyền thực hiện chức năng này';
    } else if (e.message.includes("MS does exists in permissionGranted")) {
      err = 'Lỗi, mã số đã tồn tại trong danh sách';
    } else {
      err = e;
    }
    console.log("eeeee", e);
    res.status(400).json({ success: false, message: err });
  }

}

export const revokeAccessResult = async (req, res) => {// cập nhật quyền chỉnh sửa điểm của giảng viên

  const token = req.cookies.UserToken;
  const user = await getUserFromToken(token);
  console.log(req.body);
  try {

    //connect to hyperledger fabric network and contract
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
      wallet,
      identity: String(user.email),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    await contract.submitTransaction('revokeAccessResult', req.body.resultID, req.body.subjectMS, req.body.studentMS, req.body.email);

    gateway.disconnect();

    res.status(200).json({ success: true, message: "Thêm danh thành viên chỉnh sửa điểm thành công" });

  } catch (e) {
    let err = '';
    if (e.message.includes("Not a valid User")) {
      err = "Người dùng không thuộc hệ thống";
    } else if (e.message.includes("You do not have permission to perform this function")) {
      err = 'Lỗi, không có quyền thực hiện chức năng này';
    } else if (e.message.includes("MS does not exists in permissionGranted")) {
      err = 'Lỗi, mã số không tồn tại trong danh sách';
    } else {
      err = e;
    }
    console.log("eeeee", e);
    res.status(400).json({ success: false, message: err });
  }

}

export const updateResultData = async (req, res) => {
  const id = req.body.data._id;
  console.log("Result is : ", req.body.groupID)
  try {
    await Result.findByIdAndUpdate(
      id,
      { $set: req.body.data },
      { new: true },
      req.body
    )

    res.status(200).json({ success: true, message: "Cập nhật dữ liệu kết quả thành công" });
  } catch (err) {
    res.status(400).json({ success: false, message: "Cập nhật dữ liệu kết quả thất bại" });
  }
}

// delete result
export const deleteResult = async (req, res) => {
  const GroupID = req.params.id;

  let groupMa = req.body.groupMa;
  let studentMS = req.body.studentMS;
  // const test = await Result.find({ groupMa: groupMa, studentMS: studentMS });
  const ResultDelete = await Result.findOne({
    groupMa: groupMa,
    studentMS: studentMS,
  });
  const resultID = ResultDelete._id;

  try {
    // delete result from group
    await Group.findByIdAndUpdate(GroupID, {
      $pull: { results: resultID, $inc: { currentslot: -1 }, },
    });
    // delete result in mongodb
    await Result.findByIdAndDelete(resultID);
    // delete result from
    // connect to contract
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    await contract.submitTransaction("DeleteResult", ResultDelete.subjectMS, ResultDelete.studentMS, resultID);

    gateway.disconnect();

    res.status(200).json({
      success: true,
      message: "Successfully deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "failed to delete",
    });
  }
};


// delete result
export const deleteResultDB = async (req, res) => {
  const GroupID = req.params.id;

  let groupMa = req.body.groupMa;
  let studentMS = req.body.studentMS;
  const test = await Result.find({ groupMa: groupMa, studentMS: studentMS });
  const ResultDelete = await Result.findOne({
    groupMa: groupMa,
    studentMS: studentMS,
  });
  const resultID = ResultDelete._id;

  try {
    // delete result from group
    await Group.findByIdAndUpdate(GroupID, {
      $pull: { results: resultID },
      $inc: { currentslot: -1 },
    });
    // delete result in mongodb
    await Result.findByIdAndDelete(resultID);

    res.status(200).json({
      success: true,
      message: "Successfully deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "failed to delete",
    });
  }
};
export const confirmResult = async (req, res) => {
  const id = req.params.id;

  try {
    const resultMongo = await Result.findById(id);

    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    const token = req.cookies.UserToken;
    const user = await getUserFromToken(token);
    const teacher = await Teacher.findById(user.id);
    if (teacher != undefined) {
      await gateway.connect(cppUser, {
        wallet,
        identity: String(userId),
        discovery: { enabled: true, asLocalhost: true },
      });
    } else {
      await gateway.connect(cppUser, {
        wallet,
        identity: String(user.email),
        discovery: { enabled: true, asLocalhost: true },
      });
    }
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    // let result = await contract.evaluateTransaction("getSingleResult", resultMongo.subjectMS, resultMongo.studentMS);
    let result = await contract.evaluateTransaction("GetResultHistory", resultMongo.subjectMS, resultMongo.studentMS);
    console.log(`*** Result: ${prettyJSONString(result.toString())}`);

    const resultBlock = JSON.parse(result.toString());
    // console.log("resultBlock 1 ", resultBlock);
    // console.log("resultMongo 2", resultMongo);

    // so sánh 2 bên dữ liệu
    const fieldsToCompare = [
      "groupMa",
      "subjectMS",
      "studentMS",
      "teacherMS",
      "semester",
      "score",
      "date_awarded",
    ];

    // Duyệt qua từng trường trong resultMongo
    let dataExist = true;
    const dataIsEqual = fieldsToCompare.every((field) =>
      resultBlock.some((result) =>
        (result.Value[field] == resultMongo[field])
        &&
        (
          new Date(result.Timestamp).toDateString() === new Date(resultMongo.createdAt).toDateString() ||
          new Date(result.Timestamp).toDateString() === new Date(resultMongo.updatedAt).toDateString()
        )
      )
    );
    if (resultMongo.score == undefined && resultBlock != '') {// kiểm tra 2 bên đều tồn tại dữ liệu hay không?
      dataExist = false;
    }
    // console.log("dataIsEqual", dataIsEqual);

    gateway.disconnect();

    if (dataIsEqual && dataExist) {
      res.status(200).json({ success: true, result: true });
    } else if ((resultBlock == '' && resultMongo.score == undefined)) {
      // console.log("dasdsahgjhhjhcxzhjhbjk");
      res.status(200).json({ success: true, message: "Error data, data mongodb is none but data in block exists" });
    } else {
      res.status(200).json({ success: true, result: false });
    }
  } catch (e) {
    console.log("resdasd", e);
    let error = "";
    if (e.message.includes("Kết quả không tồn tại")) {
      error = "Kết quả so sánh không tồn tại trong blockchain";
    } else if (e.message.includes("Not a valid User") || e.message.includes("Identity not found in wallet")) {
      error = "Không có quyền truy vấn lịch sử!!"
    } else {
      error = e;
    }
    res.status(400).json({ success: false, message: error });
  }
}

export const checkResult = async (req, res) => {
  const id = req.params.id;

  const resultMongo = await Result.findById(id);
  try {
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    const token = req.cookies.UserToken;
    const user = await getUserFromToken(token);
    const teacher = await Teacher.findById(user.id);
    const student = await Student.findById(user.id);
    if (teacher != undefined || student != undefined) {
      await gateway.connect(cppUser, {
        wallet,
        identity: String(userId),
        discovery: { enabled: true, asLocalhost: true },
      });
    } else {
      await gateway.connect(cppUser, {
        wallet,
        identity: String(user.email),
        discovery: { enabled: true, asLocalhost: true },
      });
    }

    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    let result = await contract.evaluateTransaction("getSingleResult", resultMongo.subjectMS, resultMongo.studentMS, id);

    const resultBlock = JSON.parse(result.toString());
    // so sánh 2 bên dữ liệu
    const fieldsToCompare = [
      "groupMa",
      "subjectMS",
      "studentMS",
      "teacherMS",
      "semester",
      "score",
      "date_awarded",
    ];

    let dataIsEqual = true;
    fieldsToCompare.forEach((field) => {
      const resultBlockString = String(resultBlock[field]);
      const resultMongoString = String(resultMongo[field]);
      // console.log("resultBlockString", resultBlockString);
      if (resultBlockString !== resultMongoString) {
        dataIsEqual = false;
        return;
      }
    });
    // console.log("dataIsEqual", dataIsEqual);

    gateway.disconnect();
    if (dataIsEqual) {
      res.status(200).json({ success: true, result: true });
    } else {
      console.log("resultBlock.Value.score", resultBlock.score);
      res.status(200).json({ success: true, result: dataIsEqual, scoreBlock: resultBlock.score });
    }

  } catch (e) {
    console.log(e);
    if (resultMongo.score == undefined && e.message.includes("Kết quả không tồn tại")) {
      res.status(200).json({ success: false, result: true });
      return;
    }
    if (resultMongo.score != undefined && e.message.includes("Kết quả không tồn tại")) {
      res.status(200).json({ success: false, result: false });
      return;
    }
    let err = '';
    if (e.message.includes("Identity not found in wallet")) {
      err = "Không có quyền kiểm tra và in điểm";
    } else {
      err = e
    }
    res.status(400).json({ success: false, message: err });
  }
};

export const checkAllResult = async (req, res) => {
  const group = req.body.data;
  try {
    console.log("group is", group);

    for (let i = 0; i < group.length; i++) {
      let key = true;
      for (let x = 0; x < group[i].results.length; x++) {
        // console.log("dadadad", group[i].results[x]);
        if (group[i].results[x].score != undefined) {
          const check = await compareResult(group[i].results[x]._id);
          console.log("check", check);
          if (check == 'Lỗi dữ liệu, không đồng bộ' || check == false) {
            key = false;
          }
        }
      }
      group[i].synchronized = key;
    }

    res.status(200).json({ success: true, message: 'taaaaa', data: group });

  } catch (e) {
    res.status(400).json({ success: false, message: e });
  }
};

// so sánh data resutt mongodb và blockchain
const compareResult = async (id) => {
  // const MS = studentMS.source;
  try {
    const resultMongo = await Result.findById(id);
    // const token = req.cookies.UserToken;
    // const user = await getUserFromToken(token);

    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    let result = await contract.evaluateTransaction("getSingleResult", resultMongo.subjectMS, resultMongo.studentMS, id);

    // console.log(`*** Result: ${prettyJSONString(result.toString())}`);

    const resultBlock = JSON.parse(result.toString());

    // so sánh 2 bên dữ liệu
    const fieldsToCompare = [
      "groupMa",
      "subjectMS",
      "studentMS",
      "teacherMS",
      "semester",
      "score",
      "date_awarded",
    ];

    let dataIsEqual = true;

    fieldsToCompare.forEach((field) => {
      const resultBlockString = String(resultBlock[field]);
      const resultMongoString = String(resultMongo[field]);
      // console.log("resultBlockString", resultBlockString);
      if (resultBlockString !== resultMongoString) {
        dataIsEqual = false;
        return;
      }
    });

    gateway.disconnect();
    return dataIsEqual;
  } catch (e) {

    let error = "";
    if (e.message.includes("Result exists in blockchain")) {
      error = "Lỗi tạo điểm, kết quả đã tồn tại trong học kỳ này";
    } else if (e.message.includes("Not a valid User")) {
      error = "Không có quyền cập nhật điểm";
    } else if (e.message.includes("Kết quả không tồn tại")) {
      error = "Lỗi dữ liệu, không đồng bộ";
    } else if (e.message.includes("The grading deadline has expired")) {
      error = "Quá hạn ngày nhập điểm";
    } else {
      error = e;
    }
    // console.log("dsad", e);
    return error;
  }
};


// Hàm lấy thông tin user từ token
const getUserFromToken = (token) => {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject("Token is missing");
    } else {
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
          reject("Token is invalid");
        } else {
          resolve(user);
        }
      });
    }
  });
};


// // get result in blockchain
// export const getResultBlock = async (req, res) => {
//     const resultID = req.body.id;
//     // const MS = studentMS.source;
//     const resultMongo = await Result.findById(resultID);

//     const wallet = await buildWallet(Wallets, walletPath);
//     const gateway = new Gateway();

//     await gateway.connect(cppUser, {
//         wallet,
//         identity: String(userId),
//         discovery: { enabled: true, asLocalhost: true }
//     });
//     const network = await gateway.getNetwork(channelName);
//     const contract = network.getContract(chaincodeName);
//     try {

//         // let resultblock = await contract.evaluateTransaction('ReadResultByMS', studentMS);
//         // console.log("studentMS", resultblock)
//         console.log('\n--> Evaluate Transaction: ReadStudent, function returns information about a student with ID (B1906425)');
//         let result = await contract.evaluateTransaction('getResultByID', resultID);

//         console.log(`*** Result: ${prettyJSONString(result.toString())}`);

//         const resultBlock = JSON.parse(result.toString());

//         // so sánh 2 bên dữ liệu
//         const fieldsToCompare = ['groupMa', 'subjectMS', 'studentMS', 'teacherMS', 'semester', 'score', 'date_awarded'];

//         let dataIsEqual = true;
//         let i = 1;
//         fieldsToCompare.forEach(field => {
//             const resultBlockString = String(resultBlock[field]);
//             const resultMongoString = String(resultMongo[field]);
//             if (resultBlockString !== resultMongoString) {
//                 dataIsEqual = false;
//                 return;
//             }
//         });

//         res.status(200).json({
//             success: true,
//             message: "Find result by studentMS in Blockchain successfully",
//             data: resultBlock,
//         });
//         gateway.disconnect();
//     } catch (error) {
//         res.status(404).json({
//             success: false,
//             message: "result of studentMS not found",
//         });
//     } finally {
//         gateway.disconnect();
//     }
// };
