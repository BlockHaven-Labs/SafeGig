const hre = require("hardhat");

async function main() {
  // 🔹 Replace with deployed SafeGigRegistry address
  const registryAddress = "0xYourRegistryAddress";

  const ReputationSystem = await hre.ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await ReputationSystem.deploy(registryAddress);
  await reputationSystem.deployed();

  console.log("✅ ReputationSystem deployed at:", reputationSystem.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});