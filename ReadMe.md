 #### 1. **Smart Contract for Payments**

The smart contract is implemented in Solidity and deployed on a testnet (Base Sepolia). 
Key components include:
  
  LLMAccessControl contract address: 0xB9e09e1447e25E10A9fC35cD26510bCcE613aF57
 
  Mock USDC address: 0x1622986DD39557aa17Ea45eEc617a3466De96da5

  https://sepolia.basescan.org/address/0xB9e09e1447e25E10A9fC35cD26510bCcE613aF57
  https://sepolia.basescan.org/address/0x1622986DD39557aa17Ea45eEc617a3466De96da5

  PaymentInfo: 10 USDC per hour

- **Functions**:
  - `payForAccess()`: This function allows users to send cryptocurrency to the contract. Upon successful payment, it records the current timestamp and grants access for a predetermined duration (e.g., 1 hour).
  - `hasValidAccess()`: This function checks if a user’s access is still valid by comparing the current time with the stored timestamp.

#### 2. **API Implementation**

The API is built using Node.js and Express, handling requests from users seeking access to the LLM.

- **Middleware**: A middleware function checks the user's payment status before allowing access to the API. It calls the smart contract's `checkAccess()` function and determines if the user is eligible to proceed.
- **Endpoints**:
  - `GET /llm`: Users call this endpoint to access the LLM. The middleware checks if they have paid and if their access is still valid.