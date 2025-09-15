const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying with account:", deployer.address);

  const SafeGigFactory = await hre.ethers.getContractFactory("SafeGigFactory");
  const factory = await SafeGigFactory.deploy();
  await factory.deployed();

  console.log("✅ SafeGigFactory deployed at:", factory.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});