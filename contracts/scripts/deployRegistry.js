const hre = require("hardhat");

async function main() {
  const SafeGigRegistry = await hre.ethers.getContractFactory(
    "SafeGigRegistry"
  );
  const registry = await SafeGigRegistry.deploy();
  await registry.deployed();

  console.log("\n🔑 Granting JOB_MANAGER_ROLE to JobManager...");
  const JOB_MANAGER_ROLE = ethers.keccak256(
    ethers.toUtf8Bytes("JOB_MANAGER_ROLE")
  );
  await registry.grantRole(JOB_MANAGER_ROLE, jobs.target);
  console.log("✅ JobManager granted permission to update stats");

  console.log("✅ SafeGigRegistry deployed at:", registry.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
