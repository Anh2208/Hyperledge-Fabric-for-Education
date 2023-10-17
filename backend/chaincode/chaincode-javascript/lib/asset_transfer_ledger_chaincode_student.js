"use strict";

const { Contract } = require("fabric-contract-api");

class StudentContract extends Contract {
  async CreateStudent(ctx, studentID, name, age, address) {
    const exists = await this.StudentExists(ctx, studentID);
    if (exists) {
      throw new Error(`The student ${studentID} already exists`);
    }

    let student = {
      docType: "student",
      studentID: studentID,
      name: name,
      age: age,
      address: address,
    };

    await ctx.stub.putState(studentID, Buffer.from(JSON.stringify(student)));
  }

  async ReadStudent(ctx, studentID) {
    const studentJSON = await ctx.stub.getState(studentID);
    if (!studentJSON || studentJSON.length === 0) {
      throw new Error(`Student ${studentID} does not exist`);
    }

    return studentJSON.toString();
  }

  async UpdateStudent(ctx, studentID, name, age, address) {
    const exists = await this.StudentExists(ctx, studentID);
    if (!exists) {
      throw new Error(`Student ${studentID} does not exist`);
    }

    let student = {
      docType: "student",
      studentID: studentID,
      name: name,
      age: age,
      address: address,
    };

    await ctx.stub.putState(studentID, Buffer.from(JSON.stringify(student)));
  }

  async DeleteStudent(ctx, studentID) {
    const exists = await this.StudentExists(ctx, studentID);
    if (!exists) {
      throw new Error(`Student ${studentID} does not exist`);
    }

    await ctx.stub.deleteState(studentID);
  }

  async GetAllStudents(ctx) {
    const startKey = "";
    const endKey = "";

    const iterator = await ctx.stub.getStateByRange(startKey, endKey);
    const allStudents = await this._GetAllResults(iterator);

    return JSON.stringify(allStudents);
  }

  async StudentExists(ctx, studentID) {
    const studentState = await ctx.stub.getState(studentID);
    return studentState && studentState.length > 0;
  }

  async _GetAllResults(iterator) {
    const allResults = [];
    let res = await iterator.next();

    while (!res.done) {
      if (res.value && res.value.value.toString()) {
        const jsonRes = {
          Key: res.value.key,
          Record: JSON.parse(res.value.value.toString("utf8")),
        };

        allResults.push(jsonRes);
      }

      res = await iterator.next();
    }

    iterator.close();
    return allResults;
  }

  async InitLedger(ctx) {
    const students = [
      {
        studentID: "B190001",
        name: "Pu Tran",
        age: 200,
        address: "123 Tran Duy Hung",
      },
      {
        studentID: "B190002",
        name: "Dinh Hoang Anh",
        age: 22,
        address: "Bac Lieu",
      },
      {
        studentID: "B190003",
        name: "Thúy Báo",
        age: 19,
        address: "Ở bển",
      },
    ];

    for (const student of students) {
      await this.CreateStudent(
        ctx,
        student.studentID,
        student.name,
        student.age,
        student.address,
      );
    }
  }
}

module.exports = StudentContract;
