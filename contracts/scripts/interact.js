const hre = require("hardhat");

async function main() {
  const [deployer, freelancer] = await hre.ethers.getSigners();

  const safeGig = await hre.ethers.getContractAt(
    "SafeGig",
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"
  );

  console.log("Using contract at:", safeGig.target);

  // Create a gig
  const tx = await safeGig
    .connect(deployer)
    .createGig(freelancer.address, { value: hre.ethers.parseEther("1") });
  await tx.wait();
  console.log("✅ Gig created");

  // Check gigCounter
  const gigCounter = await safeGig.gigCounter();
  console.log("Current gigCounter:", gigCounter.toString());

  // Read back last gig
  const gig = await safeGig.gigs(gigCounter);
  console.log("Gig details:", gig);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});