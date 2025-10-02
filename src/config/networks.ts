import { NetworkConfig } from '@/types/contract'

export const CREDITCOIN_TESTNET: NetworkConfig = {
  name: 'Creditcoin Testnet',
  chainId: 102031,
  rpcUrl: 'https://rpc.cc3-testnet.creditcoin.network',
  explorerUrl: 'https://explorer.cc3-testnet.creditcoin.network',
  symbol: 'CTC',
  isTestnet: true
}

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  CREDITCOIN_TESTNET
]

export const DEFAULT_NETWORK = CREDITCOIN_TESTNET