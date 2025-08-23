const hre = require("hardhat");

async function main() {
  const SafeGig = await hre.ethers.getContractFactory("SafeGig");
  const safeGig = await SafeGig.deploy();
  await safeGig.waitForDeployment();

  console.log("✅ SafeGig deployed to:", await safeGig.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});