async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log(await deployer.getBalance());

  const MockToken = await ethers.deployContract("MockToken", ["USDC", "usdc", 18]);
  console.log("MockToken address:", MockToken.address);

  const LLMAccessControl = await ethers.deployContract("LLMAccessControl", [MockToken.address, 10]);
  console.log("LLMAccessControl address:", LLMAccessControl.address);

}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
