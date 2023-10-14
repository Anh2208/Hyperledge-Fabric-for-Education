import express from 'express';

import {createGroup, deleteGroup, updateGroup, getGroup} from "../controller/groupController.js"; 

const router = express.Router();

// create group
router.post('/', createGroup);

// delete group
router.delete('/:id', deleteGroup);

// update group
router.put('/:id', updateGroup);

// get group
router.get('/', getGroup);

export default router;