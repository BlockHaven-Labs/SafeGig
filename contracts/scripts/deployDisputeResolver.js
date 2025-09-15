const hre = require("hardhat");

async function main() {
  // 🔹 Replace with deployed SafeGigRegistry & EscrowManager address
  const registryAddress = "0xYourRegistryAddress";
  const escrowAddress = "0xYourEscrowAddress";

  const DisputeResolver = await hre.ethers.getContractFactory("DisputeResolver");
  const disputeResolver = await DisputeResolver.deploy(registryAddress, escrowAddress);
  await disputeResolver.deployed();

  console.log("✅ DisputeResolver deployed at:", disputeResolver.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});