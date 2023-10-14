'use strict';

// const { Contract } = require('fabric-contract-api');
const { Contract } = require('fabric-contract-api');
const KJUR = require('jsrsasign');

class StoreContract extends Contract {

    // Contract for Result
    async CreateResult(ctx, resultID, groupMa, subjectMS, studentMS, teacherMS, semester, score, date_awarded) {

        const exists = await this.ResultExists(ctx, resultID);
        if (exists) {
            throw new Error('Kết quả này đã tồn tại.');
        }

        let result = {
            docType: 'result',
            resultID,
            groupMa,
            subjectMS,
            studentMS,
            teacherMS,
            score,
            semester,
            date_awarded
        };

        await ctx.stub.putState(resultID, Buffer.from(JSON.stringify(result)));
    }

    // GetAssetHistory returns the chain of custody for an asset since issuance.
	async GetResultHistory(ctx, resultID) {

		let resultsIterator = await ctx.stub.getHistoryForKey(resultID);
		let results = await this._GetAllResults(resultsIterator, true);

		return JSON.stringify(results);
	}

    // async GetTransactionCreator(ctx, txId) {
    //     const creator = await ctx.stub.getCreator();
    //     const mspId = creator.mspid;
    //     return JSON.stringify(mspId);
    // }

    async GetTransactionCreator(ctx, txId) {
        const creator = await ctx.stub.getCreator();
    
        // Lấy thông tin xác thực người tạo giao dịch
        const certificate = creator.getIdBytes();
    
        // Giải mã chứng chỉ X.509 từ byte ID
        const certPEM = KJUR.asn1.ASN1Util.getPEMStringFromHex(certificate.toString('hex'));
        const x509Cert = new KJUR.asn1.x509.X509();
    
        try {
            x509Cert.readCertPEM(certPEM);
    
            // Lấy thông tin Common Name và Organization từ chứng chỉ
            const commonName = x509Cert.getSubjectString();
            const organization = x509Cert.getIssuerString();
    
            return JSON.stringify({
                commonName: commonName,
                organization: organization,
            });
        } catch (error) {
            console.error(error);
            return 'Failed to parse certificate';
        }
    }
    
    // get all result by studentMS
    async getAllResultByStudentMS(ctx, studentMS) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'result';
        queryString.selector.studentMS = studentMS;
        return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString)); //shim.success(queryResults);
    }

    // get all result by teacherMS
    async getAllResultByTeacherMS(ctx, teacherMS) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'result';
        queryString.selector.teacherMS = teacherMS;
        return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString)); //shim.success(queryResults);
    }

    // get all result by resultID
    async getAllResultByID(ctx, resultID) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'result';
        queryString.selector.resultID = resultID;
        return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString)); //shim.success(queryResults);
    }

    // get all result by group
    async getAllResultByGroup(ctx, groupMa, date_awarded) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = 'result';
        queryString.selector.groupMa = groupMa;
        queryString.selector.date_awarded = date_awarded;
        return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString)); //shim.success(queryResults);
    }

    // get all result by docType
    async getAllResultByType(ctx, docType) {
        let queryString = {};
        queryString.selector = {};
        queryString.selector.docType = docType;
        return await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString)); //shim.success(queryResults);
    }


    // GetQueryResultForQueryString executes the passed in query string.
    // Result set is built and returned as a byte array containing the JSON results.
    async GetQueryResultForQueryString(ctx, queryString) {

        let resultsIterator = await ctx.stub.getQueryResult(queryString);
        let results = await this._GetAllResults(resultsIterator, false);

        return JSON.stringify(results);
    }

    async _GetAllResults(iterator, isHistory) {
        let allResults = [];
        let res = await iterator.next();
        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                let jsonRes = {};
                console.log(res.value.value.toString('utf8'));
                if (isHistory && isHistory === true) {
                    jsonRes.TxId = res.value.txId;
                    jsonRes.Timestamp = res.value.timestamp;
                    // jsonRes.CreatorNe = ctx.stub.getCreator();
                    try {
                        jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes.Value = res.value.value.toString('utf8');
                    }
                } else {
                    // jsonRes.Key = res.value.key;
                    try {
                        jsonRes = JSON.parse(res.value.value.toString('utf8'));
                        // jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                    } catch (err) {
                        console.log(err);
                        jsonRes = res.value.value.toString('utf8');
                        // jsonRes.Record = res.value.value.toString('utf8');
                    }
                }
                allResults.push(jsonRes);
            }
            res = await iterator.next();
        }
        iterator.close();
        return allResults;
    }

    //update Result
    async UpdateResult(ctx, resultID, groupMa, subjectMS, studentMS, teacherMS, semester, score, date_awarded) {
        const exists = await this.ResultExists(ctx, resultID);
        if (!exists) {
            throw new Error(`Result ${resultID} does not exist`);
        }

        let result = {
            docType: 'result',
            resultID,
            groupMa,
            subjectMS,
            studentMS,
            teacherMS,
            score,
            semester,
            date_awarded
        };

        await ctx.stub.putState(resultID, Buffer.from(JSON.stringify(result)));
    }

    //Delete Result
    async DeleteResult(ctx, resultID) {
        const exists = await this.ResultExists(ctx, resultID);
        if (!exists) {
            throw new Error(`result ${resultID} does not exist`);
        }

        await ctx.stub.deleteState(resultID);
    }


    // Smart contract for student
    // Create Student
    async CreateStudent(ctx, studentID, studentEmail, studentMS, studentName, studentSex, studentPass) {
        const studentExists = await this.UserExists(ctx, studentEmail);
        if (studentExists) {
            throw new Error('Thông tin sinh viên này đã tồn tại.');
        }
        let student = {
            docType: 'student',
            studentID,
            studentEmail,
            studentMS,
            studentName,
            studentSex,
            studentPass
        };

        await ctx.stub.putState(studentEmail, Buffer.from(JSON.stringify(student)));
    }

    // Smart contract for teacher
    // Create Teacher
    async CreateTeacher(ctx, teacherID, teacherEmail, teacherMS, teacherName, teacherSex, teacherPass) {
        const teacherExists = await this.UserExists(ctx, teacherEmail);
        if (teacherExists) {
            throw new Error('Thông tin sinh viên này đã tồn tại.');
        }
        let teacher = {
            docType: 'teacher',
            teacherID,
            teacherEmail,
            teacherMS,
            teacherName,
            teacherSex,
            teacherPass
        };

        await ctx.stub.putState(teacherEmail, Buffer.from(JSON.stringify(teacher)));
    }

    // Smart contract for admin
    // Create Admin
    async CreateAdmin(ctx, adminID, adminEmail, adminMS, adminName, adminDate, adminPhone, adminPass) {
        const adminExists = await this.UserExists(ctx, adminEmail);
        if (adminExists) {
            throw new Error('Thông tin admin này đã tồn tại.');
        }
        let admin = {
            docType: 'admin',
            adminID,
            adminEmail,
            adminMS,
            adminName,
            adminDate,
            adminPhone,
            adminPass
        };

        await ctx.stub.putState(adminEmail, Buffer.from(JSON.stringify(admin)));
    }

    //check user info of blockchain
    async UserExists(ctx, Email) {
        const studentState = await ctx.stub.getState(Email);
        return studentState && studentState.length > 0;
    }

    async ResultExists(ctx, resultID) {//check result of blockchain
        const resultState = await ctx.stub.getState(resultID);
        return resultState && resultState.length > 0;
    }

    async CheckUserLedger(ctx, Email) {
        const userState = await ctx.stub.getState(Email);

        return userState.toString('utf8');
        // return JSON.stringify(userState);
    }


}
module.exports = StoreContract;


// async GetAllResult(ctx) {
//     const startKey = '';
//     const endKey = '';

//     const iterator = await ctx.stub.getStateByRange(startKey, endKey);
//     const allResult = await this._GetAllResults(iterator);

//     return JSON.stringify(allResult);
// }

// async _GetAllResults(iterator) {
//     const allResults = [];
//     let res = await iterator.next();

//     while (!res.done) {
//         if (res.value && res.value.value.toString()) {
//             const jsonRes = {
//                 Key: res.value.key,
//                 Record: JSON.parse(res.value.value.toString('utf8'))
//             };

//             allResults.push(jsonRes);
//         }

//         res = await iterator.next();
//     }

//     iterator.close();
//     return allResults;
// }

