const hre = require("hardhat");

async function main() {
  const SafeGigRegistry = await hre.ethers.getContractFactory("SafeGigRegistry");
  const registry = await SafeGigRegistry.deploy();
  await registry.deployed();

  console.log("✅ SafeGigRegistry deployed at:", registry.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});