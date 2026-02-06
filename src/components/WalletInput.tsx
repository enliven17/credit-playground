import { useState, useEffect } from 'react'
import { EyeIcon, EyeSlashIcon, WalletIcon, CheckCircleIcon, CpuChipIcon } from '@heroicons/react/24/outline'
import { ethers } from 'ethers'

interface WalletInputProps {
  onWalletChange: (privateKey: string, address: string) => void
}

export default function WalletInput({ onWalletChange }: WalletInputProps) {
  const [activeTab, setActiveTab] = useState<'browser' | 'private'>('browser')
  const [privateKey, setPrivateKey] = useState('')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  // Connect to MetaMask
  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('Please install MetaMask or another Ethereum wallet')
      return
    }

    setIsConnecting(true)
    setError('')

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])

      if (accounts.length > 0) {
        const address = accounts[0]
        setWalletAddress(address)
        setIsValid(true)
        onWalletChange('', address) // Empty private key for browser wallet

        // Listen for account changes
        window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
          if (newAccounts.length > 0) {
            setWalletAddress(newAccounts[0])
            onWalletChange('', newAccounts[0])
          } else {
            setWalletAddress('')
            setIsValid(false)
            onWalletChange('', '')
          }
        })
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const validatePrivateKey = (key: string) => {
    try {
      if (!key) {
        setWalletAddress('')
        setIsValid(false)
        setError('')
        onWalletChange('', '')
        return
      }

      const cleanKey = key.startsWith('0x') ? key.slice(2) : key
      if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
        setError('Invalid private key format')
        setIsValid(false)
        setWalletAddress('')
        onWalletChange('', '')
        return
      }

      const wallet = new ethers.Wallet('0x' + cleanKey)
      setWalletAddress(wallet.address)
      setIsValid(true)
      setError('')
      onWalletChange('0x' + cleanKey, wallet.address)
    } catch (err) {
      setError('Invalid private key')
      setIsValid(false)
      setWalletAddress('')
      onWalletChange('', '')
    }
  }

  const handlePrivateKeyChange = (value: string) => {
    setPrivateKey(value)
    validatePrivateKey(value)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <WalletIcon className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Wallet</h3>
      </div>

      <div className="flex bg-[#1e1e1e] p-1 rounded-lg border border-[#3e3e42]">
        <button
          onClick={() => {
            setActiveTab('browser')
            setIsValid(false)
            setWalletAddress('')
            onWalletChange('', '')
          }}
          className={`flex-1 flex items-center justify-center space-x-2 py-1.5 text-xs rounded-md transition-all ${activeTab === 'browser' ? 'bg-[#37373d] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
            }`}
        >
          <CpuChipIcon className="h-3.5 w-3.5" />
          <span>Browser Wallet</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('private')
            setIsValid(false)
            setWalletAddress('')
            onWalletChange('', '')
          }}
          className={`flex-1 flex items-center justify-center space-x-2 py-1.5 text-xs rounded-md transition-all ${activeTab === 'private' ? 'bg-[#37373d] text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
            }`}
        >
          <EyeIcon className="h-3.5 w-3.5" />
          <span>Private Key</span>
        </button>
      </div>

      <div className="space-y-3">
        {activeTab === 'browser' ? (
          <div className="space-y-3">
            {!walletAddress ? (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
              >
                {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
              </button>
            ) : (
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-3 flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-green-300 font-medium">Connected</p>
                  <p className="text-[10px] text-green-400/70 font-mono truncate">{walletAddress}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showPrivateKey ? 'text' : 'password'}
                value={privateKey}
                onChange={(e) => handlePrivateKeyChange(e.target.value)}
                placeholder="Enter Private Key (0x...)"
                className="w-full bg-[#1e1e1e] border border-[#3e3e42] rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPrivateKey ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
            {walletAddress && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3 flex items-center space-x-3">
                <CheckCircleIcon className="h-5 w-5 text-blue-400" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-blue-300 font-medium">Wallet Active</p>
                  <p className="text-[10px] text-blue-400/70 font-mono truncate">{walletAddress}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-[10px] text-red-400 mt-1 flex items-center space-x-1">
            <span>⚠️</span>
            <span>{error}</span>
          </p>
        )}

        <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-xl p-3">
          <p className="text-[10px] text-yellow-500 leading-relaxed font-medium">
            ⚠️ SECURITY: Use only testnet wallets. Never share your private keys.
          </p>
        </div>
      </div>
    </div>
  )
}
