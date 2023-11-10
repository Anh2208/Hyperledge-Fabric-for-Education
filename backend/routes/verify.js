import express from "express";
import { createVerifyList, deleteStudentList, getAllList, getVerifyByMSSV, updateVerifyList } from "../controller/verifyController.js";

const router = express.Router();

// add student in list
router.post('/', createVerifyList);

// get all student in list
router.get('/', getAllList);

// get all student in list
router.get('/getList/getVerifyByMSSV', getVerifyByMSSV);

// update verify in list
router.put('/', updateVerifyList);

// get all student in list
router.delete('/', deleteStudentList);

export default router;