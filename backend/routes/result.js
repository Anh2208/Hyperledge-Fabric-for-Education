import express from "express";
import {
  createResult,
  createResultBlock,
  updateResult,
  deleteResult,
  getAllResult,
  getAllResultByStudentMS,
  getAllResultByTeacherMS,
  getAllResultByID,
  getAllResultByGroup,
  getResultByID,
  getResultByMSSV,
  getResultByMSGV,
  getResultByGroup,
  getResultHistory,
  deleteResultDB,
  updateResultData,
  confirmResult,
  getResultByStudentID,
  checkResult,
  getDetailGroup,
  grantAccessResult,
  revokeAccessResult,
  checkAllResult
} from "../controller/resultController.js";

const router = express.Router();

// create Result in Mongodb
router.post("/:id", createResult);

// check synchronized of result with all history change
router.post("/check/confirmResult/:id", confirmResult);

// check synchronized of result with current value 
router.post("/check/checkResult/:id", checkResult);

// check synchronized of result with current value 
router.post("/check/checkAllResult", checkAllResult);

// grantAccessResult
router.post("/access/grantAccessResult", grantAccessResult);

// grantAccessResult
router.post("/access/revokeAccessResult", revokeAccessResult);

// create Result in Blockchain
router.put("/ResultBlock/create", createResultBlock);

// update Result in blockchain
router.put("/ResultBlock/update", updateResult);

// update Result in blockchain
router.put("/ResultMongo/update", updateResultData);

// delete Result
router.delete("/deleteResult/block/:id", deleteResult);

// delete Result
router.delete("/deleteResult/mongodb/:id", deleteResultDB);
//search in mongodb
// get result by studentMS
// router.get('/search/ResultMongo', getResultMongo);

// search in blockchain
// get history result
router.post("/search/getResultHistory", getResultHistory);
// get result by mssv
router.get("/search/getAllResult", getAllResult);
// get result by mssv
router.get("/search/getAllResultByID", getAllResultByID);
// get result by mssv
router.get("/search/getAllResultByGroup", getAllResultByGroup);
// get result by mssv
router.get("/search/getAllResultByStudentMS", getAllResultByStudentMS);
// get result by mssv
router.get("/search/getAllResultByTeacherMS", getAllResultByTeacherMS);

// search result in mongodb
// get result by id
router.get("/search/mongodb/getResultByID", getResultByID);
// search result by MSSV
router.get("/search/mongodb/getResultByMSSV", getResultByMSSV);
// search result by StudentID
router.get("/search/mongodb/getResultByStudentID", getResultByStudentID);
// search result by MSGV
router.get("/search/mongodb/getResultByMSGV", getResultByMSGV);
// search result by Group
router.get("/search/mongodb/getResultByGroup", getResultByGroup);


// search getDetailGroup
router.post("/search/block/getDetailGroup", getDetailGroup);

export default router;
