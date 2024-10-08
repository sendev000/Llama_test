const hre = require("hardhat");

async function main() {
  await hre.run("verify:verify", {
    address: "0x1622986DD39557aa17Ea45eEc617a3466De96da5",
    constructorArguments: ["USDC", "usdc", 18],
  });
  await hre.run("verify:verify", {
    address: "0xB9e09e1447e25E10A9fC35cD26510bCcE613aF57",
    constructorArguments: [
      "0x1622986DD39557aa17Ea45eEc617a3466De96da5",
      10
    ]
  });
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
