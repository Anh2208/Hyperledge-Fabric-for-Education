import express from "express";
import {
  createSubject,
  updateSubject,
  deleteSubject,
  getSingleSubject,
  getAllSubject,
  getSubjectByMS,
} from "../controller/subjectController.js";

const router = express.Router();

// create new subject
router.post("/", createSubject);

// update subject
router.put("/:id", updateSubject);

// delete subject
router.delete("/:id", deleteSubject);

// get single subject
router.get("/:id", getSingleSubject);

// get all subject
router.get("/", getAllSubject);

// get subject by MS
router.get("/search/getSubjectByMS", getSubjectByMS);

export default router;
