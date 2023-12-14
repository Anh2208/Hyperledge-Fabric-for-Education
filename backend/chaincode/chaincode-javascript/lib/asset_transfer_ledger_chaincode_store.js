"use strict";

// const { Contract } = require('fabric-contract-api');
const { Contract } = require("fabric-contract-api");
const ClientIdentity = require('fabric-shim').ClientIdentity;
const { Certificate } = require('@fidm/x509')
const KJUR = require("jsrsasign");

// firstkey of nft
const nftPrefix = 'ctu_nft';

// Define key names for options
const nameKey = 'name';
const symbolKey = 'symbol';

class StoreContract extends Contract {

  // ***** Contract for Result student *****
  // Tạo kết quả học tập
  async CreateResult(
    ctx,
    ID,
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

    let resultKey = ctx.stub.createCompositeKey('Result_CTU', [ID + '-' + subjectMS + '-' + studentMS]); // tạp key cho result
    // lấy thông tin người tạo transaction
    let userkey = ctx.clientIdentity.getID();
    let x509Data = userkey.split("x509::")[1];
    let CN = /\/CN=([^/]+)/.exec(x509Data);
    CN = CN[1].replace(/::$/, '');

    const clientMSPID = ctx.clientIdentity.getMSPID();// kiểm tra người dùng có thuộc tổ chức Org1MSP hay không?
    if (clientMSPID !== 'Org1MSP') {
      throw new Error('Client is not part of the organization');
    }

    let cid = new ClientIdentity(ctx.stub);
    if (!cid.assertAttributeValue('role', 'teacher') && !cid.assertAttributeValue('role', 'admin') && !cid.assertAttributeValue('role', 'rector')) {
      throw new Error('Not a valid User');
    }
    if (cid.assertAttributeValue('role', 'teacher')) {
      const currentDate = new Date();
      const accessDate = new Date(access);

      if (currentDate > accessDate) {
        throw new Error('The grading deadline has expired');
      }
    }
    let permissionGranted = [];
    let action = 'Create';// hành động của chức năng là update 
    let result = {
      docType: "result",
      resultID: ID,
      groupMa,
      subjectMS,
      studentMS,
      studentName,
      teacherMS,
      score,
      semester,
      date_awarded,
      CN,
      permissionGranted,
      action
    };

    const exists = await this.ResultExists(ctx, subjectMS, studentMS);// kiểm tra kết quả trong world state
    if (!exists) {
      await ctx.stub.putState(resultKey, Buffer.from(JSON.stringify(result)));
    } else {
      // kiểm tra kết quả học tập của sinh viên ở học kỳ hiện tại
      const existsSemester = await this.ResultExistsSemester(ctx, subjectMS, studentMS, semester, date_awarded);// kiểm tra kết quả trong world state
      if (existsSemester) {
        throw Error('Result exists in blockchain');
      }
      await ctx.stub.putState(resultKey, Buffer.from(JSON.stringify(result)));
    }
  }

  // GetAssetHistory returns the chain of custody for an asset since issuance.
  async GetResultHistory(ctx, subjectMS, studentMS, ID) {
    let resultKey = ctx.stub.createCompositeKey('Result_CTU', [ID + '-' + subjectMS + '-' + studentMS]); // tạp key cho result
    let cid = new ClientIdentity(ctx.stub);
    if (!cid.assertAttributeValue('role', 'admin') && !cid.assertAttributeValue('role', 'rector')) {
      throw new Error('Not a valid User');
    }
    const exists = await this.ResultExists(ctx, subjectMS, studentMS);// kiểm tra kết quả trong world state
    if (!exists) {
      throw new Error('result does not exist in blockchain')
    }
    let resultsIterator = await ctx.stub.getHistoryForKey(resultKey);
    let results = await this._GetAllResults(ctx, resultsIterator, true);

    return JSON.stringify(results);
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

  async getSingleResult(ctx, subjectMS, studentMS, resultID) {// get all result by resultID
    let resultKey = ctx.stub.createCompositeKey('Result_CTU', [resultID + '-' + subjectMS + '-' + studentMS]); // tạo key cho result
    const resultState = await ctx.stub.getState(resultKey);
    if (resultState && resultState.length > 0) {
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
          jsonRes.Timestamp = new Date(res.value.timestamp.seconds * 1000); // Chuyển đổi giây sang mili giây
          jsonRes.isDelete = res.value.isDelete;
          // jsonRes.IsDelete = response.is_delete;
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
    let resultKey = ctx.stub.createCompositeKey('Result_CTU', [resultID + '-' + subjectMS + '-' + studentMS]); // tạp key cho result

    // lấy thông tin người tạo transaction
    let userkey = ctx.clientIdentity.getID();
    let x509Data = userkey.split("x509::")[1];
    let CN = /\/CN=([^/]+)/.exec(x509Data);
    CN = CN[1].replace(/::$/, ''); // Bỏ dấu hai chấm (::) đằng sau "appUser"

    // lấy kết quả tồn tại trong world state
    const rs = await ctx.stub.getState(resultKey);
    const rsmain = JSON.parse(rs.toString());

    // kiểm tra danh tính người truy cập
    const clientMSPID = ctx.clientIdentity.getMSPID();// kiểm tra người dùng có thuộc tổ chức Org1MSP hay không?
    if (clientMSPID !== 'Org1MSP') {
      throw new Error('Client is not part of the organization');
    }
    // kiểm tra role của người dùng
    let cid = new ClientIdentity(ctx.stub);
    if (!cid.assertAttributeValue('role', 'teacher') && !cid.assertAttributeValue('role', 'admin') && !cid.assertAttributeValue('role', 'rector')) {
      throw new Error('Not a valid User');
    }
    if (cid.assertAttributeValue('role', 'teacher')) {
      const currentDate = new Date();
      const accessDate = new Date(access);

      if (currentDate > accessDate && !rsmain.permissionGranted.includes(CN)) {
        throw new Error('The grading deadline has expired');
      }
    }

    const exists = await this.ResultExistsByID(ctx, subjectMS, studentMS, resultID);
    if (!exists) {
      throw Error('Result does not exists in blockchain');
    }

    let action = 'Update';
    let result = {
      docType: 'result',
      resultID,
      groupMa,
      subjectMS,
      studentMS,
      studentName,
      teacherMS,
      score,
      semester,
      date_awarded,
      CN,
      permissionGranted: rsmain.permissionGranted,
      action,
    };

    await ctx.stub.putState(resultKey, Buffer.from(JSON.stringify(result))); // cập nhật kết quả học tập

  }

  // cấp quyền truy cập vào kết quả học tập
  async grantAccessResult(ctx, resultID, subjectMS, studentMS, email) {

    // Kiểm tra danh tính người dùng 
    let cid = new ClientIdentity(ctx.stub);
    if (!cid.assertAttributeValue('role', 'teacher') && !cid.assertAttributeValue('role', 'admin') && !cid.assertAttributeValue('role', 'rector')) {
      throw new Error('Not a valid User');
    }
    if (!cid.assertAttributeValue('role', 'rector')) {
      throw new Error('You do not have permission to perform this function');
    }

    // tạo key và lấy kết quả học tập từ world state 
    let resultKey = ctx.stub.createCompositeKey('Result_CTU', [resultID + '-' + subjectMS + '-' + studentMS]); // tạp key cho result
    const rs = await ctx.stub.getState(resultKey);
    let rsmain = JSON.parse(rs.toString());

    // cập nhật quyền truy cập và action 
    if (!rsmain.permissionGranted.includes(email)) {
      rsmain.permissionGranted.push(email);
      rsmain.action = 'Change access';
    } else {
      throw new Error("MS does exists in permissionGranted");
    }

    await ctx.stub.putState(resultKey, Buffer.from(JSON.stringify(rsmain)));

  }

  // thu hồi quyền truy cập vào kết quả học tập 
  async revokeAccessResult(ctx, resultID, subjectMS, studentMS, email) {

    // Kiểm tra danh tính người dùng 
    let cid = new ClientIdentity(ctx.stub);
    if (!cid.assertAttributeValue('role', 'teacher') && !cid.assertAttributeValue('role', 'admin') && !cid.assertAttributeValue('role', 'rector')) {
      throw new Error('Not a valid User');
    }
    if (!cid.assertAttributeValue('role', 'rector')) {
      throw new Error('You do not have permission to perform this function');
    }

    // tạo key và lấy kết quả học tập từ world state 
    let resultKey = ctx.stub.createCompositeKey('Result_CTU', [resultID + '-' + subjectMS + '-' + studentMS]); // tạp key cho result
    const rs = await ctx.stub.getState(resultKey);
    let rsmain = JSON.parse(rs.toString());

    // thu hồi quyền chỉnh sửa kết quả học tập sinh viên nếu hợp lệ
    if (!rsmain.permissionGranted.includes(email)) {
      throw new Error("MS does not exists in permissionGranted");
    } else if (rsmain.permissionGranted.includes(email)) {
      rsmain.permissionGranted = rsmain.permissionGranted.filter(
        (permission) => permission !== email
      );
      rsmain.action = 'Change access';
    } else {
      throw new Error("Error revokeAccessResult");
    }
    await ctx.stub.putState(resultKey, Buffer.from(JSON.stringify(rsmain)));
  }

  // //Delete Result
  // async DeleteResult(ctx, subjectMS, studentMS, resultID) {
  //   const exists = await this.ResultExistsByID(ctx, subjectMS, studentMS, resultID);
  //   if (!exists) {
  //     throw new Error(`Kết quả ${resultID} không tồn tại`);
  //   }
  //   let resultKey = ctx.stub.createCompositeKey('Result_CTU', [resultID + '-' + subjectMS + '-' + studentMS]);
  //   await ctx.stub.deleteState(resultKey);
  // }

  // Tạo bằng cấp cho sinh viên đủ điều kiện 
  async createDegree(
    ctx,
    university,
    degreeType,
    major,
    studentMS,
    studentName,
    studentDate,
    score,
    classification,
    formOfTraining,
    code,
    inputbook,
    image,
  ) {

    let degreeKey = ctx.stub.createCompositeKey('Degree_CTU', [studentMS + '-' + major]);// tạp key cho result

    let cid = new ClientIdentity(ctx.stub);
    if (!cid.assertAttributeValue('role', 'admin') && !cid.assertAttributeValue('role', 'rector')) {
      throw new Error('Not have access');
    }

    let result = {
      docType: "degree",
      university,
      degreeType,
      major,
      studentMS,
      studentName,
      studentDate,
      score,
      classification,
      formOfTraining,
      code,
      inputbook,
      image,
    };

    const exists = await this.DegreeExists(ctx, studentMS, major);// kiểm tra degree tồn tại trong world state
    if (!exists) {
      await this.MintWithTokenURI(ctx, code, degreeKey, studentName);
      await ctx.stub.putState(degreeKey, Buffer.from(JSON.stringify(result)));
    } else {
      throw Error('Degree exists in blockchain');
    }
  }

  async getDegree(ctx, tokenId) {

    let nft = await this._readNFT(ctx, tokenId);
    let resultKey = nft.tokenURI;

    const degreeState = await ctx.stub.getState(resultKey);
    if (degreeState && degreeState.length > 0) {
      return JSON.parse(degreeState.toString("utf8"));
    }
    throw new Error("Kết quả bằng cấp không tồn tại!!!");
  }

  // update degree
  async updateDegree(
    ctx,
    university,
    degreeType,
    major,
    studentMS,
    studentName,
    studentDate,
    score,
    classification,
    formOfTraining,
    code,
    inputbook,
    image,
    oldNFT,
  ) {

    let degreeKey = ctx.stub.createCompositeKey('Degree_CTU', [studentMS + '-' + major]);// tạp key cho result

    let cid = new ClientIdentity(ctx.stub);
    if (!cid.assertAttributeValue('role', 'admin') && !cid.assertAttributeValue('role', 'rector')) {
      throw new Error('Not have access');
    }

    let result = {
      docType: "degree",
      university,
      degreeType,
      major,
      studentMS,
      studentName,
      studentDate,
      score,
      classification,
      formOfTraining,
      code,
      inputbook,
      image,
    };

    const exists = await this.DegreeExists(ctx, studentMS, major);// kiểm tra degree tồn tại trong world state
    if (exists) {
      if (code != oldNFT) {
        await this.Burn(ctx, oldNFT);
        await this.MintWithTokenURI(ctx, code, degreeKey, studentName);
      }

      await ctx.stub.putState(degreeKey, Buffer.from(JSON.stringify(result)));
    } else {
      throw Error('Degree does not exists in blockchain');
    }
  }

  // Smart contract for student
  // Create Student
  // async CreateStudent(
  //   ctx,
  //   studentID,
  //   studentEmail,
  //   studentMS,
  //   studentName,
  //   studentSex,
  //   studentPass,
  // ) {
  //   const studentExists = await this.UserExists(ctx, studentEmail);
  //   if (studentExists) {
  //     throw new Error("Thông tin sinh viên này đã tồn tại.");
  //   }

  //   let student = {
  //     docType: "student",
  //     studentID,
  //     studentEmail,
  //     studentMS,
  //     studentName,
  //     studentSex,
  //     studentPass,
  //   };

  //   await ctx.stub.putState(studentEmail, Buffer.from(JSON.stringify(student)));
  // }

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

  // kiểm tra kết quả học tập tồn tại trong hệ thống bằng ID 
  async ResultExistsByID(ctx, subjectMS, studentMS, ID) {
    let resultKey = ctx.stub.createCompositeKey('Result_CTU', [ID + '-' + subjectMS + '-' + studentMS]); // tạp key cho result
    //check result of blockchain
    const resultState = await ctx.stub.getState(resultKey);
    return resultState && resultState.length > 0;
  }

  // kiểm tra học phần của sinh viên tồn tại trong hệ thống hay chưa
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

  // kiểm tra bằng bằng cấp đã tồn tại trong hệ thống hay chưa (tìm kiếm bằng studentMS + major)
  async DegreeExists(ctx, studentMS, major) {
    let queryString = {};
    queryString.selector = {};
    queryString.selector.major = major;
    queryString.selector.studentMS = studentMS;
    queryString.selector.docType = 'degree';
    const result = await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));
    if (result !== "[]") {
      return true
    }
    return false
  }

  // kiểm tra kết quả học tập của một sinh viên có tồn tại trong học kỳ và năm học hiện tại hay chưa
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

  // async CheckResultDetailExists(ctx, subjectMS, studentMS) { // có thể không sử dụng
  //   let queryString = {};
  //   queryString.selector = {};
  //   queryString.selector.subjectMS = subjectMS;
  //   queryString.selector.studentMS = studentMS;
  //   const result = await this.GetQueryResultForQueryString(ctx, JSON.stringify(queryString));
  //   if (result !== "[]") {
  //     return true;
  //   }
  //   return false;
  // }

  // Kiểm tra user tồn tại trong blockchain bằng email đăng ký (sử dụng trong smart contract)
  async UserExists(ctx, Email) {
    const studentState = await ctx.stub.getState(Email);
    return studentState && studentState.length > 0;
  }

  // kiểm tra người dùng đã đăng ký danh tính hay chưa (sử dụng api bên ngoài)
  async CheckUserLedger(ctx, Email) {
    const userState = await ctx.stub.getState(Email);

    return userState.toString("utf8");
    // return JSON.stringify(userState);
  }

  // kiểm tra user có mang vai trò là rector hay không?
  async CheckRector(ctx) {
    let cid = new ClientIdentity(ctx.stub);
    if (!cid.assertAttributeValue('role', 'teacher') && !cid.assertAttributeValue('role', 'admin') && !cid.assertAttributeValue('role', 'rector')) {
      throw new Error('Not a valid User');
    } else if (!cid.assertAttributeValue('role', 'rector') && cid.assertAttributeValue('role', 'admin')) {
      throw new Error('You do not have permission to perform this function');
    } else if (cid.assertAttributeValue('role', 'rector')) {
      return true;
    } else {
      throw new Error("Error checking rector identification in blockchain")
    }
  }

  // ***** NFT ******
  // khởi tạo tên và biểu tượng của token 
  async Initialize(ctx, name, symbol) {

    // Check minter authorization - this sample assumes Org1 is the issuer with privilege to initialize contract (set the name and symbol)
    const clientMSPID = ctx.clientIdentity.getMSPID();
    if (clientMSPID !== 'Org1MSP') {
      throw new Error('client is not authorized to set the name and symbol of the token');
    }

    let cid = new ClientIdentity(ctx.stub);
    if (!cid.assertAttributeValue('role', 'admin') && !cid.assertAttributeValue('role', 'rector')) {// kiểm tra quyền admin trước khi tạo
      throw new Error('Not have access');
    }

    // Check contract options are not already set, client is not authorized to change them once intitialized
    const nameBytes = await ctx.stub.getState(nameKey);
    if (nameBytes && nameBytes.length > 0) {
      throw new Error('contract options are already set, client is not authorized to change them');
    }

    await ctx.stub.putState(nameKey, Buffer.from(name));
    await ctx.stub.putState(symbolKey, Buffer.from(symbol));
    return nameKey;
  }

  // Tạo NFT
  async MintWithTokenURI(ctx, tokenId, tokenURI, owner) {
    await this.CheckInitialized(ctx);// kiểm tra hàm tạo tên và biểu tượng cho nft đã được khởi tạo hay chưa?

    const clientMSPID = ctx.clientIdentity.getMSPID();// kiểm tra người dùng có thuộc tổ chức Org1MSP hay không?
    if (clientMSPID !== 'Org1MSP') {
      throw new Error('client is not authorized to mint new tokens');
    }

    let cid = new ClientIdentity(ctx.stub);// kiểm tra người dùng có role admin hay không?
    if (!cid.assertAttributeValue('role', 'admin') && !cid.assertAttributeValue('role', 'rector')) {
      throw new Error('Not have access');
    }

    const exists = await this._nftExists(ctx, tokenId);
    if (exists) {
      throw new Error(`The token ${tokenId} is already minted.`);
    }
    const nft = {   //create nft for degree
      tokenId: tokenId,
      owner: owner,
      tokenURI: tokenURI
    };

    const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
    await ctx.stub.putState(nftKey, Buffer.from(JSON.stringify(nft)));

  }

  async TotalSupply(ctx) { // hàm tính tổng số nft được tạo ra
    // Check contract options are already set first to execute the function
    await this.CheckInitialized(ctx);

    // There is a key record for every non-fungible token in the format of nftPrefix.tokenId.
    // TotalSupply() queries for and counts all records matching nftPrefix.*
    const iterator = await ctx.stub.getStateByPartialCompositeKey(nftPrefix, []);

    // Count the number of returned composite keys
    let totalSupply = 0;
    let result = await iterator.next();
    while (!result.done) {
      totalSupply++;
      result = await iterator.next();
    }
    return totalSupply;
  }

  // Lấy tên của NFT 
  async Name(ctx) {
    await this.CheckInitialized(ctx);

    const nameAsBytes = await ctx.stub.getState(nameKey);

    if (nameAsBytes && nameAsBytes.length > 0) {
      return nameAsBytes.toString();
    } else {
      throw new Error("Can't get Name");
    }
  }

  // Lấy ký hiệu của NFT
  async Symbol(ctx) {
    await this.CheckInitialized(ctx);

    const symbolAsBytes = await ctx.stub.getState(symbolKey);
    if (symbolAsBytes && symbolAsBytes.length > 0) {
      return (symbolAsBytes.toString("utf8"));
    } else {
      throw new Error("Can't get Symbol");
    }

  }

  // Lấy thông tin NFT đã được tạo 
  async _readNFT(ctx, tokenId) {
    const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
    const nftBytes = await ctx.stub.getState(nftKey);
    if (!nftBytes || nftBytes.length === 0) {
      throw new Error(`The tokenId ${tokenId} is invalid. It does not exist`);
    }
    const nft = JSON.parse(nftBytes.toString());
    return nft;
  }

  // Kiểm tra tồn tại của NFT
  async _nftExists(ctx, tokenId) {
    const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
    const nftBytes = await ctx.stub.getState(nftKey);
    return nftBytes && nftBytes.length > 0;
  }

  // Kiểm tra các tùy chọn của contract đã được khởi tạo hay chưa 
  async CheckInitialized(ctx) {
    const nameBytes = await ctx.stub.getState(nameKey);
    if (!nameBytes || nameBytes.length === 0) {
      throw new Error('contract options need to be set before calling any function, call Initialize() to initialize contract');
    }
  }

  async Burn(ctx, tokenId) {

    await this.CheckInitialized(ctx);

    // Check minter authorization - this sample assumes Org1 is the issuer with privilege to initialize contract (set the name and symbol)
    const clientMSPID = ctx.clientIdentity.getMSPID();
    if (clientMSPID !== 'Org1MSP') {
      throw new Error('client is not authorized to set the name and symbol of the token');
    }

    // const owner = ctx.clientIdentity.getID();

    // Check if a caller is the owner of the non-fungible token
    // const nft = await this._readNFT(ctx, tokenId);
    // if (nft.owner !== owner) {
    //   throw new Error(`NFT ${tokenId} không được sở hữu bởi ${owner}`);
    // }

    let cid = new ClientIdentity(ctx.stub);// kiểm tra người dùng có role admin hay không?
    if (!cid.assertAttributeValue('role', 'admin') && !cid.assertAttributeValue('role', 'rector')) {
      throw new Error('Không có quyền tương tác với token này!!!');
    }

    // Delete the token
    const nftKey = ctx.stub.createCompositeKey(nftPrefix, [tokenId]);
    await ctx.stub.deleteState(nftKey);

    // const balanceKey = ctx.stub.createCompositeKey(balancePrefix, [owner, tokenId]);
    // await ctx.stub.deleteState(balanceKey);
    // const tokenIdInt = parseInt(tokenId);
    // const transferEvent = { from: owner, to: '0x0', tokenId: tokenIdInt };
    // ctx.stub.setEvent('Transfer', Buffer.from(JSON.stringify(transferEvent)));

    return true;
  }
}
module.exports = StoreContract;
