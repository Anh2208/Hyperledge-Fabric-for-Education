import mongoose from "mongoose";
import { Wallets, Gateway } from "fabric-network";
import { buildWallet, buildCCPOrg1 } from "../services/fabric/AppUtil.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import Degree from "../models/Degree.js";
import { Web3Storage } from 'web3.storage';
import { getFilesFromPath } from 'web3.storage';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const walletPath = path.join(__dirname, "..", "wallet");
const userId = "appUser";
const channelName = "mychannel";
const chaincodeName = "ledger";
const mspOrg1 = "Org1MSP";
const cppUser = JSON.parse(fs.readFileSync(process.env.ccpPATH, "utf8"));


export const createDegree = async (req, res) => {
    let degree = req.body;
    const base64Image = req.body.image;
    let classification = ''

    //  Lấy dữ liệu và đẩy lên ipfs server
    const tempFileName = "temp_image";
    fs.writeFileSync(tempFileName, Buffer.from(base64Image));
    const client = new Web3Storage({ token: process.env.Web3Token });
    const files = await getFilesFromPath(tempFileName);

    // create session
    const session = await mongoose.startSession();
    session.startTransaction();

    // get identify
    const token = req.cookies.UserToken;
    const user = await getUserFromToken(token);
    // console.log("user in create is", user.email);
    // console.log("image result is ", req.body.image);

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
        const exist = await contract.evaluateTransaction('DegreeExists', degree.studentMS, degree.major);
        if (exist.toString() == true) {
            res.status(400).json({ success: false, message: "Lỗi: Bằng cần tạo dã tồn tại trong Blockchain" });
            return;
        }
        if (degree.score && degree.score >= 3.6 && degree.score <= 4) {
            classification = 'Xuất sắc';
        } else if (degree.score >= 3.2 && degree.score < 3.6) {
            classification = 'Giỏi';
        } else if (degree.score >= 2.5 && degree.score < 3.2) {
            classification = 'Khá';
        } else {
            classification = 'Trung bình';
        }

        const existingDegree = await Degree.findOne({ $or: [{ code: degree.code }, { inputbook: degree.inputbook }] });
        const rootCid = await client.put(files);
        console.log("CID của tệp đã tải lên Web3Storage:", rootCid);
        fs.unlinkSync(tempFileName);
        if (existingDegree) {
            await session.abortTransaction();
            session.endSession();
            gateway.disconnect();
            res.status(400).json({ success: false, message: "Lỗi: Số hiệu hoặc số vào sổ đã tồn tại" });
            return;
        }

        // Thử thực hiện giao dịch trên ledger
        await contract.submitTransaction(
            "createDegree",
            'Đại Học Cần Thơ',
            (degree.degreeType),
            (degree.major),
            (degree.studentMS),
            (degree.studentName),
            (degree.studentDate),
            (degree.score),
            classification,
            (degree.formOfTraining),
            (degree.code),
            (degree.inputbook),
            (rootCid),
        );
        console.log("Degree created on the ledger");

        const saveDegree = await Degree.create({
            university: 'Đại học Cần Thơ',
            degreeType: degree.degreeType,
            major: degree.major,
            studentMS: degree.studentMS,
            studentName: degree.studentName,
            studentDate: degree.studentDate,
            score: degree.score,
            classification: classification,
            formOfTraining: degree.formOfTraining,
            code: degree.code,
            inputbook: degree.inputbook,
            image: degree.image,
        });

        await session.commitTransaction();
        session.endSession();
        gateway.disconnect();
        res
            .status(200)
            .json({
                success: true,
                message: "Create Degree successfully!!!",
                data: saveDegree,
            });
    } catch (e) {
        console.log("Error creating degree on the ledger", e);
        await session.abortTransaction();
        session.endSession();
        gateway.disconnect();
        let err = '';
        if (e.message.includes("Degree exists in blockchain")) {
            err = "Lỗi cấp bằng, đã tồn tại trong blockchain";
        } else if (e.message.includes("Not have access")) {
            err = "Lỗi cấp bằng, không được cấp quyền";
        } else {
            err = e;
        }

        res.status(400).json({ success: false, message: err });
    }
}

export const getDegreeImage = async (req, res) => {
    let studentMS = req.query.mssv;

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
            "getDegree",
            studentMS
        );
        if (resultJSON == undefined) {
            res.status(400).json({
                success: false,
                message: "Mã số sinh viên chưa đúng!!!",
            });
        }
        // console.log(`*** Result: ${resultJSON}`);
        // console.log(`*** Result: ${prettyJSONString(resultJSON.toString())}`);

        const jsoncompare = JSON.parse(resultJSON.toString());
        if (jsoncompare == '') {
            res.status(400).json({
                success: false,
                message: "Không có kết quả trong blockchain!!!",
            });
        }
        const client = new Web3Storage({ token: process.env.Web3Token });
        const get = await client.get(jsoncompare.image); // Web3Response
        const files = await get.files(); // Web3File[]
        for (const file of files) {
            console.log(`${file.cid} ${file.name} ${file.size}`);
        }
        if (files.length > 0) {
            // Nếu có tệp trong danh sách files
            const imageFile = files[0]; // Giả sử tệp hình ảnh là tệp đầu tiên trong danh sách
            const imageData = await imageFile.arrayBuffer(); // Đọc dữ liệu của tệp hình ảnh

            // Chuyển dữ liệu tệp hình ảnh thành mã base64
            let base64Image = Buffer.from(imageData).toString();

            jsoncompare.image = base64Image;
        }
        // console.log("degreee is", jsoncompare.image);
        res.status(200).json({ success: true, message: "Successful find history Result", data: jsoncompare, });
    } catch (e) {
        let err = '';
        if (e.message.includes("Kết quả bằng cấp không tồn tại!!!")) {
            err = "Sai mã số hoặc kết quả không tồn tại";
        } else if (e.message.includes("is invalid. It does not exist")) {
            err = 'Sai mã hoặc bằng cấp không tồn tại';
        } else if (e.message.includes("Identity not found in wallet")) {
            err = 'Không có quyền truy cập vào blockchain';
        } else {
            err = e;
        }
        console.log("eeeee", e);
        res.status(500).json({ success: false, message: err });
    }
}

export const getInforNFT = async (req, res) => {
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
        // const TotalSupply = await contract.evaluateTransaction('TotalSupply');
        const Name = await contract.evaluateTransaction('Name');
        const Symbol = await contract.evaluateTransaction('Symbol');
        const TotalSupply = await contract.evaluateTransaction('TotalSupply');

        const infor = {
            TotalSupply: JSON.parse(TotalSupply.toString()),
            Name: Name.toString(),
            Symbol: Symbol.toString(),
        }
        gateway.disconnect();
        res.status(200).json({ success: true, message: "Lấy thông tin thành công!!!", data: infor });
    } catch (err) {
        console.log("Error InitializeNFT,", err);
        gateway.disconnect();
        res.status(400).json({ success: false, message: "Lấy thông tin NFT thất bại" });
    }
}

export const updateDegree = async (req, res) => {
    let degree = req.body;
    const base64Image = req.body.image;
    let classification = ''

    console.log("Error creating degree on the ledger111");
    //  Lấy dữ liệu và đẩy lên ipfs server
    const tempFileName = "temp_image";

    fs.writeFileSync(tempFileName, Buffer.from(base64Image).toString());
    // fs.writeFileSync(tempFileName, Buffer.from(base64Image, 'base64'));
    // console.log("11111Buffer.from(base64Image, 'base64') được chuyển đổi:", Buffer.from(base64Image, 'base64').toString('base64'));

    const client = new Web3Storage({ token: process.env.Web3Token });
    const files = await getFilesFromPath(tempFileName);

    // create session
    const session = await mongoose.startSession();
    session.startTransaction();

    // get identify
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
        const exist = await contract.evaluateTransaction('DegreeExists', degree.studentMS, degree.major);
        if (exist.toString() == false) {
            res.status(400).json({ success: false, message: "Lỗi: Bằng cấp cần cập nhật không tồn tại trong Blockchain" });
            return;
        }
        if (degree.score && degree.score >= 3.6 && degree.score <= 4) {
            classification = 'Xuất sắc';
        } else if (degree.score >= 3.2 && degree.score < 3.6) {
            classification = 'Giỏi';
        } else if (degree.score >= 2.5 && degree.score < 3.2) {
            classification = 'Khá';
        } else {
            classification = 'Trung bình';
        }

        const existingDegree = await Degree.findOne({ $and: [{ studentMS: degree.studentMS }, { major: degree.major }] });
        if (!existingDegree) {
            await session.abortTransaction();
            session.endSession();
            gateway.disconnect();
            res.status(400).json({ success: false, message: "Lỗi: Bằng cấp không tồn tại trong hệ thống" });
            return;
        }
        const rootCid = await client.put(files);
        console.log("CID của tệp đã tải lên Web3Storage:", rootCid);
        fs.unlinkSync(tempFileName);

        // Thử thực hiện giao dịch trên ledger
        await contract.submitTransaction(
            "updateDegree",
            'Đại Học Cần Thơ',
            (degree.degreeType),
            (degree.major),
            (degree.studentMS),
            (degree.studentName),
            (degree.studentDate),
            (degree.score),
            classification,
            (degree.formOfTraining),
            (degree.code),
            (degree.inputbook),
            (rootCid),
            (degree.oldNFT),
        );
        console.log("Degree created on the ledger");

        const saveDegree = await Degree.findByIdAndUpdate(existingDegree._id, {
            $set: {
                university: 'Đại học Cần Thơ',
                degreeType: degree.degreeType,
                major: degree.major,
                studentMS: degree.studentMS,
                studentName: degree.studentName,
                studentDate: degree.studentDate,
                score: degree.score,
                classification: classification,
                formOfTraining: degree.formOfTraining,
                code: degree.code,
                inputbook: degree.inputbook,
                image: degree.image,
            }
        }, { new: true, session });

        await session.commitTransaction();
        session.endSession();
        gateway.disconnect();
        res
            .status(200)
            .json({
                success: true,
                message: "Update Degree successfully!!!",
                data: saveDegree,
            });
    } catch (e) {
        console.log("Error creating degree on the ledger");
        if (e.message.includes("Identity not found in wallet")) {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({ success: false, message: "Không có quyền cập nhật bằng cấp" });
        }
        else {
            await session.abortTransaction();
            session.endSession();
            res.status(400).json({ success: false, message: e });
        }
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


