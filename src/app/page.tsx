'use client'

import { useState } from 'react'
import CodeEditor from '@/components/CodeEditor'
import ContractPanel from '@/components/ContractPanel'
import Header from '@/components/Header'
import TemplateSelector from '@/components/TemplateSelector'
import { ContractTemplate } from '@/types/contract'

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

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Code Editor */}
          <div className="space-y-4">
            <div className="contract-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                  Smart Contract Editor
                </h2>
                <TemplateSelector 
                  onSelectTemplate={(template) => setContractCode(template.code)}
                />
              </div>
              <CodeEditor
                value={contractCode}
                onChange={setContractCode}
                language="solidity"
              />
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            <ContractPanel
              contractCode={contractCode}
              isCompiling={isCompiling}
              isDeploying={isDeploying}
              compilationResult={compilationResult}
              deploymentResult={deploymentResult}
              onCompile={async () => {
                setIsCompiling(true)
                try {
                  const response = await fetch('/api/compile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: contractCode })
                  })
                  const result = await response.json()
                  setCompilationResult(result)
                } catch (error) {
                  setCompilationResult({ error: 'Compilation failed' })
                } finally {
                  setIsCompiling(false)
                }
              }}
              onDeploy={async () => {
                if (!compilationResult?.success) return
                
                setIsDeploying(true)
                try {
                  const response = await fetch('/api/deploy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      bytecode: compilationResult.bytecode,
                      abi: compilationResult.abi 
                    })
                  })
                  const result = await response.json()
                  setDeploymentResult(result)
                } catch (error) {
                  setDeploymentResult({ error: 'Deployment failed' })
                } finally {
                  setIsDeploying(false)
                }
              }}
            />
          </div>
        </div>
      </main>
    </div>
  )
}