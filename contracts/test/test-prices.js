const hre = require("hardhat");

async function main() {
  const escrowAddress = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
  const escrow = await hre.ethers.getContractAt("EscrowManager", escrowAddress);

  // Get current ETH/USD price
  const price = await escrow.getLatestPrice();
  console.log("ETH/USD Price:", hre.ethers.formatUnits(price, 8));

  // Check $5 equivalent in ETH
  const fiveDollars = 5 * 10**8; // $5 with 8 decimals
  const ethAmount = await escrow.getETHAmount(fiveDollars);
  console.log("$5 in ETH:", hre.ethers.formatEther(ethAmount));

  // Check if 0.01 ETH meets minimum
  const testAmount = hre.ethers.parseEther("0.01");
  const meets = await escrow.meetsMinimumUSD(testAmount);
  console.log("0.01 ETH meets minimum:", meets);
}

main();