import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

export async function POST(request: NextRequest) {
  try {
    const { bytecode, abi } = await request.json()

    if (!bytecode || !abi) {
      return NextResponse.json(
        { success: false, error: 'Missing bytecode or ABI' },
        { status: 400 }
      )
    }

    // Check if private key is configured
    const privateKey = process.env.PRIVATE_KEY
    if (!privateKey) {
      return NextResponse.json({
        success: false,
        error: 'Private key not configured. Please set PRIVATE_KEY environment variable.'
      })
    }

    // Connect to Creditcoin testnet
    const provider = new ethers.JsonRpcProvider('https://rpc.cc3-testnet.creditcoin.network')
    const wallet = new ethers.Wallet(privateKey, provider)

    // Check wallet balance
    const balance = await wallet.provider.getBalance(wallet.address)
    if (balance === 0n) {
      return NextResponse.json({
        success: false,
        error: `Insufficient balance. Please fund your wallet: ${wallet.address}`
      })
    }

    // Create contract factory
    const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet)

    // Deploy contract
    const contract = await contractFactory.deploy({
      gasLimit: 3000000,
      gasPrice: ethers.parseUnits('20', 'gwei')
    })

    // Wait for deployment
    await contract.waitForDeployment()
    const contractAddress = await contract.getAddress()

    return NextResponse.json({
      success: true,
      contractAddress,
      transactionHash: contract.deploymentTransaction()?.hash,
      deployerAddress: wallet.address,
      networkInfo: {
        chainId: 102031,
        networkName: 'Creditcoin Testnet',
        explorerUrl: `https://explorer.cc3-testnet.creditcoin.network/address/${contractAddress}`
      }
    })

  } catch (error: any) {
    console.error('Deployment error:', error)
    
    let errorMessage = 'Deployment failed'
    
    if (error.code === 'INSUFFICIENT_FUNDS') {
      errorMessage = 'Insufficient funds for deployment'
    } else if (error.code === 'NETWORK_ERROR') {
      errorMessage = 'Network connection error'
    } else if (error.message) {
      errorMessage = error.message
    }

    return NextResponse.json({
      success: false,
      error: errorMessage
    })
  }
}