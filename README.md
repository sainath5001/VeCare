# VeCare 🏥🌟

**VeCare** is a revolutionary blockchain-based medical crowdfunding platform built on VeChain, integrating AI-powered medical document verification with decentralized finance and reward distribution through VeBetterDAO's X2Earn system.

## 🌟 Features

### 🏥 **Medical Crowdfunding**
- Create campaigns for medical treatments and healthcare needs
- AI-powered verification of medical documents
- Transparent fund tracking and progress monitoring
- Goal-based fundraising with time limits

### 🤖 **AI Document Verification**
- **GPT-4o Integration**: Advanced medical document analysis
- **Multi-document Support**: Upload multiple medical files
- **Confidence Scoring**: AI-powered authenticity verification
- **Automated Risk Assessment**: Red flag detection and findings

### ⛓️ **Blockchain Integration**
- **VeChain Thor**: Secure, fast, and eco-friendly blockchain
- **Smart Contracts**: Automated fund management and verification
- **Real-time Updates**: Live campaign progress and donor tracking
- **Transparent Transactions**: All donations recorded on-chain

### 💰 **B3tr Rewards System**
- **Automatic Rewards**: Earn B3tr tokens for donations
- **VeBetterDAO Integration**: Full X2Earn ecosystem participation
- **Governance Rights**: Use B3tr for platform governance
- **Reward Distribution**: Smart contract-based token allocation

### 🎯 **Key Benefits**
- ✅ **Verified Medical Needs**: AI ensures legitimacy
- ✅ **Direct Fund Transfer**: No intermediaries
- ✅ **Earn While Giving**: Receive B3tr rewards
- ✅ **Blockchain Transparency**: Immutable donation records
- ✅ **Community Governance**: Vote on platform decisions

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and **Yarn**
- **VeChain Wallet** (VeWorld recommended)
- **OpenAI API Key** (for AI verification)

### Installation

```bash
# Clone and install dependencies
git clone <repository-url>
cd x-app-template
yarn install

# Set up environment variables
cp apps/backend/.env.example apps/backend/.env.development.local
# Add your OPENAI_API_KEY to the .env file

# Start development servers
yarn dev
```

**Frontend:** http://localhost:8082
**Backend:** http://localhost:3000

---

## 🏗️ Architecture

### **Tech Stack**
- **Frontend**: React 18 + TypeScript + Chakra UI + Vite
- **Backend**: Express.js + TypeScript + VeChain SDK
- **Blockchain**: Solidity + Hardhat + VeChain Thor
- **AI**: OpenAI GPT-4o + Vision API
- **Storage**: IPFS (Pinata) + VeChain Blockchain
- **Rewards**: VeBetterDAO X2Earn + B3tr Tokens

### **Smart Contracts**
```
📁 apps/contracts/
├── VeCare.sol          # Main crowdfunding contract
├── IX2EarnRewardsPool.sol # VeBetterDAO interface
└── Migrations.sol      # Deployment management
```

### **Key Components**
```
📁 apps/frontend/src/
├── components/
│   ├── CreateCampaign.tsx    # Campaign creation form
│   ├── CampaignDetails.tsx   # Donation interface
│   └── CampaignBrowser.tsx   # Campaign listing
├── config/
│   └── api.ts               # API endpoints
└── services/
    └── wallet.ts            # VeChain wallet integration
```

---

## 📋 API Endpoints

### **Campaign Management**
```
POST   /campaigns              # Create new campaign
GET    /campaigns              # List all campaigns
GET    /campaigns/:id          # Get campaign details
GET    /campaigns/active/verified # Get verified campaigns
```

### **Medical Verification**
```
POST   /verify-documents       # AI document verification
```

### **Creator & Donor Info**
```
GET    /creators/:address      # Creator profile
GET    /campaigns/:id/donations/:address # Donation history
GET    /campaigns/:id/goal-reached # Goal status check
```

---

## 🔐 Smart Contract Features

### **Campaign Creation**
```solidity
function createCampaign(
    string memory _title,
    string memory _description,
    uint256 _goalAmount,
    uint256 _durationDays,
    string memory _medicalDocumentHash
) external returns (uint256 campaignId)
```

### **AI Verification**
```solidity
function verifyCampaign(
    uint256 _campaignId,
    bool _verified
) external // Admin only
```

### **Donations with Rewards**
```solidity
function donate(
    uint256 _campaignId
) external payable // Receives VET, distributes B3tr
```

### **Fund Management**
```solidity
function withdrawFunds(
    uint256 _campaignId
) external // Creator withdrawal
```

---

## 💎 B3tr Integration

### **Reward Distribution**
- **Automatic**: Donors receive B3tr tokens instantly
- **Rate-based**: Configurable tokens per VET donated
- **VeBetterDAO**: Full ecosystem integration

### **Governance Participation**
- **Vote on Proposals**: Use B3tr for platform decisions
- **Earn More**: Participate in VeChain ecosystem activities
- **Community Driven**: Help shape VeCare Chain's future

---

## 🎯 Usage Guide

### **For Campaign Creators**

1. **Connect Wallet** (VeWorld recommended)
2. **Create Campaign**:
   - Fill medical details and fundraising goal
   - Upload medical documents (PDFs, images)
   - Set campaign duration (1-365 days)
3. **AI Verification** (Automatic)
4. **Share Campaign** with community
5. **Receive Donations** in VET
6. **Withdraw Funds** after campaign ends

### **For Donors**

1. **Browse Verified Campaigns**
2. **Connect Wallet** and donate VET
3. **Earn B3tr Rewards** automatically
4. **Track Impact** and transaction history
5. **Use B3tr** for governance voting

### **For Developers**

1. **Deploy to VeChain Testnet**:
   ```bash
   yarn contracts:deploy:testnet
   ```

2. **Configure VeBetterDAO**:
   - Get APP_ID from sandbox
   - Fund rewards pool with B3tr
   - Register as reward distributor

3. **Customize Features**:
   - Modify AI verification prompts
   - Adjust reward rates
   - Add new campaign categories

---

## 🔧 Environment Configuration

### **Required Variables**

```bash
# Backend (.env.development.local)
OPENAI_API_KEY=your_openai_key_here
NETWORK_URL=https://testnet.vechain.org
ADMIN_PRIVATE_KEY=your_wallet_private_key

# Contract Configuration
APP_ID=0xfa5e2023057d5dba74b1dae41cafb2eac7c999f00bd0ceaf67c38695359242a2
B3TR_TOKEN_ADDRESS=0x0dd62dac9d4e1a9b4b7c7c2e3e4e0f3b2e6b9d8a
X2EARN_REWARDS_POOL=0x5F8f86B8D0Fa93cdaE20936d150175dF0205fB38
```

---

## 📊 Project Status

### **✅ Completed Features**
- [x] Medical campaign creation with metadata
- [x] AI-powered document verification (GPT-4o)
- [x] VeChain blockchain integration
- [x] Real-time donation processing
- [x] B3tr reward distribution
- [x] Campaign progress tracking
- [x] Creator fund withdrawal
- [x] Responsive React frontend
- [x] Comprehensive API backend

### **🚧 In Development**
- [ ] Mobile app (React Native)
- [ ] Advanced AI verification models
- [ ] Multi-language support
- [ ] Campaign categories and filtering
- [ ] Social sharing features

### **🔮 Future Enhancements**
- [ ] NFT-based medical certificates
- [ ] DeFi integration for fund growth
- [ ] Cross-chain compatibility
- [ ] Advanced analytics dashboard
- [ ] Community voting on verifications

---

## 🌐 Network Information

### **VeChain Testnet**
- **Network**: VeChain Thor Testnet
- **RPC**: https://testnet.vechain.org
- **Explorer**: https://explore-testnet.vechain.org
- **Contract**: `0xce625a00f33dd6bb6691903f010dc39504284781`

### **VeBetterDAO Integration**
- **Sandbox**: https://dev.testnet.governance.vebetterdao.org/
- **Documentation**: https://docs.vebetterdao.org/
- **APP_ID**: `0xfa5e2023057d5dba74b1dae41cafb2eac7c999f00bd0ceaf67c38695359242a2`

---

## 🤝 Contributing

VeCare Chain is an open-source project. Contributions are welcome!

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### **Areas for Contribution**
- Frontend UI/UX improvements
- Smart contract optimizations
- AI verification enhancements
- Documentation updates
- Testing and security audits

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **VeChain Foundation** for the amazing blockchain infrastructure
- **VeBetterDAO** for the X2Earn ecosystem and B3tr tokens
- **OpenAI** for GPT-4o vision capabilities
- **VeWorld** for the excellent wallet experience

---

## 📞 Support

- **Documentation**: [VeBetterDAO Docs](https://docs.vebetterdao.org/)
- **Discord**: [VeChain Community](https://discord.gg/vechain)
- **Issues**: Create a GitHub issue for bugs/features

---

**VeCare Chain** - Bringing transparency, trust, and rewards to medical crowdfunding through blockchain technology! 🌟🏥⛓️
