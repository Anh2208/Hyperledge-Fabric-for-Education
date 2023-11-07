import express from "express";

import { createDegree, getDegreeImage, getInforNFT, updateDegree } from '../controller/degreeController.js'

const router = express.Router();

// create degree
router.post('/', createDegree);

// update degree
router.put('/', updateDegree);

// get degree
router.get('/', getDegreeImage);

// get degree
router.get('/nft/getInfor', getInforNFT);

export default router;