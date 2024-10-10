import { Router } from 'express';
const router = Router();
import bcrypt from "bcrypt";
import {getContract} from '../config/config.js';
import { api_keys } from '../models/db.js';
import { generateApiKey } from "../utils/crypto_utils.js";

//Middlewares
const checkAccess = async (req, res, next) => {
  try {
    const { address } = req.query;
    const contract = getContract();
    const hasAccess = await contract.hasValidAccess(address);
    if (hasAccess) {
        next();
    } else {
        return res.status(403).json({message: "Access denied. Please pay to access."});
    }
  } catch (error) {
    return res.status(500).json({message: error.message})
  }
};

const authenticateApiKey = async (req, res, next) => {
  const { address } = req.query;
  const apiKey = req.header('x-api-key');

  const existingUser = await api_keys.findOne({ wallet: address });
  if(existingUser) {
    const api_key_hash = existingUser.api_key_hash;
    const valid_until = existingUser.valid_until;
    const currentTime = Math.floor(Date.now() / 1000);
    if(currentTime > valid_until) {
      return res.status(403).json({ message: "time expired" });
    }
    const isValid = await bcrypt.compare(apiKey, api_key_hash);
    console.log("authenticateApiKey", isValid);

    if (!isValid) {
      return res.status(403).json({ message: "Invalid API key" });
    }
  } else {
    return res.status(403).json({ message: "Invalid user" });
  }

  next();
}

// APIS
router.get('/', (req, res) => {
  res.json({message: 'Hello World'});
});

// About route
router.get('/llm', authenticateApiKey, checkAccess, async (req, res) => {
    res.json( {message: 'Successfully connected to the LLM API'});
});

router.post('/getApiKey', async (req, res) => {
  try {
    const {address, valid_until} = req.body;
    const wallet = String(address).toLocaleLowerCase();
  
      // // Generate API key and handle the next steps
      const apiKey = generateApiKey();
      console.log("apiKey", apiKey);
  
      // Hash the API key
      const hashedApiKey = await bcrypt.hash(apiKey, 10);
      console.log("hashedApiKey", hashedApiKey);
  
      await api_keys.updateOne(
          { wallet: wallet },  // Query to find the document by wallet address
          {
              $set: {
                  api_key_hash: hashedApiKey,
                  valid_until: Number(valid_until)
              }
          },
          { upsert: true }  // This option will insert the document if it doesn't exist
      );
    res.json( {message: apiKey});
  } catch (error) {
    res.status(500).json({"message" : error.message})
  }

});

export default router;
