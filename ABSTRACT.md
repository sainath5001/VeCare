# Abstract

**VeCare: A Blockchain-Based Medical Crowdfunding Platform with AI-Powered Document Verification**

---

Medical crowdfunding platforms face significant challenges around trust, transparency, and fraud prevention. Donors often lack assurance that campaigns represent genuine medical needs, while creators struggle to demonstrate credibility. Centralized platforms introduce intermediaries, opacity in fund flows, and limited incentive structures for donors.

**VeCare** is a full-stack decentralized application that addresses these issues by combining **blockchain technology**, **artificial intelligence**, and **incentive mechanisms** into a single medical crowdfunding ecosystem. The system is built on **VeChain Thor**, a public blockchain chosen for its speed, low cost, and sustainability, and integrates with **VeBetterDAO’s X2Earn** rewards system to incentivize donations.

The platform allows campaign creators to submit medical fundraising campaigns along with supporting documents (e.g., prescriptions, hospital bills, diagnosis reports). **AI-powered verification**—implemented using **OpenAI’s GPT-4o with vision capabilities**—analyzes uploaded documents for authenticity, medical relevance, and credibility indicators. The AI returns a structured result including a confidence score, document type, findings, reasoning, and red flags. Only campaigns that pass verification (with configurable confidence thresholds) are marked as verified and become eligible to receive donations. Verified documents and metadata are stored on **IPFS** (via Pinata) for immutability and auditability; the resulting content hash is recorded on-chain.

**Smart contracts** (Solidity, Hardhat) govern the core logic: campaign creation with goal amount and duration, admin-only verification status, donation acceptance in **VET** (native VeChain token), automatic **B3tr token** rewards to donors through the X2Earn rewards pool, and secure fund withdrawal by creators after campaign deadline or goal completion. A **creator trust score** (0–100) is maintained on-chain and can be improved by posting campaign updates and successfully completing campaigns. A small **platform fee** (e.g., 2.5%) is applied on withdrawals to sustain operations.

The **backend** is implemented in **Node.js with Express and TypeScript**, exposing REST APIs for campaign creation (including AI verification and IPFS upload), campaign listing, campaign details, creator profiles, donation history, and on-chain verification. The **frontend** is a **React 18** single-page application using **TypeScript**, **Chakra UI**, and **Vite**, with **VeChain DApp Kit** for wallet connection and transaction signing. Users can browse verified campaigns, create campaigns (with a guided flow: verify documents → upload to IPFS → create on-chain → optional on-chain verification), donate VET and earn B3tr, and manage withdrawals and creator dashboards.

The project demonstrates the feasibility of **transparent, trust-minimized medical crowdfunding** by combining AI-based document verification with blockchain-based fund custody, donor incentives, and on-chain accountability. It is suitable for deployment on VeChain testnet and can be extended with additional verification models, categories, and governance features.

**Keywords:** Medical crowdfunding, blockchain, VeChain, smart contracts, AI document verification, OpenAI GPT-4o, IPFS, VeBetterDAO, B3tr, X2Earn, decentralized application, trust score, transparency.




i want to contribute to rootstock hacktivator 3.0 program so i submitted some ideas but they are rejected by them they said this is not fully on rootstock or i also submitted zksync ideas so they said that we are focused on right now on zk and all ideas are code and tool it means i have build project on rootstock or for rootstock 


so i will share some previous other peoples ideas with you so you have basic idea what kind of ideas are selected so below are some ideas ehich are already selecetd by rootstock hacktivator program 

'''