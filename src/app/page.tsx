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
    <div className="h-screen bg-[#1e1e1e] text-white flex flex-col overflow-hidden">
      {/* IDE Header */}
      <div className="h-12 bg-[#2d2d30] border-b border-[#3e3e42] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-blue-400 text-xl">⌘</span>
            <span className="font-bold text-sm tracking-tight text-gray-200">Creditcoin Playground</span>
          </div>

          <nav className="flex items-center space-x-1 text-xs text-gray-400">
            <button className="px-3 py-1.5 hover:bg-[#3e3e42] rounded transition-colors">File</button>
            <button className="px-3 py-1.5 hover:bg-[#3e3e42] rounded transition-colors">Edit</button>
            <button className="px-3 py-1.5 hover:bg-[#3e3e42] rounded transition-colors">Selection</button>
            <button className="px-3 py-1.5 hover:bg-[#3e3e42] rounded transition-colors">Terminal</button>
            <button className="px-3 py-1.5 hover:bg-[#3e3e42] rounded transition-colors">Help</button>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-[#1e1e1e] px-3 py-1 rounded-full border border-green-500/20">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="text-[10px] font-medium text-green-500 uppercase tracking-widest">Testnet Connected</span>
          </div>
        </div>
      </div>

      {/* Main IDE Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Explorer Panel */}
        <aside className="w-64 bg-[#252526] border-r border-[#3e3e42] flex flex-col shrink-0">
          <div className="p-3 border-b border-[#3e3e42] flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">Explorer</h3>
            <button
              onClick={() => setIsNewFileModalOpen(true)}
              className="text-gray-400 hover:text-white p-1 hover:bg-[#3e3e42] rounded transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {openFiles.map((fileName: string) => (
              <div
                key={fileName}
                className={`flex items-center space-x-2.5 px-3 py-2 rounded-md cursor-pointer transition-all ${currentFileName === fileName ? 'bg-[#37373d] text-white shadow-sm' : 'hover:bg-[#2a2d2e] text-gray-400 hover:text-gray-200'}`}
                onClick={() => {
                  setCurrentFileName(fileName)
                  setContractCode(fileContents[fileName] || '')
                }}
              >
                <span className="text-sm opacity-70">📄</span>
                <span className="text-xs font-medium truncate">{fileName}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Central Workspace (Editor + Terminal) */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Tabs Bar */}
          <div className="h-9 bg-[#252526] flex items-center border-b border-[#3e3e42] overflow-x-auto no-scrollbar">
            {openFiles.map((fileName) => (
              <div
                key={fileName}
                onClick={() => {
                  setCurrentFileName(fileName)
                  setContractCode(fileContents[fileName] || '')
                }}
                className={`flex items-center px-4 h-full border-r border-[#3e3e42] cursor-pointer min-w-[120px] max-w-[200px] transition-all group ${currentFileName === fileName ? 'bg-[#1e1e1e] text-white border-t-2 border-t-blue-500' : 'bg-[#2d2d30] text-gray-500 hover:bg-[#1e1e1e]/50 hover:text-gray-300'}`}
              >
                <span className="text-xs truncate flex-1">{fileName}</span>
                <span className="ml-2 opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded transition-all">×</span>
              </div>
            ))}
          </div>

          {/* Editor Container */}
          <div className="flex-1 relative bg-[#1e1e1e]">
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

          {/* Terminal Panel */}
          <div className="h-48 bg-[#1e1e1e] border-t border-[#3e3e42] flex flex-col shrink-0">
            <div className="bg-[#252526] px-4 py-1.5 text-[10px] font-bold text-gray-500 border-b border-[#3e3e42] uppercase tracking-widest flex items-center">
              <span className="flex-1">Terminal</span>
              <div className="flex items-center space-x-3 opacity-50">
                <button className="hover:text-white transition-colors">Clear</button>
                <button className="hover:text-white transition-colors">▼</button>
              </div>
            </div>
            <div className="flex-1 p-3 font-mono text-[11px] overflow-y-auto space-y-1 custom-scrollbar">
              {terminalLogs.map((log: string, i: number) => (
                <div key={i} className={`flex ${log.startsWith('$') ? 'text-blue-400' : log.includes('❌') ? 'text-red-400' : log.includes('✅') || log.includes('🚀') ? 'text-green-400' : 'text-gray-300'}`}>
                  <span className="opacity-30 mr-2 select-none">{i + 1}</span>
                  <span className="whitespace-pre-wrap">{log}</span>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Sidebar (Contract Tools) */}
        <aside className="w-80 bg-[#252526] border-l border-[#3e3e42] flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-8">
            <WalletInput
              onWalletChange={(key, address) => {
                setPrivateKey(key)
                setWalletAddress(address)
              }}
            />

            <div className="h-px bg-[#3e3e42] mx-2"></div>

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
              onDeploy={async (args: any[]) => {
                if (!compilationResult?.success) return
                setIsDeploying(true)
                addTerminalLog(`$ Deploying ${currentFileName} to Creditcoin testnet...`)

                try {
                  let result;
                  if (!privateKey && walletAddress) {
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

                    const contract = await factory.deploy(...args)
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
                    const response = await fetch('/api/deploy', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        bytecode: compilationResult.bytecode,
                        abi: compilationResult.abi,
                        privateKey: privateKey,
                        constructorArgs: args
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
        </aside>
      </div>

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
