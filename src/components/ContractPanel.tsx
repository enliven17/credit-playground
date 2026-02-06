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
  onDeploy: (args: any[]) => void
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
  const [constructorArgs, setConstructorArgs] = useState<Record<string, string>>({})

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const constructorInputs = compilationResult?.abi?.find((item: any) => item.type === 'constructor')?.inputs || []

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-[#3e3e42]">
        {[
          { id: 'compile', label: 'Compile', icon: PlayIcon },
          { id: 'deploy', label: 'Deploy', icon: RocketLaunchIcon },
          { id: 'interact', label: 'Interact', icon: CheckCircleIcon }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium transition-colors border-b-2 ${activeTab === id
              ? 'border-blue-500 text-white bg-[#1e1e1e]'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-[#3e3e42]'
              }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Compile Tab */}
      {activeTab === 'compile' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Compile
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
            <div className={`glass p-3 rounded-lg border ${compilationResult.success ? 'border-green-500/50 bg-green-900/20' : 'border-red-500/50 bg-red-900/20'
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
            <h3 className="text-lg font-semibold text-white">
              Deploy
            </h3>
            <button
              onClick={() => {
                const args = constructorInputs.map((input: any) => constructorArgs[input.name] || '')
                onDeploy(args)
              }}
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

          {/* Constructor Arguments */}
          {compilationResult?.success && constructorInputs.length > 0 && (
            <div className="space-y-2 p-3 bg-[#2d2d30] rounded-lg border border-[#3e3e42]">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center">
                <ExclamationTriangleIcon className="h-3 w-3 mr-1 text-blue-400" />
                Constructor Arguments
              </h4>
              {constructorInputs.map((input: any) => (
                <div key={input.name} className="space-y-1">
                  <label className="text-[10px] text-gray-400 ml-1">
                    {input.name} <span className="text-blue-500">({input.type})</span>
                  </label>
                  <input
                    type="text"
                    placeholder={`Enter ${input.name}...`}
                    className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    value={constructorArgs[input.name] || ''}
                    onChange={(e) => setConstructorArgs(prev => ({ ...prev, [input.name]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          )}

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

          {/* Deployment Result */}
          {deploymentResult && (
            <div className={`p-4 rounded-xl border ${deploymentResult.success
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
              }`}>
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg ${deploymentResult.success ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {deploymentResult.success ? (
                    <RocketLaunchIcon className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {deploymentResult.success ? 'Contract Deployed' : 'Deployment Failed'}
                  </h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">
                    {deploymentResult.success ? 'Creditcoin Testnet' : 'Error details below'}
                  </p>
                </div>
              </div>

              {deploymentResult.error && (
                <div className="text-xs text-red-300 bg-red-900/30 p-3 rounded-lg border border-red-500/20 max-h-32 overflow-y-auto font-mono">
                  {deploymentResult.error}
                </div>
              )}

              {deploymentResult.success && (
                <div className="space-y-2.5">
                  <div className="bg-[#1e1e1e] p-3 rounded-lg border border-white/5 space-y-3">
                    <div className="flex items-center justify-between group">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">Contract Address</span>
                        <span className="text-xs text-gray-300 font-mono truncate max-w-[180px]">{deploymentResult.contractAddress}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(deploymentResult.contractAddress)}
                        className="p-1.5 hover:bg-white/5 rounded text-gray-500 hover:text-white transition-all"
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="h-px bg-white/5"></div>

                    <div className="flex flex-col space-y-2 pt-1">
                      <a
                        href={deploymentResult.networkInfo?.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all border border-blue-500/20"
                      >
                        <span className="text-xs font-semibold italic">View on Blockscout</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>

                      {deploymentResult.transactionHash && (
                        <a
                          href={deploymentResult.networkInfo?.txExplorerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 transition-all border border-pink-500/20"
                        >
                          <span className="text-xs font-semibold italic">View Transaction</span>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      )}
                    </div>
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
          <h3 className="text-lg font-semibold text-white">
            Contract Interaction
          </h3>

          {!deploymentResult?.success ? (
            <div className="glass-card bg-yellow-900/20 border-yellow-500/30">
              <div className="flex items-center space-x-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
                <span className="text-yellow-200 font-medium">
                  Deploy contract first
                </span>
              </div>
            </div>
          ) : (
            <div className="glass-card text-center py-8">
              <div className="text-4xl mb-3">🔧</div>
              <div className="text-white/80 text-base mb-1">
                Coming Soon
              </div>
              <div className="text-white/60 text-sm">
                Contract interaction interface
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
