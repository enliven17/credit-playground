import { NextRequest, NextResponse } from 'next/server'
import solc from 'solc'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid contract code' },
        { status: 400 }
      )
    }

    const contractName = extractContractName(code)

    // Prepare solc input
    const input = {
      language: 'Solidity',
      sources: {
        'Contract.sol': {
          content: code
        }
      },
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        outputSelection: {
          '*': {
            '*': ['abi', 'evm.bytecode']
          }
        }
      }
    }

    // Compile
    const output = JSON.parse(solc.compile(JSON.stringify(input)))

    // Check for errors
    if (output.errors) {
      const buildErrors = output.errors.filter((error: any) => error.severity === 'error')
      if (buildErrors.length > 0) {
        return NextResponse.json({
          success: false,
          error: buildErrors.map((e: any) => e.formattedMessage).join('\n')
        })
      }
    }

    // Extract artifacts
    const contractFile = output.contracts['Contract.sol']
    const compiledContract = contractFile[contractName] || Object.values(contractFile)[0]

    if (!compiledContract) {
      return NextResponse.json({
        success: false,
        error: 'Contract not found in compilation output'
      })
    }

    return NextResponse.json({
      success: true,
      abi: compiledContract.abi,
      bytecode: compiledContract.evm.bytecode.object,
      output: 'Compilation successful'
    })

  } catch (error: any) {
    console.error('Compilation error:', error)
    return NextResponse.json(
      { success: false, error: 'Compilation error: ' + error.message },
      { status: 500 }
    )
  }
}

function extractContractName(code: string): string {
  const match = code.match(/contract\s+(\w+)/)
  return match ? match[1] : 'MyContract'
}