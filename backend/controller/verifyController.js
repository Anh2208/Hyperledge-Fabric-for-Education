import Student from "../models/Student.js";
import Verify from "../models/Verify.js";
import Result from "../models/Result.js";
import mongoose from "mongoose";
import { Wallets, Gateway } from "fabric-network";
import { buildWallet, buildCCPOrg1 } from "../services/fabric/AppUtil.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

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
export const createVerifyList = async (req, res) => {

    const mssv = req.body.mssv;

    try {
        const student = await Student.findOne({ mssv: mssv });
        const existStudent = await Verify.findOne({ mssv: mssv });
        const results = await Result.find({ studentMS: mssv });
        const check = results.some(result => result.score == undefined); // nếu có 1 kết quả học tập chưa được chấm để -> không thể thêm sinh viên
        //test start
        // const resultData = result.data.data;
        const filteredResults = [];
        let resulttotal = 0;
        let totalAccumulatedCredits = 0;
        let cumulativeGPA = 0;

        if (!existStudent && !check) {
            results.forEach((result) => {
                const existingResult = filteredResults.find((filteredResult) => filteredResult.subjectMS === result.subjectMS);
                if (!existingResult) {
                    filteredResults.push(result);
                    console.log("cinss", result.subjectSotc);
                    resulttotal += parseFloat(result.subjectSotc);
                } else {
                    if (result.score > existingResult.score) {
                        const index = filteredResults.indexOf(existingResult);
                        if (index !== -1) {
                            filteredResults[index] = result;
                        }
                    }
                }
            });
            filteredResults.forEach((result) => {
                totalAccumulatedCredits += (result.score * result.subjectSotc)
            });
            cumulativeGPA = ((totalAccumulatedCredits / resulttotal) * 4 / 10).toFixed(2);
            if (resulttotal <= 5) {
                res.status(400).json({ success: false, message: "Sinh viên chưa tích lũy đủ tín chỉ" });
                return;
            }
            if (cumulativeGPA <= 2) {
                res
                    .status(400)
                    .json({ success: false, message: `Sinh viên chưa đáp ứng được mức điểm xét tốt nghiệp, điểm trung bình hiện tại: ${cumulativeGPA}` });
                return;
            }
            console.log("Kết quả là", filteredResults);
            console.log("Tổng điểm là", ((totalAccumulatedCredits / resulttotal) * 4 / 10).toFixed(2));

        }
        //test end

        if (student == undefined) {
            res.status(400).json({ success: false, message: "Lỗi, mã sinh viên không hợp lệ" });
            return;
        } else {
            if (existStudent) {
                res.status(400).json({ success: false, message: "Lỗi, sinh viên đã tồn tại trong danh sách" });
                return;
            } else if (!existStudent && check) {
                res.status(400).json({ success: false, message: "Không thể tạo, chưa hoàn thành tất cả các học phần" });
                return;
            }
            else {
                const saveStudent = await Verify.create({
                    email: student.email,
                    mssv: student.mssv,
                    class: student.class,
                    name: student.name,
                    date: student.date,
                    sex: student.sex,
                });
                res.status(200).json({ success: true, message: "Thêm sinh viên vào danh sách thành công!!!", data: saveStudent });
            }
        }

    } catch (e) {
        console.log(e);
        res.status(400).json({ success: false, message: "Error create verify list" });
    }

}

export const getVerifyByMSSV = async (req, res) => {

    const mssv = req.query.mssv;

    try {

        const verify = await Verify.findOne({ mssv: mssv });

        if (verify != undefined) {
            res.status(200).json({ success: true, message: "Find verify successfully", data: verify });
        } else {
            res.status(400).json({ success: false, message: "Sinh viên không trong danh sách được cấp bằng" })
        }

    } catch (e) {
        res.status(400).json({ success: false, message: "Lỗi lấy thông tin cần xác thực cấp bằng!!!" });
    }

}

export const updateVerifyList = async (req, res) => {

    const verify = req.body;

    // get identify
    const token = req.cookies.UserToken;
    const user = await getUserFromToken(token);
    try {
        //connect to hyperledger fabric network and contract
        const wallet = await buildWallet(Wallets, walletPath);
        const gateway = new Gateway();
        console.log(user.email)
        await gateway.connect(cppUser, {
            wallet,
            identity: String(user.email),
            discovery: { enabled: true, asLocalhost: true },
        });
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        const existStudent = await Verify.findOne({ mssv: verify.mssv });

        const rector = await contract.evaluateTransaction('CheckRector');

        console.log("JSON.parse(resultJSON.toString());", JSON.parse(rector.toString()));

        if (!existStudent) {
            res.status(400).json({ success: false, message: "Lỗi cập nhật, sinh viên không tồn tại trong danh sách" });
        } else {
            await Verify.findByIdAndUpdate(
                existStudent._id,
                { $set: req.body },
                { new: true },
            );
            res.status(200).json({ success: true, message: "Xác thực cấp bằng sinh viên thành công" });
        }
    } catch (e) {
        let err = '';
        if (e.message.includes("Not a valid User")) {
            err = "Người dùng không thuộc hệ thống";
        } else if (e.message.includes("You do not have permission to perform this function")) {
            err = 'Lỗi, không có quyền thực hiện chức năng này';
        } else if (e.message.includes("Identity not found in walle")) {
            err = 'Lỗi, người dùng không có quyền truy cập vào blockchain';
        } else if (e.message.includes("Error checking rector identification in blockchain")) {
            err = 'Lỗi truy vấn danh tính';
        } else {
            err = e;
        }
        console.log("eeeee", e);
        res.status(500).json({ success: false, message: err });
        // res.status(400).json({ success: false, message: "Error update verify list" });
    }

}

export const getAllList = async (req, res) => {

    try {
        const allStudent = await Verify.find();

        if (allStudent.length > 0) {
            res.status(200).json({ success: true, message: "Lấy danh sách sinh viên thành công", data: allStudent });
        } else if (allStudent.length == 0) {
            res.status(400).json({ success: false, message: "Danh sách sinh viên xác nhận tốt nghiệp rỗng" });
        } else {
            res.status(400).json({ success: false, message: "Lỗi lấy danh sách" });
        }
    } catch (e) {
        console.log(e);
        res.status(400).json({ success: false, message: "Lỗi lấy danh sách" });
    }

}

export const deleteStudentList = async (req, res) => {
    const mssv = req.query.mssv;

    try {

        const verify = await Verify.findOne({ mssv: mssv });
        console.log("dddddd", verify);
        if (verify) {
            await Verify.findByIdAndDelete(verify._id);
            res.status(200).json({ success: true, message: "Xóa sinh viên khỏi danh sách tốt nghiệp thành công" });
        } else {
            res.status(400).json({ success: false, message: "Lỗi xóa sinh viên khỏi danh sách tốt nghiệp" });
        }

    } catch (e) {
        console.log("Lỗi xóa verify", e);
        res.status(400).json({ success: false, message: "Lỗi xóa sinh viên khỏi danh sách tốt nghiệp" });
    }

}

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
