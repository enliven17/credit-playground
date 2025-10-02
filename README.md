# Creditcoin Playground

Creditcoin Testnet için geliştirilmiş smart contract playground'u. Kullanıcılar smart contract yazabilir, derleyebilir ve Creditcoin testnet'ine deploy edebilir.

## Özellikler

- 🔧 **Smart Contract Editor**: Monaco Editor ile Solidity syntax highlighting
- ⚡ **Hızlı Derleme**: Hardhat ile otomatik contract derleme
- 🚀 **Testnet Deploy**: Creditcoin testnet'ine tek tıkla deployment
- 🔍 **Explorer Entegrasyonu**: Deploy edilen contractları explorer'da görüntüleme
- 📱 **Responsive Design**: Mobil ve desktop uyumlu arayüz

## Kurulum

1. **Repository'yi klonlayın:**
```bash
git clone <repository-url>
cd creditcoin-playground
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment dosyasını oluşturun:**
```bash
cp .env.example .env.local
```

4. **Private key'inizi ekleyin:**
`.env.local` dosyasında `PRIVATE_KEY` değişkenini kendi private key'iniz ile değiştirin.

⚠️ **Güvenlik Uyarısı**: Sadece testnet için kullanacağınız bir wallet'ın private key'ini kullanın!

## Creditcoin Testnet Kurulumu

### MetaMask'a Creditcoin Testnet Ekleme

1. MetaMask'ı açın
2. Network dropdown'ından "Add Network" seçin
3. Aşağıdaki bilgileri girin:

```
Network Name: Creditcoin Testnet
RPC URL: https://rpc.cc3-testnet.creditcoin.network
Chain ID: 102031
Currency Symbol: CTC
Block Explorer: https://explorer.cc3-testnet.creditcoin.network
```

### Test Token Alma

Creditcoin testnet tokenları almak için:
1. [Creditcoin Discord](https://discord.gg/creditcoin) kanalına katılın
2. Faucet kanalında wallet adresinizi paylaşın
3. Veya [resmi dokümantasyonu](https://docs.creditcoin.org/) kontrol edin

## Kullanım

1. **Development server'ı başlatın:**
```bash
npm run dev
```

2. **Browser'da açın:**
http://localhost:3000

3. **Smart Contract yazın:**
- Sol panelde contract kodunuzu yazın
- Örnek template'ler mevcuttur

4. **Compile edin:**
- "Compile" butonuna tıklayın
- Hataları kontrol edin

5. **Deploy edin:**
- "Deploy" sekmesine geçin
- "Deploy" butonuna tıklayın
- Contract adresi ve transaction hash'i alın

## Örnek Contractlar

### Basit Token Contract
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

## Geliştirme

### Local Development
```bash
# Development server
npm run dev

# Contract derleme
npm run compile

# Contract deploy (testnet)
npm run deploy

# Linting
npm run lint
```

### Yeni Özellik Ekleme

1. `src/components/` altında yeni component oluşturun
2. `src/app/api/` altında yeni API endpoint ekleyin
3. `src/types/` altında type tanımlarını güncelleyin

## Troubleshooting

### Compilation Hatası
- Solidity syntax'ını kontrol edin
- Pragma version'ının doğru olduğundan emin olun
- Import path'lerini kontrol edin

### Deployment Hatası
- Private key'in doğru olduğundan emin olun
- Wallet'ta yeterli CTC token olduğunu kontrol edin
- Network bağlantısını kontrol edin

### MetaMask Bağlantı Sorunu
- Network ayarlarını kontrol edin
- Chain ID'nin 102031 olduğundan emin olun
- RPC URL'in doğru olduğunu kontrol edin

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

MIT License - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## Bağlantılar

- [Creditcoin Resmi Website](https://creditcoin.org/)
- [Creditcoin Dokümantasyon](https://docs.creditcoin.org/)
- [Creditcoin Explorer](https://explorer.cc3-testnet.creditcoin.network/)
- [Creditcoin Discord](https://discord.gg/creditcoin)
- [GitHub Repository](https://github.com/creditcoin-org)

## Destek

Sorularınız için:
- GitHub Issues açın
- Discord kanalına katılın
- Dokümantasyonu kontrol edin