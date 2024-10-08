/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-contract-sizer");
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = {
  contractSizer: {
    alphaSort: false,
    runOnCompile: true,
    disambiguatePaths: false,
  },
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10,
            details: {
              constantOptimizer: true,
            },
          },
          viaIR: true,
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  networks: {
    polygon: {
      url: `https://polygon.llamarpc.com`,
      accounts: [PRIVATE_KEY],
    },
    sepolia: {
      url: `https://rpc2.sepolia.org`,
      accounts: [PRIVATE_KEY],
    },
    base: {
      url: "https://developer-access-mainnet.base.org",
      accounts: [PRIVATE_KEY],
      chainId: 8453,
    },
    base_sepolia: {
      url: `https://sepolia.base.org`,
      accounts: [PRIVATE_KEY],
      chainId: 84532,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: "WZS86WJX14YANZ953R3RIDAEF8VAPI6XR7",
      polygon: "2MAFBAFB56RCKNEGA3EU37GWQRP3VWT54C",
      base: "AJUCW5T38RXW4KXMA87ND9AKA29PZYUSR4",
      base_sepolia: "CNSNQTUKSXZ8936Y2SW2W5GI82JIHVYY6H",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org/",
        },
      },
      {
        network: "base_sepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/",
        },
      },
    ],
  },
};
