import express from "express";
import { createResult, updateResult, deleteResult, getResultMongo, getResultBlock } from "../controller/resultController.js";

const router = express.Router();

// create Result
router.post('/', createResult);

// update Result
router.put('/:id', updateResult);

// delete Result
router.delete('/:id', deleteResult);

// get result by studentMS
router.get('/search/ResultBlock', getResultBlock);

// get result by studentMS
router.get('/search/ResultMongo', getResultMongo);

export default router;
