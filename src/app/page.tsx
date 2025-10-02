'use client'

import { useState } from 'react'
import CodeEditor from '@/components/CodeEditor'
import ContractPanel from '@/components/ContractPanel'
import Header from '@/components/Header'
import TemplateSelector from '@/components/TemplateSelector'
import WalletInput from '@/components/WalletInput'

import { useToast } from '@/contexts/ToastContext'

const defaultContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract MyContract {
    string public message;
    address public owner;
    
    event MessageUpdated(string newMessage);
    
    constructor(string memory _initialMessage) {
        message = _initialMessage;
        owner = msg.sender;
    }
    
    function updateMessage(string memory _newMessage) public {
        require(msg.sender == owner, "Only owner can update message");
        message = _newMessage;
        emit MessageUpdated(_newMessage);
    }
    
    function getMessage() public view returns (string memory) {
        return message;
    }
}`

export default function Home() {
  const [contractCode, setContractCode] = useState<string>(defaultContract)
  const [isCompiling, setIsCompiling] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [compilationResult, setCompilationResult] = useState<any>(null)
  const [deploymentResult, setDeploymentResult] = useState<any>(null)
  const [privateKey, setPrivateKey] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const { showToast } = useToast()

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            Build on Creditcoin
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Write, compile, and deploy smart contracts to Creditcoin testnet with our modern IDE
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Code Editor */}
          <div className="lg:col-span-8" style={{ animation: 'slideInLeft 0.8s ease-out' }}>
            <div className="glass-card hover-lift h-fit">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs">📝</span>
                  </div>
                  <span>Smart Contract Editor</span>
                </h2>
                <div className="flex-shrink-0">
                  <TemplateSelector 
                    onSelectTemplate={(template) => setContractCode(template.code)}
                  />
                </div>
              </div>
              <div className="relative">
                <CodeEditor
                  value={contractCode}
                  onChange={setContractCode}
                  language="solidity"
                  height="600px"
                />
                <div className="absolute -inset-1 bg-gradient-to-r from-creditcoin-500 to-purple-600 rounded-2xl blur opacity-20 -z-10"></div>
              </div>
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="lg:col-span-4 space-y-4" style={{ animation: 'slideInRight 0.8s ease-out' }}>
            {/* Wallet Configuration */}
            <div className="glass-card h-fit">
              <WalletInput 
                onWalletChange={(key, address) => {
                  setPrivateKey(key)
                  setWalletAddress(address)
                }}
              />
            </div>

            {/* Control Panel */}
            <div className="glass-card h-fit">
              <ContractPanel
              contractCode={contractCode}
              isCompiling={isCompiling}
              isDeploying={isDeploying}
              compilationResult={compilationResult}
              deploymentResult={deploymentResult}
              onCompile={async () => {
                setIsCompiling(true)
                try {
                  // Try simple compiler first, fallback to hardhat
                  let response = await fetch('/api/compile-simple', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: contractCode })
                  })
                  
                  let result = await response.json()
                  
                  // If simple compiler fails, try hardhat
                  if (!result.success) {
                    response = await fetch('/api/compile', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ code: contractCode })
                    })
                    result = await response.json()
                  }
                  
                  setCompilationResult(result)
                  
                  if (result.success) {
                    showToast('Contract compiled successfully!', 'success')
                  } else {
                    showToast('Compilation failed', 'error')
                  }
                } catch (error) {
                  const errorResult = { error: 'Compilation failed: ' + error }
                  setCompilationResult(errorResult)
                  showToast('Compilation error occurred', 'error')
                } finally {
                  setIsCompiling(false)
                }
              }}
              onDeploy={async () => {
                if (!compilationResult?.success) return
                if (!privateKey) {
                  showToast('Please configure your wallet first', 'warning')
                  return
                }
                
                setIsDeploying(true)
                try {
                  const response = await fetch('/api/deploy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      bytecode: compilationResult.bytecode,
                      abi: compilationResult.abi,
                      privateKey: privateKey
                    })
                  })
                  const result = await response.json()
                  setDeploymentResult(result)
                  
                  if (result.success) {
                    showToast('Contract deployed successfully!', 'success')
                  } else {
                    showToast('Deployment failed', 'error')
                  }
                } catch (error) {
                  const errorResult = { error: 'Deployment failed' }
                  setDeploymentResult(errorResult)
                  showToast('Deployment error occurred', 'error')
                } finally {
                  setIsDeploying(false)
                }
              }}
              walletAddress={walletAddress}
              hasWallet={!!privateKey}
            />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}