'use strict';

// const { Contract } = require('fabric-contract-api');
const { Contract } = require('fabric-contract-api');

class StoreContract extends Contract {
    async CreateResult(ctx, resultID, subjectMS, studentMS, teacherMS, semester, score, date_awarded) {

        const exists = await this.ResultExists(ctx, subjectMS);
        if (exists) {
            throw new Error('Kết quả này đã tồn tại.');
        }

        let result = {
            docType: 'result',
            resultID,
            subjectMS,
            studentMS,
            teacherMS,
            score,
            semester,
            date_awarded
        };

        await ctx.stub.putState(resultID, Buffer.from(JSON.stringify(result)));

        // let indexName = 'MS~ID';
        // let msIDIndexKey = await ctx.stub.createCompositeKey(indexName, [result.subjectMS, result.studentMS]);
        // await ctx.stub.putState(msIDIndexKey, Buffer.from('\u0000'));

    }

    async ReadResultByID(ctx, resultID) {
        const resultJSON = await ctx.stub.getState(resultID);
        if (!resultJSON || resultJSON.length === 0) {
            throw new Error(`resultID ${resultID} does not exist`);
        }
        // console.log(studentJSON.toString());
        return resultJSON.toString();
    }

    async ReadResultsByStudentMS(ctx, studentMS) {
        const startKey = studentMS;
        const endKey = studentMS;
    
        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResults = await this._GetAllResults(iterator);
    
        return JSON.stringify(allResults);
    }
    

    async ResultExists(ctx, subjectMS, studentMS) {//check result of blockchain
        const resultState = await ctx.stub.getState(subjectMS, studentMS);
        return resultState && resultState.length > 0;
    }

    async CheckResultExists(ctx, subjectMS, studentMS) {//check result of api
        const resultState = await ctx.stub.getState(subjectMS, studentMS);
        return resultState.toString();
    }

    async GetAllResult(ctx) {
        const startKey = '';
        const endKey = '';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);
        const allResult = await this._GetAllResults(iterator);

        return JSON.stringify(allResult);
    }

    async _GetAllResults(iterator) {
        const allResults = [];
        let res = await iterator.next();

        while (!res.done) {
            if (res.value && res.value.value.toString()) {
                const jsonRes = {
                    Key: res.value.key,
                    Record: JSON.parse(res.value.value.toString('utf8'))
                };

                allResults.push(jsonRes);
            }

            res = await iterator.next();
        }

        iterator.close();
        return allResults;
    }

    //update Result
    async UpdateResult(ctx, resultID, subjectMS, studentMS, teacherMS, semester, score, date_awarded) {
        const exists = await this.ResultExists(ctx, resultID);
        if (!exists) {
            throw new Error(`Result ${resultID} does not exist`);
        }

        let result = {
            docType: 'result',
            resultID,
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

}

module.exports = StoreContract;
