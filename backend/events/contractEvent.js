import { getContract } from "../config/config.js";
import { generateApiKey } from "../utils/crypto_utils.js";
import bcrypt from "bcrypt";
import { api_keys } from "../models/db.js";

const LLMAccessControl = getContract();
// LLMAccessControl.on("AccessGranted", async (userAddress, validUntil) => {
//     console.log(`Deposit Event: ${userAddress} Valid: ${validUntil}`);
//     const address = String(userAddress).toLocaleLowerCase();

//     // // Generate API key and handle the next steps
//     const apiKey = generateApiKey();

//     // Hash the API key
//     const hashedApiKey = await bcrypt.hash(apiKey, 10);

//     await api_keys.updateOne(
//         { wallet: address },  // Query to find the document by wallet address
//         {
//             $set: {
//                 api_key_hash: hashedApiKey,
//                 valid_until: Number(validUntil)
//             }
//         },
//         { upsert: true }  // This option will insert the document if it doesn't exist
//     );
//     console.log(`API key and valid_until updated/inserted for wallet ${userAddress}`);

// });

export {LLMAccessControl};

