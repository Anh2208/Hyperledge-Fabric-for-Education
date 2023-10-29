import Result from "../models/Result.js";
import Group from "../models/Group.js";
import Subject from "../models/Subject.js";
import mongoose from "mongoose";
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
import Student from "../models/Student.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const walletPath = path.join(__dirname, "..", "wallet");

dotenv.config();
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

  try {
    //connect to hyperledger fabric network and contract
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
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
  } catch (error) {
    session.endSession();
    console.log("loi ne", error);

    res.status(500).json({ success: false, message: `lưu điểm sinh viên thất bại !!!` });
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
  const mssv = req.body.mssv;
  const subjectMS = req.body.subjectMS;
  const id = req.body.id;
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
      "GetResultHistoryByID",
      id
    );
    console.log(`*** Result: ${resultJSON}`);

    console.log(`*** Result: ${prettyJSONString(resultJSON.toString())}`);

    const jsoncompare = JSON.parse(resultJSON.toString());
    console.log("Test ko coas", jsoncompare[0].TxId);

    // const creator = await contract.evaluateTransaction('GetTransactionCreator', jsoncompare[0].TxId);
    // console.log("Test", prettyJSONString(creator.toString()));

    res
      .status(200)
      .json({
        success: true,
        message: "Successful find history Result",
        data: JSON.parse(resultJSON.toString()),
      });
  } catch (err) {
    console.log("err history is ", err)
    res.status(404).json({
      success: false,
      message: "Failed get history result!!!",
    });
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
  const id = req.body.id;
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

  try {
    // check data
    const resultStudent = await Result.findById(id);
    const check = await compareResult(id);

    console.log("check dsadsad", check);

    if (!check) {
      res.status(500).json({
        success: false,
        message: `Kết quả học tập ${resultStudent.subjectMS} của ${resultStudent.studentName} không đồng bộ!!!`,
      });
      return;
    }
    if (check.leng > 0) {
      res.status(500).json({
        success: false,
        message: check,
      });
    }

    //update result in mongodb
    const updateResult = await Result.findByIdAndUpdate(id, { $set: req.body.data }, { new: true, session });

    const saveResult = await Result.findById(updateResult);

    //connect to hyperledger fabric network and contract
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

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

export const updateResultData = async (req, res) => {
  const id = req.body.data._id;
  console.log("Result is : ", req.body.groupID)
  try {
    const updateResult = await Result.findByIdAndUpdate(
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
      $pull: { results: resultID },
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

    await contract.submitTransaction("DeleteResult", resultID);

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

    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);
    let result = await contract.evaluateTransaction("getSingleResult", id);

    let resultBlock = JSON.parse(result.toString());

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
      if (resultBlockString !== resultMongoString) {
        dataIsEqual = false;
        return;
      }
    });

    gateway.disconnect();

    if (dataIsEqual) {
      res.status(200).json({ success: true, result: true });
    } else {
      res.status(200).json({ success: true, result: false });
    }
  } catch (e) {

    let error = "";
    if (e.message.includes("Kết quả không tồn tại")) {
      error = "Kết quả so sánh không tồn tại trong blockchain";
    } else {
      error = e;
    }
    res.status(400).json({ success: false, message: error });
  }
}
// so sánh data resutt mongodb và blockchain
const compareResult = async (id) => {
  // const MS = studentMS.source;
  try {
    const resultMongo = await Result.findById(id);

    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
      wallet,
      identity: String(userId),
      discovery: { enabled: true, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    // let result = await contract.evaluateTransaction("getSingleResult", resultMongo.subjectMS, resultMongo.studentMS);
    let result = await contract.evaluateTransaction("getSingleResult", id);
    console.log(`*** Result: ${prettyJSONString(result.toString())}`);

    const resultBlock = JSON.parse(result.toString());
    if (resultBlock == []) {

    }

    console.log("resultBlock 1 ", resultBlock);
    console.log("resultMongo 2", resultMongo);

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
      console.log("resultBlockString", resultBlockString);
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
      // console.log("Lỗi tạo điểm, kết quả đã tồn tại trong Blockchain");
      error = "Lỗi tạo điểm, kết quả đã tồn tại trong học kỳ này";
    } else if (e.message.includes("Not a valid User")) {
      // console.log("Lỗi tạo điểm, kết quả đã tồn tại trong Blockchain");
      error = "Không có quyền cập nhật điểm!!!";
    } else if (e.message.includes("The grading deadline has expired")) {
      // console.log("Lỗi tạo điểm, kết quả đã tồn tại trong Blockchain");
      error = "Quá hạn ngày nhập điểm!!!";
    } else {
      error = e;
    }
    // console.log("dsad", e);
    return error;
  }
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
