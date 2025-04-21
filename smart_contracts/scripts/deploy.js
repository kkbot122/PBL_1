// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`.
// In that case, the Hardhat Runtime Environment is members injected automatically
// into the global scope.
const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const TransactionValidator = await hre.ethers.getContractFactory("TransactionValidator");
  console.log("Deploying TransactionValidator...");
  const validator = await TransactionValidator.deploy();

  // Wait for deployment transaction to be mined
  await validator.waitForDeployment();

  // Get the contract address
  const address = await validator.getAddress();
  console.log("TransactionValidator deployed to:", address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 