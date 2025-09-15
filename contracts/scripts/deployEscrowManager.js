const hre = require("hardhat");

async function main() {
  // 🔹 Replace with deployed SafeGigRegistry address
  const registryAddress = "0xYourRegistryAddress";
  // 🔹 Set your fee recipient wallet
  const feeRecipient = "0xYourWalletAddress";
  const feePercentage = 2; // Example: 2%

  const EscrowManager = await hre.ethers.getContractFactory("EscrowManager");
  const escrowManager = await EscrowManager.deploy(registryAddress, feeRecipient, feePercentage);
  await escrowManager.deployed();

  console.log("✅ EscrowManager deployed at:", escrowManager.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});