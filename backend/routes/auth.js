import express from 'express';
import { createStudent, createTeacher, studentLogin } from '../controller/authController.js';

const router = express.Router();

// create new student
router.post('/registerStudent', createStudent);

// create new teacher 
router.post('/registerTeacher', createTeacher);

// student login
router.get('/login/student', studentLogin);

export default router;