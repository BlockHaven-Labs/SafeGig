const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Deploying with account:", deployer.address);

  // === Deploy SafeGigRegistry ===
  const SafeGigRegistry = await hre.ethers.getContractFactory("SafeGigRegistry");
  const registry = await SafeGigRegistry.deploy();
  await registry.waitForDeployment();
  console.log("✅ SafeGigRegistry deployed at:", registry.target);

  // === Deploy ReputationSystem ===
  const ReputationSystem = await hre.ethers.getContractFactory("ReputationSystem");
  const reputation = await ReputationSystem.deploy();
  await reputation.waitForDeployment();
  console.log("✅ ReputationSystem deployed at:", reputation.target);

  // === Deploy DisputeResolver ===
  const DisputeResolver = await hre.ethers.getContractFactory("DisputeResolver");
  const resolver = await DisputeResolver.deploy();
  await resolver.waitForDeployment();
  console.log("✅ DisputeResolver deployed at:", resolver.target);

  // === Deploy EscrowManager ===
  const EscrowManager = await hre.ethers.getContractFactory("EscrowManager");
  const escrow = await EscrowManager.deploy();
  await escrow.waitForDeployment();
  console.log("✅ EscrowManager deployed at:", escrow.target);

  // === Deploy JobManager ===
  const JobManager = await hre.ethers.getContractFactory("JobManager");
  const jobs = await JobManager.deploy();
  await jobs.waitForDeployment();
  console.log("✅ JobManager deployed at:", jobs.target);

  // === Deploy SafeGigFactory (link everything together) ===
  const SafeGigFactory = await hre.ethers.getContractFactory("SafeGigFactory");
  const factory = await SafeGigFactory.deploy(
    registry.target,
    reputation.target,
    resolver.target,
    escrow.target,
    jobs.target
  );
  await factory.waitForDeployment();
  console.log("✅ SafeGigFactory deployed at:", factory.target);

  // === Save to frontend ===
  saveFrontendFiles({
    SafeGigRegistry: registry.target,
    ReputationSystem: reputation.target,
    DisputeResolver: resolver.target,
    EscrowManager: escrow.target,
    JobManager: jobs.target,
    SafeGigFactory: factory.target,
  });
}

function saveFrontendFiles(addresses) {
  const contractsDir = path.join(__dirname, "..", "..", "frontend", "lib", "abis");

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Save contract addresses
  fs.writeFileSync(
    path.join(contractsDir, "contract-addresses.json"),
    JSON.stringify(addresses, null, 2)
  );

  // Save each ABI
  for (const name of Object.keys(addresses)) {
    const artifact = hre.artifacts.readArtifactSync(name);
    fs.writeFileSync(
      path.join(contractsDir, `${name}.json`),
      JSON.stringify(artifact, null, 2)
    );
  }

  console.log("📁 Contracts info saved to frontend/lib/abis/");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});