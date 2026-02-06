'use client'

import { useState, useRef } from 'react'
import { ethers } from 'ethers'
import CodeEditor from '@/components/CodeEditor'
import ContractPanel from '@/components/ContractPanel'
import AIAssistant, { AIAssistantRef } from '@/components/AIAssistant'
import WalletInput from '@/components/WalletInput'
import NewFileModal from '@/components/NewFileModal'
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
  const [currentFileName, setCurrentFileName] = useState('MyContract.sol')
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState(false)
  const [openFiles, setOpenFiles] = useState<string[]>(['MyContract.sol'])
  const [fileContents, setFileContents] = useState<Record<string, string>>({
    'MyContract.sol': defaultContract
  })
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    '$ creditcoin-playground',
    'Welcome to Creditcoin Smart Contract IDE',
    'Ready to compile and deploy contracts to Creditcoin testnet'
  ])
  const { showToast } = useToast()
  const aiAssistantRef = useRef<AIAssistantRef>(null)

  const addTerminalLog = (message: string) => {
    setTerminalLogs(prev => [...prev, message])
  }

  const handleAskAI = (selectedCode: string) => {
    aiAssistantRef.current?.askAboutCode(selectedCode)
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white flex flex-col">
      {/* IDE Header/Menu Bar */}
      <div className="bg-[#2d2d30] border-b border-[#3e3e42] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-sm">Creditcoin Playground</span>

          <div className="flex items-center space-x-1 text-sm text-gray-400">
            <button className="px-3 py-1 hover:bg-[#3e3e42] rounded hover:text-white transition-colors">File</button>
            <button className="px-3 py-1 hover:bg-[#3e3e42] rounded hover:text-white transition-colors">Edit</button>
            <button className="px-3 py-1 hover:bg-[#3e3e42] rounded hover:text-white transition-colors">View</button>
            <button className="px-3 py-1 hover:bg-[#3e3e42] rounded hover:text-white transition-colors">Terminal</button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-300">Creditcoin Testnet</span>
          </div>
          <a href="https://docs.creditcoin.org/" target="_blank" className="text-xs text-gray-400 hover:text-gray-200">Docs ↗</a>
        </div>
      </div>

      {/* Main IDE Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Explorer Panel */}
        <div className="w-64 bg-[#252526] border-r border-[#3e3e42] flex flex-col">
          <div className="p-3 border-b border-[#3e3e42] flex items-center justify-between">
            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Explorer</h3>
            <button onClick={() => setIsNewFileModalOpen(true)} className="text-gray-400 hover:text-white">+</button>
          </div>
          <div className="flex-1 p-2">
            {openFiles.map((fileName: string) => (
              <div
                key={fileName}
                className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${currentFileName === fileName ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e] text-gray-300'}`}
                onClick={() => {
                  setCurrentFileName(fileName)
                  setContractCode(fileContents[fileName] || '')
                }}
              >
                <span className="text-xs">📄</span>
                <span className="text-sm">{fileName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor Area */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 bg-[#1e1e1e]">
              <CodeEditor
                value={fileContents[currentFileName] || ''}
                onChange={(newCode: string) => {
                  setContractCode(newCode)
                  setFileContents((prev: Record<string, string>) => ({ ...prev, [currentFileName]: newCode }))
                }}
                onAskAI={handleAskAI}
                language="solidity"
                height="100%"
              />
            </div>

            {/* Right Panel */}
            <div className="w-80 bg-[#252526] border-l border-[#3e3e42] flex flex-col overflow-y-auto">
              <div className="p-4 space-y-6">
                <WalletInput
                  onWalletChange={(key, address) => {
                    setPrivateKey(key)
                    setWalletAddress(address)
                  }}
                />

                <ContractPanel
                  contractCode={contractCode}
                  isCompiling={isCompiling}
                  isDeploying={isDeploying}
                  compilationResult={compilationResult}
                  deploymentResult={deploymentResult}
                  onCompile={async () => {
                    setIsCompiling(true)
                    addTerminalLog(`$ Compiling ${currentFileName}...`)
                    try {
                      const response = await fetch('/api/compile', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: contractCode })
                      })
                      const result = await response.json()
                      setCompilationResult(result)
                      if (result.success) {
                        addTerminalLog('✅ Compilation successful!')
                        showToast('Contract compiled successfully!', 'success')
                      } else {
                        addTerminalLog(`❌ Compilation failed: ${result.error}`)
                        showToast('Compilation failed', 'error')
                      }
                    } catch (error) {
                      addTerminalLog(`❌ Compilation error: ${error}`)
                      showToast('Compilation error occurred', 'error')
                    } finally {
                      setIsCompiling(false)
                    }
                  }}
                  onDeploy={async () => {
                    if (!compilationResult?.success) return
                    setIsDeploying(true)
                    addTerminalLog(`$ Deploying ${currentFileName} to Creditcoin testnet...`)

                    try {
                      let result;
                      if (!privateKey && walletAddress) {
                        // Client-side deployment via Browser Wallet
                        addTerminalLog('Using browser wallet for deployment...')
                        if (typeof window === 'undefined' || !window.ethereum) {
                          throw new Error('MetaMask not found')
                        }

                        const provider = new ethers.BrowserProvider(window.ethereum)
                        const signer = await provider.getSigner()
                        const factory = new ethers.ContractFactory(
                          compilationResult.abi,
                          compilationResult.bytecode,
                          signer
                        )

                        const contract = await factory.deploy()
                        addTerminalLog(`Transaction sent: ${contract.deploymentTransaction()?.hash}`)
                        addTerminalLog('Waiting for confirmation...')

                        await contract.waitForDeployment()
                        const address = await contract.getAddress()

                        result = {
                          success: true,
                          contractAddress: address,
                          transactionHash: contract.deploymentTransaction()?.hash
                        }
                      } else {
                        // Server-side deployment via API (Private Key)
                        const response = await fetch('/api/deploy', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            bytecode: compilationResult.bytecode,
                            abi: compilationResult.abi,
                            privateKey: privateKey
                          })
                        })
                        result = await response.json()
                      }

                      setDeploymentResult(result)
                      if (result.success) {
                        addTerminalLog(`🚀 Deployed to: ${result.contractAddress} ✅`)
                        showToast('Contract deployed successfully!', 'success')
                      } else {
                        addTerminalLog(`❌ Deployment failed: ${result.error}`)
                        showToast('Deployment failed', 'error')
                      }
                    } catch (error: any) {
                      addTerminalLog(`❌ Deployment error: ${error.message || error}`)
                      showToast('Deployment error', 'error')
                    } finally {
                      setIsDeploying(false)
                    }
                  }}
                  walletAddress={walletAddress}
                  hasWallet={!!(privateKey || walletAddress)}
                />
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className="h-48 bg-[#1e1e1e] border-t border-[#3e3e42] flex flex-col">
            <div className="bg-[#2d2d30] px-4 py-1 text-xs text-gray-400 border-b border-[#3e3e42]">Terminal</div>
            <div className="flex-1 p-3 font-mono text-xs overflow-y-auto space-y-1">
              {terminalLogs.map((log: string, i: number) => (
                <div key={i} className={log.startsWith('$') ? 'text-green-400' : 'text-gray-300'}>{log}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New File Modal */}
      <NewFileModal
        isOpen={isNewFileModalOpen}
        onClose={() => setIsNewFileModalOpen(false)}
        onConfirm={(fileName) => {
          const name = fileName + '.sol'
          const content = `// SPDX-License-Identifier: MIT\npragma solidity ^0.8.19;\n\ncontract ${fileName} {\n\n}`
          setOpenFiles([...openFiles, name])
          setFileContents({ ...fileContents, [name]: content })
          setCurrentFileName(name)
          setContractCode(content)
        }}
      />

      <AIAssistant ref={aiAssistantRef} contractCode={contractCode} />
    </div>
  )
}
