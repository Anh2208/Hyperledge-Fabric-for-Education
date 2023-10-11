import Result from "../models/Result.js";


import { Wallets, Gateway } from "fabric-network"
import FabricCAServices from "fabric-ca-client"
import { enrollAdmin, buildCAClient, registerAndEnrollUser } from "../services/fabric/enrollment.js";
import { buildWallet, buildCCPOrg1 } from "../services/fabric/AppUtil.js";

import fs from 'fs'
import dotenv from "dotenv";
import path from 'path'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const walletPath = path.join(__dirname, '..', 'wallet');

dotenv.config();
const userId = 'appUser';
const channelName = 'mychannel';
const chaincodeName = 'ledger';
const mspOrg1 = 'Org1MSP';
const cppUser = JSON.parse(fs.readFileSync(process.env.ccpPATH, 'utf8'));
// create result
function prettyJSONString(inputString) {
    return JSON.stringify(JSON.parse(inputString), null, 2);
}

export const createResult = async (req, res) => {

    try {
        //connect to hyperledger fabric network and contract
        const wallet = await buildWallet(Wallets, walletPath);
        const gateway = new Gateway();

        await gateway.connect(cppUser, {
            wallet,
            identity: String(userId),
            discovery: { enabled: true, asLocalhost: true }
        });
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);
        // Check data exists in blockchain
        let existBlock = await contract.evaluateTransaction('ResultExists', req.body.subjectMS, req.body.studentMS);
        let checkExistBlock = prettyJSONString(existBlock.toString());
        let actionPerformed = false;

        //check data exists in blockchain
        if (checkExistBlock == 'true') {
            console.log("checkExistBlock", checkExistBlock);
            actionPerformed = true;
        }
        // Check data exists in MongoDB
        const existMongo = await Result.find({
            subjectMS: req.body.subjectMS,
            studentMS: req.body.studentMS,
        });
        if (existMongo.length > 0) {
            console.log("existMongo", existMongo);
            actionPerformed = true;
        }
        // Nếu đã thực hiện một trong các hành động trên, dừng lại
        if (actionPerformed == true) {
            gateway.disconnect();
            res.status(500).json({ success: false, message: "Result exists in Database, try again" });
            return;
        }
        try {
            const saveResult = await Result.create({
                subjectMS: req.body.subjectMS,
                studentMS: req.body.studentMS,
                teacherMS: req.body.teacherMS,
                semester: req.body.semester,
                score: req.body.score,
            });

            const resultID = saveResult._id;
            const date_awarded = saveResult.date_awarded;
            console.log("date_awarded", date_awarded);

            await contract.submitTransaction('CreateResult', resultID, req.body.subjectMS, req.body.studentMS, req.body.teacherMS, req.body.semester, req.body.score, date_awarded);

            res.status(200).json({ success: true, message: "Create result successfully!!!", data: saveResult });
        } finally {
            gateway.disconnect();
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create result. Try again" });
    }
};

// update result
export const updateResult = async (req, res) => {
    const id = req.params.id;
    try {
        const updateResult = await Result.findByIdAndUpdate(id, { $set: req.body, }, { new: true });
        res.status(200).json({
            success: true,
            message: "Update result successfuly!!!",
            data: updateResult,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "failed to update result",
        });
    }
};

// delete result
export const deleteResult = async (req, res) => {
    const id = req.params.id;
    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
        wallet,
        identity: String(userId),
        discovery: { enabled: true, asLocalhost: true }
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    // create flag
    let mongoDeleteSuccess = false;
    let blockchainDeleteSuccess = false;

    try {
        // delete object in Mongodb
        await Result.findByIdAndDelete(id);
        mongoDeleteSuccess = true;

        // delete object in Blockchain
        await contract.submitTransaction('DeleteResult', id);
        blockchainDeleteSuccess = true;

        // if delete from two data success
        if (mongoDeleteSuccess && blockchainDeleteSuccess) {
            res.status(200).json({
                success: true,
                message: "Successfully deleted result",
            });
        } else {
            res.status(500).json({
                success: false,
                message: "One or both delete operations failed",
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "One or both delete operations failed",
        });
    } finally {
        gateway.disconnect();
    }
};

// get result by studentMS
export const getResultMongo = async (req, res) => {
    const studentMS = new RegExp(req.query.studentMS, "i");
    // const masoStudent = "B1906425";
    // console.log(studentMS);
    try {
        const result = await Result.find({ studentMS });
        res.status(200).json({
            success: true,
            message: "Find result by studentMS in Mongodb successfully",
            data: result,
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "result of studentMS not found",
        });
    }
};

// get result in blockchain

export const getResultBlock = async (req, res) => {
    const studentMS = new RegExp(req.query.studentMS, "i").source;
    // const MS = studentMS.source;

    const wallet = await buildWallet(Wallets, walletPath);
    const gateway = new Gateway();

    await gateway.connect(cppUser, {
        wallet,
        identity: String(userId),
        discovery: { enabled: true, asLocalhost: true }
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    try {
        console.log("studentMS", studentMS)
        // let resultblock = await contract.evaluateTransaction('ReadResultByMS', studentMS);
        // console.log("studentMS", resultblock)
        console.log('\n--> Evaluate Transaction: ReadStudent, function returns information about a student with ID (B1906425)');
        let result = await contract.evaluateTransaction('ReadResultsByStudentMS', 'B1906428');
        
        console.log(`*** Result: ${prettyJSONString(result.toString())}`);

        // let result = prettyJSONString(resultblock.toString());

        res.status(200).json({
            success: true,
            message: "Find result by studentMS in Blockchain successfully",
            data: result,
        });
        gateway.disconnect();
    } catch (error) {
        res.status(404).json({
            success: false,
            message: "result of studentMS not found",
        });
    } finally {
        gateway.disconnect();
    }
};