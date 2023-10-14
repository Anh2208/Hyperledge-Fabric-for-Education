import express from "express";
import {
    createResult, createResultBlock, updateResult, deleteResult,
     getAllResult, getAllResultByStudentMS,
    getAllResultByTeacherMS, getAllResultByID, getAllResultByGroup,
    getResultByID, getResultByMSSV, getResultByMSGV, getResultByGroup,
    getResultHistory
} from "../controller/resultController.js";

const router = express.Router();

// create Result in Mongodb
router.post('/:id', createResult);

// create Result in Blockchain
router.put('/ResultBlock/create', createResultBlock);

// update Result
router.put('/ResultBlock/update', updateResult);

// delete Result
router.delete('/:id', deleteResult);

//search in mongodb
// get result by studentMS
// router.get('/search/ResultMongo', getResultMongo);

// search in blockchain
// get history result
router.get('/search/getResultHistory', getResultHistory);
// get result by mssv
router.get('/search/getAllResult', getAllResult);
// get result by mssv
router.get('/search/getAllResultByID', getAllResultByID);
// get result by mssv
router.get('/search/getAllResultByGroup', getAllResultByGroup);
// get result by mssv
router.get('/search/getAllResultByStudentMS', getAllResultByStudentMS);
// get result by mssv
router.get('/search/getAllResultByTeacherMS', getAllResultByTeacherMS);

// search result in mongodb
// get result by id
router.get('/search/mongodb/getResultByID', getResultByID);

// search result by MSSV
router.get('/search/mongodb/getResultByMSSV', getResultByMSSV);

// search result by MSGV
router.get('/search/mongodb/getResultByMSGV', getResultByMSGV);

// search result by Group
router.get('/search/mongodb/getResultByGroup', getResultByGroup);

export default router;
