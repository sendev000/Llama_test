// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LLMAccessControl is Ownable, ReentrancyGuard {

    IERC20 public paymentToken;  // ERC-20 token used for payments
    uint256 public accessPrice;  // Price in tokens for access
    uint256 public accessDuration = 1 hours;  // Duration for which access is granted

    struct Access {
        uint256 validUntil;
    }

    mapping(address => Access) public userAccess;
    
    // Event triggered when a user pays for access
    event AccessGranted(address indexed user, uint256 validUntil);

    // Modifier to validate non-zero addresses
    modifier isValidAddress(address _address) {
        require(_address != address(0), "Invalid address: zero address");
        _;
    }

    constructor(address _tokenAddress, uint256 _accessPrice) isValidAddress(_tokenAddress) {
        require(_accessPrice > 0, "Access price must be greater than zero");
        paymentToken = IERC20(_tokenAddress);
        accessPrice = _accessPrice;
    }
    
    // Function to pay for access using ERC-20 tokens
    function payForAccess() external nonReentrant {
        require(paymentToken.balanceOf(msg.sender) >= accessPrice, "Insufficient token balance");

        // Transfer the required amount of tokens to the contract
        paymentToken.transferFrom(msg.sender, address(this), accessPrice);

        // Extend or grant access for the user
        if (userAccess[msg.sender].validUntil > block.timestamp) {
            userAccess[msg.sender].validUntil += accessDuration;
        } else {
            userAccess[msg.sender].validUntil = block.timestamp + accessDuration;
        }

        emit AccessGranted(msg.sender, userAccess[msg.sender].validUntil);
    }

    // Function to check if a user has valid access
    function hasValidAccess(address _user) external view returns (bool) {
        return userAccess[_user].validUntil >= block.timestamp;
    }

    // Owner can withdraw collected ERC-20 tokens to a treasury address (Owner only)
    function withdrawTokens(address _token, address _treasury) 
        external 
        onlyOwner 
        isValidAddress(_treasury) 
        isValidAddress(_token) 
        nonReentrant 
    {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        IERC20(_token).transfer(_treasury, balance);
    }

    // Function to update access price (Owner only)
    function updateAccessPrice(uint256 _newPrice) external onlyOwner {
        require(_newPrice > 0, "Invalid price: must be greater than zero");
        accessPrice = _newPrice;
    }

    // Function to update access duration (Owner only)
    function updateAccessDuration(uint256 _accessDuration) external onlyOwner {
        require(_accessDuration > 0, "Invalid duration: must be greater than zero");
        accessDuration = _accessDuration;
    }

    // Function to change the ERC-20 token used for payment (Owner only)
    function updatePaymentToken(address _tokenAddress) external onlyOwner isValidAddress(_tokenAddress) {
        paymentToken = IERC20(_tokenAddress);
    }
}
