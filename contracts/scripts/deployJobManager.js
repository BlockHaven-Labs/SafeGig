const hre = require("hardhat");

async function main() {
  // 🔹 Replace with deployed SafeGigRegistry address
  const registryAddress = "0xYourRegistryAddress";

  const JobManager = await hre.ethers.getContractFactory("JobManager");
  const jobManager = await JobManager.deploy(registryAddress);
  await jobManager.deployed();

  console.log("✅ JobManager deployed at:", jobManager.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});