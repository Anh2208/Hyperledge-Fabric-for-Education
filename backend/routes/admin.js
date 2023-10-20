import express from "express";
import { getAllStudent, getAllTeacher, getAllAdmin } from "../controller/adminController.js";

const router = express.Router();

//get all student
router.get("/getAllStudent", getAllStudent);

//get all teacher
router.get("/getAllTeacher", getAllTeacher);

//get all admin
router.get("/getAllAdmin", getAllAdmin);

export default router;
