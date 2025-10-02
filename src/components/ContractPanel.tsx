'use client'

import { useState } from 'react'
import { 
  PlayIcon, 
  RocketLaunchIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClipboardDocumentIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface ContractPanelProps {
  contractCode: string
  isCompiling: boolean
  isDeploying: boolean
  compilationResult: any
  deploymentResult: any
  onCompile: () => void
  onDeploy: () => void
}

export default function ContractPanel({
  contractCode,
  isCompiling,
  isDeploying,
  compilationResult,
  deploymentResult,
  onCompile,
  onDeploy
}: ContractPanelProps) {
  const [activeTab, setActiveTab] = useState<'compile' | 'deploy' | 'interact'>('compile')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="contract-card">
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {[
          { id: 'compile', label: 'Compile', icon: PlayIcon },
          { id: 'deploy', label: 'Deploy', icon: RocketLaunchIcon },
          { id: 'interact', label: 'Interact', icon: CheckCircleIcon }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === id
                ? 'bg-white dark:bg-gray-800 text-creditcoin-600 dark:text-creditcoin-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Compile Tab */}
      {activeTab === 'compile' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Contract Compilation
            </h3>
            <button
              onClick={onCompile}
              disabled={isCompiling || !contractCode.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <PlayIcon className="h-4 w-4" />
              <span>{isCompiling ? 'Compiling...' : 'Compile'}</span>
            </button>
          </div>

          {/* Compilation Result */}
          {compilationResult && (
            <div className={`p-4 rounded-lg border ${
              compilationResult.success 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {compilationResult.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <span className={`font-medium ${
                  compilationResult.success 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {compilationResult.success ? 'Compilation Successful' : 'Compilation Failed'}
                </span>
              </div>
              
              {compilationResult.error && (
                <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                  {compilationResult.error}
                </pre>
              )}
              
              {compilationResult.success && (
                <div className="text-sm text-green-700 dark:text-green-300">
                  Contract compiled successfully. Ready for deployment.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Deploy Tab */}
      {activeTab === 'deploy' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              Deploy to Testnet
            </h3>
            <button
              onClick={onDeploy}
              disabled={isDeploying || !compilationResult?.success}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <RocketLaunchIcon className="h-4 w-4" />
              <span>{isDeploying ? 'Deploying...' : 'Deploy'}</span>
            </button>
          </div>

          {!compilationResult?.success && (
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Please compile your contract first
                </span>
              </div>
            </div>
          )}

          {/* Network Info */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Creditcoin Testnet
            </h4>
            <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <div>Chain ID: 102031</div>
              <div>RPC: https://rpc.cc3-testnet.creditcoin.network</div>
              <div>Explorer: https://explorer.cc3-testnet.creditcoin.network</div>
            </div>
          </div>

          {/* Deployment Result */}
          {deploymentResult && (
            <div className={`p-4 rounded-lg border ${
              deploymentResult.success 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {deploymentResult.success ? (
                  <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <span className={`font-medium ${
                  deploymentResult.success 
                    ? 'text-green-800 dark:text-green-200' 
                    : 'text-red-800 dark:text-red-200'
                }`}>
                  {deploymentResult.success ? 'Deployment Successful' : 'Deployment Failed'}
                </span>
              </div>
              
              {deploymentResult.error && (
                <pre className="text-sm text-red-700 dark:text-red-300 whitespace-pre-wrap">
                  {deploymentResult.error}
                </pre>
              )}
              
              {deploymentResult.success && (
                <div className="space-y-2">
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Contract Address:
                  </div>
                  <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded border">
                    <code className="text-sm font-mono flex-1">
                      {deploymentResult.contractAddress}
                    </code>
                    <button
                      onClick={() => copyToClipboard(deploymentResult.contractAddress)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Transaction Hash:
                  </div>
                  <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-2 rounded border">
                    <code className="text-sm font-mono flex-1">
                      {deploymentResult.transactionHash}
                    </code>
                    <button
                      onClick={() => copyToClipboard(deploymentResult.transactionHash)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Interact Tab */}
      {activeTab === 'interact' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Contract Interaction
          </h3>
          
          {!deploymentResult?.success ? (
            <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Deploy your contract first to interact with it
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Contract interaction interface will be available here after deployment.
              <br />
              <span className="text-sm">
                This feature allows you to call contract functions directly from the playground.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}