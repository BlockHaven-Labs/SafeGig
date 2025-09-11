# General README for SafeGig


## Overview

SafeGig is a decentralized escrow platform for freelancers and clients, built on the Flare Network. It helps freelancers and clients work together safely by locking funds in a smart contract and releasing them only when both sides agree.  

No middlemen. No scams. Just trust, transparency, and code.

### Why it matters:

- Freelancers: Guaranteed payments once work is completed.

- Clients: Assurance funds are only released for approved work.

- Global reach: Works cross-border without banks or middlemen.

## 🛠️ Tech Stack
- **Smart Contracts:** Solidity, Hardhat, OpenZeppelin  
- **Blockchain:** Flare Coston2 Testnet  
- **Frontend:** Next.js, wagmi/viem, RainbowKit, TailwindCSS + shadcn/ui

### Prerequisites
- [Node.js](https://nodejs.org/) >= 18  
- [MetaMask](https://metamask.io/) (with Coston2 network added)  
- C2FLR from the [Flare Faucet](https://faucet.flare.network/)

## 🔍 Demo Flow
- Client creates a job → locks funds.
- Freelancer submits work.
- Client approves → escrow releases funds.
- If dispute → arbitration mechanism (future v2).
  <img width="263" height="50" alt="image" src="https://github.com/user-attachments/assets/948e0887-98be-4d3e-ac93-fcf0c426e883" />


## 📅 Timeline (Suggested MVP Development Plan)
Our roadmap covers MVP escrow contracts → frontend dApp → milestone payments → dispute resolution.

## 📁 Monorepo Folder Structure
```bash
safegig/
├── contracts/         # Solidity contracts & tests (Hardhat)
│   ├── contracts/     # .sol files
│   ├── scripts/       # Deployment scripts
│   └── test/          # Contract tests
│
├── frontend/          # Next.js frontend
│   ├── app/           # App router pages & layouts
│   ├── components/    # Reusable UI components
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
│
├── docs/              # Documentation (architecture, research)
│
├── .gitignore
├── README.md          # Main README (this file)
├── package.json       # Yarn workspace root
└── yarn.lock
```


👉 This will be a Yarn Workspaces monorepo so you can manage contracts + frontend from one root.

## ⚙️ Setup Instructions
1. Clone the repo
git clone https://github.com/blockhaven-labs/safegig.git
cd safegig

2. Enable Yarn workspaces

Ensure you have Yarn installed:

npm install -g yarn


Initialize dependencies:

yarn install

3. Contracts (Hardhat)

Navigate into contracts and build:

cd contracts
yarn hardhat compile
yarn hardhat test


Deploy to Flare Coston2 testnet:

yarn hardhat run scripts/deploy.js --network coston2

4. Frontend (Next.js)

Start the frontend:

cd frontend
yarn dev


Access app at http://localhost:5173/

## 📜 Guidelines
🔹 Coding Guidelines

Follow Solidity style guide (NatSpec comments, require with clear error messages, events for state changes).

Use OpenZeppelin contracts wherever possible for security.

Keep frontend components reusable and styled with Tailwind + /or shadcn/ui arcording to the specified issue.

🔹 Git Guidelines

Use conventional commits:

feat: add fundEscrow function

fix: handle double approval bug

docs: update README with setup steps

Always branch from main → work on feature/* branches → open PR.

🔹 Testing Guidelines

- Smart contracts: Cover all functions, edge cases (double withdrawal, wrong caller, reentrancy).

- Frontend: Test critical flows (job creation, fund, approval).

🔹 Security Guidelines

- Avoid tx.origin, use msg.sender.

- Protect against reentrancy (use ReentrancyGuard).

- Validate roles (only client can approve/refund, only freelancer can submit).

🔹 Documentation Guidelines

- Every contract + function must have NatSpec comments.

- Keep an updated architecture diagram in /docs.

- Write changelogs for each release (GitHub releases).

🔍 Contribution Workflow

- Fork the repo

- Create a feature branch:

- git checkout -b feature/escrow-contract


Commit changes with conventional commits.

- Push branch and open PR.

- Ensure all tests pass before merge.

Figma link: https://www.figma.com/design/8JjQlegHGULn7A4nUjsYr5/safeGig_Main?node-id=0-1&p=f&t=UcA2gs9qExvOnStP-0

📈 Roadmap

✅ MVP Escrow: One job → fund → approve/release → refund

🔜 Multi-milestone Escrow: Partial releases per milestone

🔜 Dispute Resolution: DAO/Kleros arbitration

🔜 Price Feeds: Integrate Flare FTSOv2 for USD denominated payments

🔜 Reputation System: On-chain freelancer ratings

📜 License

MIT License

👩‍💻 Organisation

Built with ❤️ by BlockHaven Labs

## 📞 Contact for more info
- Join safeGig telegram group at [SafeGig](https://t.me/+LYifv9EhSQw0NzBk)
- [Telegram](https://t.me/teemahbee)
- [Gmail](aminubabafatima8@gmail.com)
- [LinkedIn](https://www.linkedin.com/in/fatima-aminu-839835176/)
- [Farcaster](https://farcaster.xyz/teemahbee)
