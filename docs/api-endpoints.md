# API Endpoints Documentation

## API Architecture

```mermaid
graph TB
    A[Frontend] --> B[/api/compile]
    A --> C[/api/deploy]
    A --> D[/api/ai-assistant]
    A --> E[/api/debug-env]
    
    B --> F[Solidity Compiler]
    C --> G[Web3 Provider]
    D --> H[Groq API]
    D --> I[Rule-based System]
    
    G --> J[Creditcoin Testnet]
    H --> K[Llama 3.1 Model]
```

## Endpoint Details

### /api/compile
- **Method**: POST
- **Purpose**: Compile Solidity contracts
- **Input**: Contract source code
- **Output**: Bytecode, ABI, errors

### /api/deploy
- **Method**: POST
- **Purpose**: Deploy contracts to Creditcoin
- **Input**: Bytecode, private key, constructor args
- **Output**: Contract address, transaction hash

### /api/ai-assistant
- **Method**: POST
- **Purpose**: AI-powered development assistance
- **Input**: User message, contract code, conversation history
- **Output**: AI response with Creditcoin-specific guidance

### /api/debug-env
- **Method**: GET
- **Purpose**: Debug environment variables
- **Output**: Environment status, API key presence

## Data Flow

```mermaid
sequenceDiagram
    participant F as Frontend
    participant API as API Routes
    participant EXT as External Services
    
    F->>API: POST /api/compile
    API->>API: Process Solidity
    API-->>F: Compilation Result
    
    F->>API: POST /api/deploy
    API->>EXT: Creditcoin Network
    EXT-->>API: Transaction Receipt
    API-->>F: Deployment Result
    
    F->>API: POST /api/ai-assistant
    API->>EXT: Groq API
    EXT-->>API: AI Response
    API-->>F: Assistant Message
```