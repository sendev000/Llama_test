const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LLMAccessControl", function () {
  let llmAccessControl, mockERC20;
  let owner, user1, user2, treasury;
  const accessPrice = ethers.utils.parseUnits("100", 18); // 100 tokens
  const accessDuration = 3600; // 1 hour in seconds

  beforeEach(async () => {
    [owner, user1, user2, treasury] = await ethers.getSigners();

    // Deploy mock ERC-20 token
    const MockERC20 = await ethers.getContractFactory("MockToken");
    mockERC20 = await MockERC20.deploy("Test Token", "TTK", 18);
    await mockERC20.deployed();

    // Deploy LLMAccessControl contract
    const LLMAccessControl = await ethers.getContractFactory("LLMAccessControl");
    llmAccessControl = await LLMAccessControl.deploy(mockERC20.address, accessPrice);
    await llmAccessControl.deployed();

    // Mint some tokens to users
    await mockERC20.transfer(user1.address, ethers.utils.parseUnits("500", 18));
    await mockERC20.transfer(user2.address, ethers.utils.parseUnits("500", 18));
  });

  describe("Access Control", function () {
    it("should allow user to pay for access", async () => {
      // User1 approves contract to spend tokens
      await mockERC20.connect(user1).approve(llmAccessControl.address, accessPrice);

    // User1 pays for access
    await llmAccessControl.connect(user1).payForAccess();
    //   await expect(llmAccessControl.connect(user1).payForAccess())
    //     .to.emit(llmAccessControl, "AccessGranted")
    //     .withArgs(user1.address, await ethers.provider.getBlock("latest").then(block => block.timestamp + accessDuration + 1));

      // Check if user1 has valid access
      expect(await llmAccessControl.hasValidAccess(user1.address)).to.equal(true);
    });

    it("should not allow payment if user has insufficient balance", async () => {
      // Try to pay without enough tokens
      await mockERC20.connect(user1).approve(llmAccessControl.address, accessPrice.sub(ethers.utils.parseUnits("50", 18)));

      await expect(llmAccessControl.connect(user1).payForAccess()).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("should extend access when user pays again before access expires", async () => {
      // Approve and pay for access the first time
      await mockERC20.connect(user1).approve(llmAccessControl.address, accessPrice);
      await llmAccessControl.connect(user1).payForAccess();

      const initialAccessTime = (await llmAccessControl.userAccess(user1.address));

      // Pay again before access expires
      await mockERC20.connect(user1).approve(llmAccessControl.address, accessPrice);
      await llmAccessControl.connect(user1).payForAccess();
      const updatedAccessTime = (await llmAccessControl.userAccess(user1.address));

      expect(updatedAccessTime).to.be.gt(initialAccessTime);
    });

    it("should revoke access after duration expires", async () => {
      // Approve and pay for access
      await mockERC20.connect(user1).approve(llmAccessControl.address, accessPrice);
      await llmAccessControl.connect(user1).payForAccess();

      // Increase time beyond the access duration
      await ethers.provider.send("evm_increaseTime", [accessDuration + 1]);
      await ethers.provider.send("evm_mine");

      // Check if access is revoked after the duration
      expect(await llmAccessControl.hasValidAccess(user1.address)).to.equal(false);
    });
  });

  describe("Withdraw Tokens", function () {
    it("should allow the owner to withdraw tokens", async () => {
      // User1 pays for access
      await mockERC20.connect(user1).approve(llmAccessControl.address, accessPrice);
      await llmAccessControl.connect(user1).payForAccess();

      const contractBalance = await mockERC20.balanceOf(llmAccessControl.address);

      // Withdraw the tokens to treasury
      await expect(llmAccessControl.withdrawTokens(mockERC20.address, treasury.address))
        .to.emit(mockERC20, "Transfer")
        .withArgs(llmAccessControl.address, treasury.address, contractBalance);

      // Check treasury balance
      const treasuryBalance = await mockERC20.balanceOf(treasury.address);
      expect(treasuryBalance).to.equal(contractBalance);
    });

    it("should not allow non-owner to withdraw tokens", async () => {
      // User1 tries to withdraw tokens
      await expect(
        llmAccessControl.connect(user1).withdrawTokens(mockERC20.address, treasury.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should revert if no tokens to withdraw", async () => {
      // Attempt to withdraw with no balance in the contract
      await expect(
        llmAccessControl.withdrawTokens(mockERC20.address, treasury.address)
      ).to.be.revertedWith("No tokens to withdraw");
    });
  });

  describe("Update Settings", function () {
    it("should allow the owner to update access price", async () => {
      const newPrice = ethers.utils.parseUnits("200", 18);
      await llmAccessControl.updateAccessPrice(newPrice);
      expect(await llmAccessControl.accessPrice()).to.equal(newPrice);
    });

    it("should allow the owner to update access duration", async () => {
      const newDuration = 2 * 3600; // 2 hours
      await llmAccessControl.updateAccessDuration(newDuration);
      expect(await llmAccessControl.accessDuration()).to.equal(newDuration);
    });

    it("should allow the owner to update payment token", async () => {
      // Deploy a new mock token and update the payment token
      const MockERC20 = await ethers.getContractFactory("MockToken");
      const newToken = await MockERC20.deploy("New Token", "NTK", 18);
      await newToken.deployed();

      await llmAccessControl.updatePaymentToken(newToken.address);
      expect(await llmAccessControl.paymentToken()).to.equal(newToken.address);
    });

    it("should revert if non-owner tries to update settings", async () => {
      const newPrice = ethers.utils.parseUnits("200", 18);
      await expect(
        llmAccessControl.connect(user1).updateAccessPrice(newPrice)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
