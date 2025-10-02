# Creditcoin Playground

A smart contract playground developed for Creditcoin Testnet. Users can write, compile, and deploy smart contracts to Creditcoin testnet.

## Features

- 🔧 **Smart Contract Editor**: Solidity syntax highlighting with Monaco Editor
- ⚡ **Fast Compilation**: Automatic contract compilation with Hardhat
- 🚀 **Testnet Deploy**: One-click deployment to Creditcoin testnet
- 🔍 **Explorer Integration**: View deployed contracts in the explorer
- 📱 **Responsive Design**: Mobile and desktop compatible interface

## Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd creditcoin-playground
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env.local
```

4. **Add your private key:**
Replace the `PRIVATE_KEY` variable in `.env.local` with your own private key.

⚠️ **Security Warning**: Only use a private key from a wallet intended for testnet use!

## Creditcoin Testnet Setup

### Adding Creditcoin Testnet to MetaMask

1. Open MetaMask
2. Select "Add Network" from the network dropdown
3. Enter the following information:

```
Network Name: Creditcoin Testnet
RPC URL: https://rpc.cc3-testnet.creditcoin.network
Chain ID: 102031
Currency Symbol: CTC
Block Explorer: https://explorer.cc3-testnet.creditcoin.network
```

### Getting Test Tokens

To get Creditcoin testnet tokens:
1. Join the [Creditcoin Discord](https://discord.gg/creditcoin) channel
2. Share your wallet address in the faucet channel
3. Or check the [official documentation](https://docs.creditcoin.org/)

## Usage

1. **Start the development server:**
```bash
npm run dev
```

2. **Open in browser:**
http://localhost:3000

3. **Write Smart Contract:**
- Write your contract code in the left panel
- Example templates are available

4. **Compile:**
- Click the "Compile" button
- Check for errors

5. **Deploy:**
- Switch to the "Deploy" tab
- Click the "Deploy" button
- Get the contract address and transaction hash

## Example Contracts

### Simple Token Contract
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleToken {
    string public name = "My Token";
    string public symbol = "MTK";
    uint256 public totalSupply = 1000000;
    
    mapping(address => uint256) public balanceOf;
    
    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
    
    function transfer(address to, uint256 amount) public returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}
```

### Credit Score Contract
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CreditScore {
    mapping(address => uint256) public creditScores;
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    function updateScore(address user, uint256 score) public {
        require(msg.sender == owner, "Only owner");
        require(score <= 1000, "Score too high");
        creditScores[user] = score;
    }
    
    function getScore(address user) public view returns (uint256) {
        return creditScores[user];
    }
}
```

## API Endpoints

### POST /api/compile
Contract kodunu derler.

**Request:**
```json
{
  "code": "contract MyContract { ... }"
}
```

**Response:**
```json
{
  "success": true,
  "abi": [...],
  "bytecode": "0x...",
  "output": "compilation output"
}
```

### POST /api/deploy
Derlenmiş contractı deploy eder.

**Request:**
```json
{
  "bytecode": "0x...",
  "abi": [...]
}
```

**Response:**
```json
{
  "success": true,
  "contractAddress": "0x...",
  "transactionHash": "0x...",
  "networkInfo": {
    "chainId": 102031,
    "explorerUrl": "https://explorer.cc3-testnet.creditcoin.network/address/0x..."
  }
}
```

## Teknoloji Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Editor**: Monaco Editor
- **Blockchain**: Ethers.js v6
- **Smart Contracts**: Hardhat, Solidity 0.8.19
- **Network**: Creditcoin Testnet

## Development

### Local Development
```bash
# Development server
npm run dev

# Contract compilation
npm run compile

# Contract deploy (testnet)
npm run deploy

# Linting
npm run lint
```

### Adding New Features

1. Create new components in `src/components/`
2. Add new API endpoints in `src/app/api/`
3. Update type definitions in `src/types/`

## Troubleshooting

### Compilation Error
- Check Solidity syntax
- Ensure pragma version is correct
- Check import paths

### Deployment Error
- Ensure private key is correct
- Check that wallet has sufficient CTC tokens
- Check network connection

### MetaMask Connection Issue
- Check network settings
- Ensure Chain ID is 102031
- Verify RPC URL is correct

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Links

- [Creditcoin Official Website](https://creditcoin.org/)
- [Creditcoin Documentation](https://docs.creditcoin.org/)
- [Creditcoin Explorer](https://explorer.cc3-testnet.creditcoin.network/)
- [Creditcoin Discord](https://discord.gg/creditcoin)
- [GitHub Repository](https://github.com/creditcoin-org)

## Support

For questions:
- Open GitHub Issues
- Join Discord channel
- Check documentation