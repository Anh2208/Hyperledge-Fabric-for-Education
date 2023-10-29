"use strict";

// const { Contract } = require('fabric-contract-api');
const { Contract } = require("fabric-contract-api");
const ClientIdentity = require('fabric-shim').ClientIdentity;
const { Certificate } = require('@fidm/x509')
const KJUR = require("jsrsasign");

class StoreContract extends Contract {
  // Contract for Result
  async CreateResult(
    ctx,
    resultID,
    groupMa,
    subjectMS,
    studentMS,
    studentName,
    teacherMS,
    semester,
    score,
    date_awarded,
    access
  ) {
    // kiểm tra role của người dùng
    let cid = new ClientIdentity(ctx.stub);
    if (!cid.assertAttributeValue('role', 'teacher') && !cid.assertAttributeValue('role', 'admin')) {
      throw new Error('Not a valid User');
    }
    if (cid.assertAttributeValue('role', 'teacher')) {
      const currentDate = new Date();
      const accessDate = new Date(access);

      if (currentDate > accessDate) {
        throw new Error('The grading deadline has expired');
      }
    }

    let result = {
      docType: "result",
      // resultID,
      groupMa,
      subjectMS,
      studentMS,
      studentName,
      teacherMS,
      score,
      semester,
      date_awarded,
    };

    const exists = await this.ResultExists(ctx, subjectMS, studentMS);// kiểm tra kết quả trong world state
    if (!exists) {
      await ctx.stub.putState(resultID, Buffer.from(JSON.stringify(result)));
    } else {
      // kiểm tra kết quả học tập của sinh viên ở học kỳ hiện tại
      const existsSemester = await this.ResultExistsSemester(ctx, subjectMS, studentMS, semester, date_awarded);// kiểm tra kết quả trong world state
      if (existsSemester) {
        throw Error('Result exists in blockchain');
      }
      await ctx.stub.putState(resultID, Buffer.from(JSON.stringify(result)));
    }
  }

  // GetAssetHistory returns the chain of custody for an asset since issuance.
  async GetResultHistoryByID(ctx, resultID) {
    let cid = new ClientIdentity(ctx.stub);
    if (!cid.assertAttributeValue('role', 'admin')) {
      console.log('User does not have the required role ("test").');
      throw new Error('Not a valid User');
    }
    let resultsIterator = await ctx.stub.getHistoryForKey(resultID);
    let results = await this._GetAllResults(ctx, resultsIterator, true);

    return JSON.stringify(results);
  }
  async GetResultHistoryBySubjectAndStudent(ctx, subjectMS, studentMS) {
    // Sử dụng phương thức getHistoryForKey để lấy lịch sử thay đổi của key cụ thể
    const key = `${subjectMS}_${studentMS}`;
    let resultsIterator = await ctx.stub.getHistoryForKey(key);
    let resultHistory = await this._GetAllResults(ctx, resultsIterator, true);

    return JSON.stringify(resultHistory);
  }

  async GetTransactionCreator(ctx, txId) {
    const creator = await ctx.stub.getCreator();
    // const mspId = creator.mspid;
    return JSON.stringify(creator);
  }

  async getAllResultByStudentMS(ctx, studentMS) {// get all result by studentMS
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = "result";
    queryString.selector.studentMS = studentMS;
    return await this.GetQueryResultForQueryString(
      ctx,
      JSON.stringify(queryString),
    ); //shim.success(queryResults);
  }

  async getAllResultByTeacherMS(ctx, teacherMS) {// get all result by teacherMS
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = "result";
    queryString.selector.teacherMS = teacherMS;
    return await this.GetQueryResultForQueryString(
      ctx,
      JSON.stringify(queryString),
    ); //shim.success(queryResults);
  }

  async getSingleResult(ctx, resultID) {// get all result by resultID
    const resultState = await ctx.stub.getState(resultID);
    if(resultState && resultState.length > 0){
      return JSON.parse(resultState.toString("utf8"));
    }
    throw new Error("Kết quả không tồn tại");
  }


  async getAllResultByGroup(ctx, groupMa, date_awarded) {// get all result by group
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = "result";
    queryString.selector.groupMa = groupMa;
    queryString.selector.date_awarded = date_awarded;
    return await this.GetQueryResultForQueryString(
      ctx,
      JSON.stringify(queryString),
    ); //shim.success(queryResults);
  }


  async getAllResultByType(ctx, docType) {// get all result by docType
    let queryString = {};
    queryString.selector = {};
    queryString.selector.docType = docType;
    return await this.GetQueryResultForQueryString(
      ctx,
      JSON.stringify(queryString),
    ); //shim.success(queryResults);
  }

  // GetQueryResultForQueryString executes the passed in query string.
  // Result set is built and returned as a byte array containing the JSON results.
  async GetQueryResultForQueryString(ctx, queryString) {
    let resultsIterator = await ctx.stub.getQueryResult(queryString);
    let results = await this._GetAllResults(ctx, resultsIterator, false);

    return JSON.stringify(results);
  }

  async _GetAllResults(ctx, iterator, isHistory) {
    let allResults = [];
    let res = await iterator.next();
    while (!res.done) {
      if (res.value && res.value.value.toString()) {
        let jsonRes = {};

        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.txId;
          // jsonRes.Timestamp = res.value.timestamp.seconds;
          jsonRes.Timestamp = new Date(res.value.timestamp.seconds * 1000); // Chuyển đổi giây sang mili giây
          jsonRes.TestValue = res.value;
          jsonRes.isDelete = res.value.isDelete;
          
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString("utf8"));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString("utf8");
          }
        } else {
          // jsonRes.Key = res.value.key;
          try {
            jsonRes = JSON.parse(res.value.value.toString("utf8"));
            // jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes = res.value.value.toString("utf8");
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
  async UpdateResult(
    ctx,
    resultID,
    groupMa,
    subjectMS,
    studentMS,
    studentName,
    teacherMS,
    semester,
    score,
    date_awarded,
    access
  ) {
    // kiểm tra role của người dùng
    let cid = new ClientIdentity(ctx.stub);
    if (!cid.assertAttributeValue('role', 'teacher') && !cid.assertAttributeValue('role', 'admin')) {
      throw new Error('Not a valid User');
    }
    if (cid.assertAttributeValue('role', 'teacher')) {
      const currentDate = new Date();
      const accessDate = new Date(access);

      if (currentDate > accessDate) {
        throw new Error('The grading deadline has expired');
      }
    }

    // const exists = await this.CheckResultExists(ctx, subjectMS, studentMS);
    const exists = await this.ResultExistsByID(ctx, resultID);
    if (exists == false) {
      throw Error('Result does not exists in blockchain');
    }

    let result = {
      docType: "result",
      // resultID,
      groupMa,
      subjectMS,
      studentMS,
      studentName,
      teacherMS,
      score,
      semester,
      date_awarded,
    };

    await ctx.stub.putState(resultID, Buffer.from(JSON.stringify(result)));

  }

  //Delete Result
  async DeleteResult(ctx, resultID) {
    const exists = await this.ResultExistsByID(ctx, resultID);
    if (!exists) {
      throw new Error(`Kết quả ${resultID} không tồn tại`);
    }

    await ctx.stub.deleteState(resultID);
  }

  // Smart contract for student
  // Create Student
  async CreateStudent(
    ctx,
    studentID,
    studentEmail,
    studentMS,
    studentName,
    studentSex,
    studentPass,
  ) {
    const studentExists = await this.UserExists(ctx, studentEmail);
    if (studentExists) {
      throw new Error("Thông tin sinh viên này đã tồn tại.");
    }

    let student = {
      docType: "student",
      studentID,
      studentEmail,
      studentMS,
      studentName,
      studentSex,
      studentPass,
    };

    await ctx.stub.putState(studentEmail, Buffer.from(JSON.stringify(student)));
  }

  // Smart contract for teacher
  // Create Teacher
  async CreateTeacher(
    ctx,
    teacherID,
    teacherEmail,
    teacherMS,
    teacherName,
    teacherSex,
    teacherPass,
  ) {
    const teacherExists = await this.UserExists(ctx, teacherEmail);
    if (teacherExists) {
      throw new Error("Thông tin sinh viên này đã tồn tại.");
    }
    let teacher = {
      docType: "teacher",
      teacherID,
      teacherEmail,
      teacherMS,
      teacherName,
      teacherSex,
      teacherPass,
    };

    await ctx.stub.putState(teacherEmail, Buffer.from(JSON.stringify(teacher)));
  }

  // Smart contract for admin
  // Create Admin
  async CreateAdmin(
    ctx,
    adminID,
    adminEmail,
    adminMS,
    adminName,
    adminDate,
    adminPhone,
    adminPass,
  ) {
    const adminExists = await this.UserExists(ctx, adminEmail);
    if (adminExists) {
      throw new Error("Thông tin admin này đã tồn tại.");
    }
    let admin = {
      docType: "admin",
      adminID,
      adminEmail,
      adminMS,
      adminName,
      adminDate,
      adminPhone,
      adminPass,
    };

    await ctx.stub.putState(adminEmail, Buffer.from(JSON.stringify(admin)));
  }

  //check user info of blockchain
  async UserExists(ctx, Email) {
    const studentState = await ctx.stub.getState(Email);
    return studentState && studentState.length > 0;
  }

  async ResultExistsByID(ctx, resultID) {
    //check result of blockchain
    const resultState = await ctx.stub.getState(resultID);
    return resultState && resultState.length > 0;
  }

  async ResultExists(ctx, subjectMS, studentMS) {
    let queryString = {};
    queryString.selector = {};
    queryString.selector.subjectMS = subjectMS;
    queryString.selector.studentMS = studentMS;
    const result = await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));
    if (result !== "[]") {
      return true
    }
    return false
  }

  async ResultExistsSemester(ctx, subjectMS, studentMS, semester, date_awarded) {
    let queryString = {};
    queryString.selector = {};
    queryString.selector.subjectMS = subjectMS;
    queryString.selector.studentMS = studentMS;
    queryString.selector.semester = semester;
    queryString.selector.date_awarded = date_awarded;
    const result = await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));
    if (result !== "[]") {
      return true
    }
    return false
  }

  async CheckResultDetailExists(ctx, subjectMS, studentMS) {
    let queryString = {};
    queryString.selector = {};
    queryString.selector.subjectMS = subjectMS;
    queryString.selector.studentMS = studentMS;
    const result = await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));
    if (result !== "[]") {
      return true;
    }
    return false;
  }

  // async getAllResultByGroup(ctx, groupMa, date_awarded) {// get all result by group
  //   let queryString = {};
  //   queryString.selector = {};
  //   queryString.selector.docType = "result";
  //   queryString.selector.groupMa = groupMa;
  //   queryString.selector.date_awarded = date_awarded;
  //   return await this.GetQueryResultForQueryString(
  //     ctx,
  //     JSON.stringify(queryString),
  //   ); //shim.success(queryResults);
  // }

  async CheckUserLedger(ctx, Email) {
    const userState = await ctx.stub.getState(Email);

    return userState.toString("utf8");
    // return JSON.stringify(userState);
  }

  // // InitLedger creates sample assets in the ledger
  async InitLedger(ctx) {
    const teachers = [
      {
        teacherID: "6536259342e4293df7ec6342",
        teacherEmail: "anhg1906001@gmail.com",
        teacherMS: "G1906001",
        teacherName: "Tuấn Anh",
        teacherSex: "male",
        teacherPass: "Pdabu3sODugxAll7U1KZVe09nU8Q1VXlsB3vZGVw7pzEamiw20pjC",
      },
    ];

    for (const teacher of teachers) {
      await this.CreateTeacher(
        ctx,
        teacher.teacherID,
        teacher.teacherEmail,
        teacher.teacherMS,
        teacher.teacherName,
        teacher.teacherSex,
        teacher.teacherPass
      );
    }
  }
}
module.exports = StoreContract;
