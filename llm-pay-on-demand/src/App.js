import React, { useEffect, useState } from 'react';
import './App.css';
import { control_abi } from './abi/control_abi';
import { token_abi } from './abi/token_abi';
import { ethers } from 'ethers';
import { API_URL, baseChainId, baseChainParams, CONTRACT_ADDRESS } from './config/config';
import { metaMaskImage } from './assets/metamask';
import { formatAddress } from './utils/utils';
import AlertModal from './components/alertModal';

function App() {
  const [apiResponse, setApiResponse] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [tokenInfo, setTokenInfo] = useState({ tokenAddress: '', price: '', symbol: '' });
  const [remainingTime, setRemainingTime] = useState(0);
  const [accessStatus, setAccessStatus] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setErrorMessage('MetaMask is not installed. Please install it to use this app.');
        return;
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      if (chainId !== baseChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: baseChainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [baseChainParams],
              });
            } catch {
              setErrorMessage('Failed to add Base network to MetaMask.');
              return;
            }
          } else {
            setErrorMessage('Failed to switch to the Base network.');
            return;
          }
        }
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWalletAddress(accounts[0]);
      setIsConnected(true);
    } catch {
      setErrorMessage('Failed to connect to MetaMask.');
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsConnected(false);
    setErrorMessage('');
    localStorage.clear();
    sessionStorage.clear();
  };

  const payWithCrypto = async () => {
    setApiResponse('');
    setErrorMessage('');
    if (!walletAddress) {
      setErrorMessage('Please connect your MetaMask wallet first.');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, control_abi, signer);
      const tokenAddress = await contract.paymentToken();
      const token = new ethers.Contract(tokenAddress, token_abi, signer);
      const accessPrice = await contract.accessPrice();
      const allowance = await token.allowance(walletAddress, CONTRACT_ADDRESS);

      if (allowance < accessPrice) {
        const tx = await token.approve(CONTRACT_ADDRESS, accessPrice);
        await tx.wait();
      }

      const tx = await contract.payForAccess();
      await tx.wait();
      await fetchUserInfo();
      await callLLMApi();
    } catch {
      setErrorMessage('Failed to call the contract function.');
    }
  };

  const callLLMApi = async () => {
    try {
      setApiResponse('');
      setErrorMessage('');
      if (!walletAddress) {
        setErrorMessage('Please connect your MetaMask wallet first.');
        return;
      }

      const response = await fetch(`${API_URL}llm?address=${walletAddress}`);
      const data = await response.json();
      if (response.status !== 200) {
        setErrorMessage(data);
        return;
      }
      setApiResponse(data);
    } catch {
      setErrorMessage("Failed to access the API.");
    }
  };

  useEffect(() => {
    fetchPaymentInfo();
    if (walletAddress) {
      fetchUserInfo();
      callLLMApi();
    }
  }, [walletAddress]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingTime(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    hasValidAccess();
  }, [walletAddress]);

  const fetchPaymentInfo = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, control_abi, provider);
    const tokenAddress = await contract.paymentToken();
    const token = new ethers.Contract(tokenAddress, token_abi, provider);
    const decimals = await token.decimals();
    const accessPrice = await contract.accessPrice();
    const symbol = await token.symbol();
    
    setTokenInfo({
      tokenAddress,
      price: accessPrice / Math.pow(10, decimals),
      symbol,
    });
  };

  const fetchUserInfo = async () => {
    if (!walletAddress) {
      setRemainingTime(0);
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, control_abi, provider);
    const accessTime = (await contract.userAccess(walletAddress)).toNumber();
    const currentTime = Math.floor(Date.now() / 1000);

    setRemainingTime(Math.max(accessTime - currentTime, 0));
  };

  const hasValidAccess = async () => {
    if (!walletAddress) {
      setAccessStatus(false);
      return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, control_abi, provider);
    const status = await contract.hasValidAccess(walletAddress);
    setAccessStatus(status);
    setAlertOpen(!status);
  };

  const formatTime = (secs) => {
    const seconds = Math.floor(secs % 60);
    const minutes = Math.floor((secs / 60) % 60);
    const hours = Math.floor((secs / (60 * 60)) % 24);
    const days = Math.floor(secs / (60 * 60 * 24));

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  const closeAlert = () => setAlertOpen(false);

  return (
    <div className="App">
      <div className='NavBar'>
        <h2>LLM Pay-on-Demand</h2>
        <div className='WalletConnect'>
          <button onClick={isConnected ? disconnectWallet : connectWallet}>
            <img src={metaMaskImage} alt="Metamask" />
            <div>{isConnected ? formatAddress(walletAddress) : `Connect Wallet`}</div>
          </button>
        </div>
      </div>
      <div>
        <h2>🎇Please pay with cryptocurrency to access the AI LLM.</h2>
        <div className='Card'>
          <h3>Payment Details</h3>
          <div className="token-info">
            <h4>Token: {tokenInfo.symbol}</h4>
            <h4>Amount: {tokenInfo.price}</h4>
          </div>
          <button onClick={payWithCrypto}>Pay With Crypto</button>
        </div>
      </div>
      <div>
        <h2>{accessStatus ? "✨ Congratulations" : "😪 Pay to get the Access"}</h2>
        <div className='Card'>
          <h3>{accessStatus ? "🎉 You Have Successfully Granted the AI LLM API." : "😰 It seems you haven't paid for access yet."}</h3>
          <h4>Remaining Time: {formatTime(remainingTime)}</h4>
          <h3>🧨 API RESPONSE:</h3>
          <h4>{apiResponse}</h4>
        </div>
      </div>
      <AlertModal 
          isOpen={isAlertOpen} 
          onClose={closeAlert} 
          message="It seems you haven't paid for access yet. Please send the required amount in cryptocurrency to proceed. After payment, you will be granted access for one hour." 
      />
    </div>
  );
}

export default App;
