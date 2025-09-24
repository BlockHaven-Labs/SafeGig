require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      viaIR: true,
    }
  },
  networks: {
    hardhat: {},
    
    flareTestnet: {
      url: "https://coston2-api.flare.network/ext/C/rpc",
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};

// Custom task to print accounts
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  
  for (const account of accounts) {
    console.log(account.address);
  }
});