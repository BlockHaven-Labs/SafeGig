const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Deploying with account:", deployer.address);
  console.log(
    "💰 Account balance:",
    (await deployer.provider.getBalance(deployer.address)).toString()
  );

  // === Deploy Lock contract ===
  // console.log("\n🔒 Deploying Lock...");
  // const Lock = await hre.ethers.getContractFactory("Lock");
  // await Lock.waitForDeployment();
  // const unlockTime = await Lock.unlockTime();
  // console.log("✅ Lock deployed at:", Lock.target);
  // console.log(
  //   "🕒 Unlock time:",
  //   new Date(Number(unlockTime) * 1000).toLocaleString()
  // );

  // === Deploy individual contracts first ===
  console.log("\n📋 Deploying SafeGigRegistry...");
  const SafeGigRegistry = await hre.ethers.getContractFactory(
    "SafeGigRegistry"
  );
  const registry = await SafeGigRegistry.deploy();
  await registry.waitForDeployment();
  console.log("\n🔑 Granting JOB_MANAGER_ROLE to JobManager...");

  console.log("\n💼 Deploying JobManager...");
  const JobManager = await hre.ethers.getContractFactory("JobManager");
  const jobs = await JobManager.deploy(registry.target);
  await jobs.waitForDeployment();
  console.log("✅ JobManager deployed at:", jobs.target);

  const JOB_MANAGER_ROLE = ethers.keccak256(
    ethers.toUtf8Bytes("JOB_MANAGER_ROLE")
  );
  await registry.grantRole(JOB_MANAGER_ROLE, jobs.target);
  console.log("✅ JobManager granted permission to update stats");
  console.log("✅ SafeGigRegistry deployed at:", registry.target);


  console.log("\n⚖️ Deploying DisputeResolver...");
  const DisputeResolver = await hre.ethers.getContractFactory(
    "DisputeResolver"
  );
  const resolver = await DisputeResolver.deploy(jobs.target, registry.target);
  await resolver.waitForDeployment();
  console.log("✅ DisputeResolver deployed at:", resolver.target);

  console.log("\n💰 Deploying EscrowManager...");
  const EscrowManager = await hre.ethers.getContractFactory("EscrowManager");
  const feeRecipient = deployer.address;
  const priceFeedAddresses = {
    mainnet: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    sepolia: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    localhost: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
    hardhat: "0x694AA1769357215DE4FAC081bf1f309aDC325306"
  };

  const network = hre.network.name;
  const priceFeedAddress = priceFeedAddresses[network];

  if (!priceFeedAddress) {
    throw new Error(`No price feed configured for network: ${network}`);
  }

  if (feeRecipient === ethers.ZeroAddress) {
    throw new Error("Fee recipient cannot be zero address");
  }
  const escrow = await EscrowManager.deploy(
    jobs.target,
    registry.target,
    feeRecipient, 
    priceFeedAddress, 
    resolver.target
  );
  await escrow.waitForDeployment();
  const setPriceFeed = await escrow.priceFeed();
  console.log("🔍 Price feed verified:", setPriceFeed);
  console.log("✅ EscrowManager deployed at:", escrow.target);
  console.log("📊 Using price feed:", priceFeedAddress);

  console.log("\n⭐ Deploying ReputationSystem...");
  const ReputationSystem = await hre.ethers.getContractFactory(
    "ReputationSystem"
  );
  const reputation = await ReputationSystem.deploy(
    registry.target,
    jobs.target
  );
  await reputation.waitForDeployment();
  console.log("✅ ReputationSystem deployed at:", reputation.target);

  // === Deploy the simple factory ===
  console.log("\n🏭 Deploying SafeGigFactory...");
  const SafeGigFactory = await hre.ethers.getContractFactory("SafeGigFactory");
  const factory = await SafeGigFactory.deploy();
  await factory.waitForDeployment();
  console.log("✅ SafeGigFactory deployed at:", factory.target);

  // === Register contracts with the factory ===
  console.log("\n📝 Registering contracts with factory...");
  const tx = await factory.registerContracts(
    registry.target,
    jobs.target,
    escrow.target,
    reputation.target,
    resolver.target
  );
  await tx.wait();
  console.log("✅ Contracts registered with factory");

  // === Contract Addresses Summary ===
  const contractAddresses = {
    SafeGigRegistry: registry.target,
    JobManager: jobs.target,
    EscrowManager: escrow.target,
    ReputationSystem: reputation.target,
    DisputeResolver: resolver.target,
    SafeGigFactory: factory.target,
  };

  console.log("\n📋 === DEPLOYMENT SUMMARY ===");
  Object.entries(contractAddresses).forEach(([name, address]) => {
    console.log(`${name}: ${address}`);
  });

  // === Save to frontend ===
  saveFrontendFiles(contractAddresses);

  console.log("\n🎉 All contracts deployed and registered successfully!");
}

function saveFrontendFiles(addresses) {
  const contractsDir = path.join(
    __dirname,
    "..",
    "..",
    "frontend",
    "lib",
    "abis"
  );

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(contractsDir, "contract-addresses.json"),
    JSON.stringify(addresses, null, 2)
  );

  for (const name of Object.keys(addresses)) {
    try {
      const artifact = hre.artifacts.readArtifactSync(name);
      fs.writeFileSync(
        path.join(contractsDir, `${name}.json`),
        JSON.stringify(artifact, null, 2)
      );
    } catch (error) {
      console.warn(`⚠️ Could not save ABI for ${name}:`, error.message);
    }
  }

  console.log("📁 Contracts info saved to frontend/lib/abis/");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
