const hre = require("hardhat");

async function main() {
  // 🔹 Replace with deployed SafeGigRegistry address
  const registryAddress = "0xYourRegistryAddress";
  const feePercentage = 250;
  const feeRecipient = deployer.address;
  if (feeRecipient === ethers.ZeroAddress) {
    throw new Error("Fee recipient cannot be zero address");
  }

  const EscrowManager = await hre.ethers.getContractFactory("EscrowManager");
  const escrowManager = await EscrowManager.deploy(
    registryAddress,
    feeRecipient,
    feePercentage
  );
  await escrowManager.deployed();

  console.log("✅ EscrowManager deployed at:", escrowManager.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
