import { Router } from 'express';
const router = Router();
import {getContract} from '../config/config.js';

// Home route
router.get('/', (req, res) => {
    res.json('Hello World');
});

const checkAccess = async (req, res, next) => {
  try {
    const { address } = req.query;
    const contract = getContract();
    const hasAccess = await contract.hasValidAccess(address);
    if (hasAccess) {
        next();
    } else {
        return res.status(403).json("Access denied. Please pay to access.");
    }
  } catch (error) {
    return res.status(500).json(error.message)
  }

};

// About route
router.get('/llm', checkAccess, async (req, res) => {
    res.json('Successfully connected to the LLM API');
});

export default router;
