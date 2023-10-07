import express from 'express';
import { createStudent, createTeacher } from '../controller/authController.js';

const router = express.Router();

// create new student
router.post('/registerStudent', createStudent);

// create new teacher 
router.post('/registerTeacher', createTeacher);

export default router;