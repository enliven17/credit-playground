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
import LoadingSpinner from './LoadingSpinner'

interface ContractPanelProps {
  contractCode: string
  isCompiling: boolean
  isDeploying: boolean
  compilationResult: any
  deploymentResult: any
  onCompile: () => void
  onDeploy: () => void
  walletAddress?: string
  hasWallet?: boolean
}

export default function ContractPanel({
  contractCode,
  isCompiling,
  isDeploying,
  compilationResult,
  deploymentResult,
  onCompile,
  onDeploy,
  walletAddress,
  hasWallet
}: ContractPanelProps) {
  const [activeTab, setActiveTab] = useState<'compile' | 'deploy' | 'interact'>('compile')

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex space-x-1 glass rounded-xl p-1">
        {[
          { id: 'compile', label: 'Compile', icon: PlayIcon },
          { id: 'deploy', label: 'Deploy', icon: RocketLaunchIcon },
          { id: 'interact', label: 'Interact', icon: CheckCircleIcon }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 flex-1 justify-center ${
              activeTab === id
                ? 'bg-gradient-to-r from-creditcoin-500 to-creditcoin-600 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Compile Tab */}
      {activeTab === 'compile' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">⚡</span>
              </div>
              <span>Compile</span>
            </h3>
            <button
              onClick={onCompile}
              disabled={isCompiling || !contractCode.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 px-4 py-2 text-sm"
            >
              {isCompiling ? (
                <LoadingSpinner size="sm" color="text-white" />
              ) : (
                <PlayIcon className="h-4 w-4" />
              )}
              <span>{isCompiling ? 'Compiling...' : 'Compile'}</span>
            </button>
          </div>

          {/* Compilation Result */}
          {compilationResult && (
            <div className={`glass p-3 rounded-lg border ${
              compilationResult.success ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {compilationResult.success ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-400" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-red-400" />
                )}
                <span className="font-medium text-white text-sm">
                  {compilationResult.success ? 'Success' : 'Failed'}
                </span>
              </div>
              
              {compilationResult.error && (
                <div className="text-xs text-red-300 bg-red-900/30 p-2 rounded max-h-20 overflow-y-auto">
                  {compilationResult.error}
                </div>
              )}
              
              {compilationResult.success && (
                <div className="text-xs text-green-300">
                  ✨ Ready for deployment
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Deploy Tab */}
      {activeTab === 'deploy' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs">🚀</span>
              </div>
              <span>Deploy</span>
            </h3>
            <button
              onClick={onDeploy}
              disabled={isDeploying || !compilationResult?.success || !hasWallet}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 px-4 py-2 text-sm"
            >
              {isDeploying ? (
                <LoadingSpinner size="sm" color="text-white" />
              ) : (
                <RocketLaunchIcon className="h-4 w-4" />
              )}
              <span>{isDeploying ? 'Deploying...' : 'Deploy'}</span>
            </button>
          </div>

          {!compilationResult?.success && (
            <div className="glass p-2 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-200 text-xs">
                  Compile contract first
                </span>
              </div>
            </div>
          )}

          {!hasWallet && compilationResult?.success && (
            <div className="glass p-2 rounded-lg bg-orange-900/20 border border-orange-500/30">
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-4 w-4 text-orange-400" />
                <span className="text-orange-200 text-xs">
                  Configure wallet to deploy
                </span>
              </div>
            </div>
          )}

          {hasWallet && walletAddress && compilationResult?.success && (
            <div className="glass p-2 rounded-lg bg-blue-900/20 border border-blue-500/30">
              <div className="flex items-center space-x-2">
                <div className="status-online"></div>
                <span className="text-blue-200 text-xs font-medium">Ready to Deploy</span>
              </div>
            </div>
          )}

          {/* Network Info */}
          <div className="glass-card bg-blue-900/20 border-blue-500/30 hover-glow">
            <h4 className="font-semibold text-blue-200 mb-4 flex items-center space-x-2">
              <div className="status-online"></div>
              <span>Creditcoin Testnet</span>
            </h4>
            <div className="text-sm text-blue-300 space-y-2">
              <div className="flex justify-between">
                <span>Chain ID:</span>
                <span className="font-mono">102031</span>
              </div>
              <div className="flex justify-between">
                <span>Network:</span>
                <span className="font-mono">Testnet</span>
              </div>
              <div className="text-xs text-blue-400 mt-3">
                🔗 Connected to live testnet
              </div>
            </div>
          </div>

          {/* Deployment Result */}
          {deploymentResult && (
            <div className={`glass p-3 rounded-lg border max-h-96 overflow-y-auto ${
              deploymentResult.success ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                {deploymentResult.success ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-400" />
                ) : (
                  <XCircleIcon className="h-4 w-4 text-red-400" />
                )}
                <span className="font-medium text-white text-sm">
                  {deploymentResult.success ? '🎉 Deployed' : '❌ Failed'}
                </span>
              </div>
              
              {deploymentResult.error && (
                <div className="text-xs text-red-300 bg-red-900/30 p-2 rounded max-h-20 overflow-y-auto">
                  {deploymentResult.error}
                </div>
              )}
              
              {deploymentResult.success && (
                <div className="space-y-2">
                  <div className="bg-green-900/30 p-2 rounded">
                    <div className="text-green-300 font-medium text-xs mb-1">📍 Contract:</div>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs font-mono flex-1 text-white break-all">
                        {deploymentResult.contractAddress}
                      </code>
                      <button
                        onClick={() => copyToClipboard(deploymentResult.contractAddress)}
                        className="text-green-400 hover:text-green-300 p-1"
                      >
                        <ClipboardDocumentIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/30 p-2 rounded">
                    <div className="text-blue-300 font-medium text-xs mb-1">🔗 Transaction:</div>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs font-mono flex-1 text-white break-all">
                        {deploymentResult.transactionHash}
                      </code>
                      <button
                        onClick={() => copyToClipboard(deploymentResult.transactionHash)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                      >
                        <ClipboardDocumentIcon className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {deploymentResult.networkInfo && (
                    <div className="space-y-1">
                      <a
                        href={deploymentResult.networkInfo.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary w-full justify-center text-xs py-2"
                      >
                        📄 View Contract
                      </a>
                      {deploymentResult.networkInfo.txExplorerUrl && (
                        <a
                          href={deploymentResult.networkInfo.txExplorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary w-full justify-center text-xs py-2"
                        >
                          🔗 View Transaction
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Interact Tab */}
      {activeTab === 'interact' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-semibold text-white flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">⚡</span>
            </div>
            <span>Contract Interaction</span>
          </h3>
          
          {!deploymentResult?.success ? (
            <div className="glass-card bg-yellow-900/20 border-yellow-500/30">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
                <span className="text-yellow-200 font-medium">
                  Deploy your contract first to interact with it
                </span>
              </div>
            </div>
          ) : (
            <div className="glass-card text-center py-12">
              <div className="text-6xl mb-4">🔧</div>
              <div className="text-white/80 text-lg mb-2">
                Contract Interaction Coming Soon
              </div>
              <div className="text-white/60 text-sm max-w-md mx-auto">
                This feature will allow you to call contract functions directly from the playground with a beautiful interface.
              </div>
              <div className="mt-6 flex justify-center space-x-4">
                <div className="glass px-4 py-2 rounded-xl text-sm text-white/70">
                  📖 Read Functions
                </div>
                <div className="glass px-4 py-2 rounded-xl text-sm text-white/70">
                  ✍️ Write Functions
                </div>
                <div className="glass px-4 py-2 rounded-xl text-sm text-white/70">
                  📊 Events
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}