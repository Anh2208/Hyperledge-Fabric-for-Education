import express from "express";

import {
  createGroup,
  deleteGroup,
  updateGroup,
  getGroupbyID,
  getAllGroup,
  getGroupbyMSGV
} from "../controller/groupController.js";

const router = express.Router();

// create group
router.post("/", createGroup);

// delete group
router.delete("/:id", deleteGroup);

// update group
router.put("/:id", updateGroup);

// get group
router.get("/:id", getGroupbyID);

// get all
router.get("/getGroup/getAll", getAllGroup);

// get group by msgv
router.post("/getGroup/getGroupbyMSGV", getGroupbyMSGV);

export default router;
