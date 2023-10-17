import express from "express";
import {
  createStudent,
  createTeacher,
  createAdmin,
  userLogin,
} from "../controller/authController.js";

const router = express.Router();

// create new student
router.post("/registerStudent", createStudent);

// create new teacher
router.post("/registerTeacher", createTeacher);

// create admin at department
router.post("/registerAdmin", createAdmin);

// student login
router.post("/login", userLogin);

export default router;
