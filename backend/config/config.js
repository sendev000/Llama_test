import { ethers } from "ethers"
const contractAddress = "0xB9e09e1447e25E10A9fC35cD26510bCcE613aF57";
const RPC_URL = "https://sepolia.base.org";
import { abi } from "../abi/abi.js"

export const getContract = () => new ethers.Contract(
    contractAddress,
    abi,
    new ethers.providers.JsonRpcProvider(RPC_URL)
);