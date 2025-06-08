# EduCert - Decentralized Educational Certificate Platform

A comprehensive blockchain-based platform for issuing, storing, and verifying educational certificates using Ethereum, IPFS, and Discord integration.

## 🌟 Features

### Core Functionality
- **Blockchain Certificate Issuance**: Issue tamper-proof certificates as NFTs on Ethereum
- **IPFS Storage**: Decentralized storage for certificate files and metadata
- **QR Code Verification**: Instant verification via QR codes or certificate IDs
- **Multi-stakeholder Support**: Separate dashboards for institutions, students, and verifiers
- **Certificate Revocation**: Institutions can revoke certificates when necessary

### Advanced Features
- **Discord Bot Integration**: Automated scraping and posting of free certification opportunities
- **Free Certificate Discovery**: Curated list of free certificates updated daily
- **Responsive Design**: Mobile-first design with modern UI/UX
- **Real-time Updates**: Live updates for certificate status and verification
- **Batch Operations**: Bulk certificate issuance for institutions

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for responsive design
- **React Router** for navigation
- **Ethers.js** for blockchain interaction
- **IPFS HTTP Client** for decentralized storage

### Backend (Node.js + Express)
- **Express.js** API server
- **Multer** for file uploads
- **CORS** enabled for cross-origin requests
- **Mock blockchain** for development

### Blockchain (Solidity)
- **ERC-721** NFT standard for certificates
- **OpenZeppelin** contracts for security
- **Upgradeable** contract architecture
- **Role-based** access control

### Discord Bot (Discord.js)
- **Automated scraping** of free certificates
- **Daily posting** to Discord channels
- **Web scraping** with Cheerio
- **Cron scheduling** for regular updates

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MetaMask or compatible Web3 wallet
- Discord account (for bot features)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd educert-dapp
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start the development servers:**

Frontend:
```bash
npm run dev
```

Backend (in a separate terminal):
```bash
npm run server
```

Discord Bot (optional, in a separate terminal):
```bash
npm run bot
```

4. **Open your browser:**
Navigate to `http://localhost:5173` to access the application!

## 📱 Usage Guide

### For Educational Institutions

1. **Connect Wallet**: Connect your MetaMask wallet
2. **Issue Certificates**: Navigate to the Issue page
3. **Fill Certificate Details**: Enter student information and certificate data
4. **Upload Files**: Optionally upload certificate PDFs or images
5. **Submit to Blockchain**: Certificate is minted as NFT and stored on IPFS
6. **Generate QR Code**: Receive QR code for easy verification

### For Students

1. **Connect Wallet**: Connect your wallet to view certificates
2. **View Dashboard**: See all certificates issued to your address
3. **Share Certificates**: Generate QR codes or share verification links
4. **Download Certificates**: Save QR codes and certificate data

### For Employers/Verifiers

1. **Visit Verify Page**: No wallet connection required
2. **Scan QR Code**: Use camera to scan certificate QR codes
3. **Manual Verification**: Enter certificate token ID manually
4. **View Results**: See complete certificate details and blockchain verification

## 🔧 Configuration

### Blockchain Setup

For production deployment:

1. **Deploy Smart Contract:**
```bash
# Using Hardhat or Truffle
npx hardhat deploy --network mainnet
```

2. **Update Contract Address:**
```typescript
// src/contracts/EduCertContract.ts
const CONTRACT_ADDRESS = "your_deployed_contract_address";
```

### IPFS Configuration

1. **Infura IPFS Setup:**
```env
IPFS_PROJECT_ID=your_infura_project_id
IPFS_PROJECT_SECRET=your_infura_project_secret
```

2. **Alternative IPFS Providers:**
- Pinata
- Fleek
- Local IPFS node

### Discord Bot Setup

1. **Create Discord Application:**
   - Go to Discord Developer Portal
   - Create new application and bot
   - Copy bot token

2. **Configure Bot:**
```env
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CHANNEL_ID=your_channel_id
```

3. **Invite Bot to Server:**
   - Generate invite link with necessary permissions
   - Add bot to your Discord server

## 🛡️ Security Features

### Smart Contract Security
- **Access Control**: Role-based permissions for certificate issuance
- **Input Validation**: Comprehensive validation of all inputs
- **Reentrancy Protection**: Guards against reentrancy attacks
- **Upgrade Safety**: Proxy pattern for safe contract upgrades

### Data Protection
- **IPFS Encryption**: Optional encryption for sensitive certificate data
- **Wallet Security**: Private key never leaves user's device
- **API Rate Limiting**: Protection against abuse and spam
- **Input Sanitization**: XSS and injection attack prevention

## 📊 Database Schema

### Certificates Collection
```javascript
{
  tokenId: Number,
  student: String, // Wallet address
  ipfsHash: String,
  certificateType: String,
  institutionName: String,
  issuer: String, // Institution wallet address
  timestamp: Number,
  isValid: Boolean,
  metadata: {
    studentName: String,
    courseName: String,
    grade: String,
    issueDate: String,
    expiryDate: String,
    description: String
  }
}
```

### Free Certificates Collection
```javascript
{
  id: String,
  title: String,
  provider: String,
  description: String,
  url: String,
  category: String,
  duration: String,
  level: String,
  rating: Number,
  addedDate: String,
  tags: [String]
}
```

## 🤖 Discord Bot Features

### Automated Scraping
- **Daily Scraping**: Runs every day at 9 AM
- **Multiple Sources**: Coursera, edX, FutureLearn, and more
- **Duplicate Detection**: Filters out duplicate certificates
- **Rate Limiting**: Respectful scraping with delays

### Discord Integration
- **Rich Embeds**: Beautiful certificate announcements
- **Manual Commands**: `!scrape` for manual updates
- **Error Handling**: Robust error handling and logging
- **Webhook Support**: API integration for data synchronization

## 🌐 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
# Deploy the 'dist' folder
```

### Backend Deployment (Railway/Render)
```bash
# Set environment variables
# Deploy with Docker or buildpack
```

### Smart Contract Deployment
```bash
# Mainnet deployment
npx hardhat deploy --network mainnet

# Polygon deployment
npx hardhat deploy --network polygon
```

## 🔮 Future Enhancements

### Planned Features
- **Multi-chain Support**: Deploy on multiple blockchains
- **Advanced Analytics**: Certificate issuance and verification metrics
- **API Integrations**: Integration with learning management systems
- **Mobile App**: React Native mobile application
- **Batch Operations**: Bulk certificate issuance tools

### Scalability Improvements
- **Layer 2 Solutions**: Polygon, Arbitrum integration
- **IPFS Clustering**: Distributed IPFS storage
- **Caching Layer**: Redis for improved performance
- **CDN Integration**: Global content delivery

## 📄 License

MIT License - feel free to use this project as a foundation for your own educational certificate platform!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Email: support@educert.dev

---

**Ready to revolutionize educational credentials? Start building with EduCert!** 🎓🔗