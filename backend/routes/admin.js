import express from "express";
import { getAllStudent, getAllTeacher } from "../controller/adminController.js";

const router = express.Router();

//get all student
router.get("/getAllStudent", getAllStudent);

//get all teacher
router.get("/getAllTeacher", getAllTeacher);

export default router;
