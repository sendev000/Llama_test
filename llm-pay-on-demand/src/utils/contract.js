import { ethers } from "ethers"
import { control_abi } from "../abi/control_abi.js"
const contractAddress = "0xB9e09e1447e25E10A9fC35cD26510bCcE613aF57";
const RPC_URL = "https://sepolia.base.org";

export const getContract = () => new ethers.Contract(
    contractAddress,
    control_abi,
    new ethers.providers.JsonRpcProvider(RPC_URL)
);