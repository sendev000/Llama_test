import mongoose, { mongo } from "mongoose";

const apiKeysSchema = new mongoose.Schema(
    {
        wallet: String,
        api_key_hash: String,
        valid_until: Number 
    }
);

const api_keys = mongoose.model("API_KEYS", apiKeysSchema);

export {api_keys};