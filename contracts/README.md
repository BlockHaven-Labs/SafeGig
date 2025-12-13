# SafeGig Contracts

This folder contains the Solidity smart contracts for the SafeGig project.  
It is built with [Hardhat](https://hardhat.org/) for development, testing, and deployment.

---

## 🚀 Getting Started

Welcome to this repository, this is the `contracts/` folder.
Up next, install dependencies:

```bash
yarn install
```

Try running some of the following tasks:

```shell
yarn hardhat compile
yarn hardhat test
```
Start a local Hardhat node
```bash
yarn hardhat node
```

Deploy the contract to the local node:
```bash
yarn hardhat run scripts/deploy.js --network localhost
``` 

Interact with the deployed contract (example script):
```bash
yarn hardhat run scripts/interact.js --network localhost
```

Coming up will be network setup instructions for Sepolia/Flare testnet so contributors can deploy to testnet.