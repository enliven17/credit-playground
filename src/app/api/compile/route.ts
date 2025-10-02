import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid contract code' },
        { status: 400 }
      )
    }

    // Create temporary contract file
    const tempDir = path.join(process.cwd(), 'temp')
    await fs.mkdir(tempDir, { recursive: true })
    
    const contractPath = path.join(tempDir, 'TempContract.sol')
    await fs.writeFile(contractPath, code)

    try {
      // Compile using Hardhat
      const { stdout, stderr } = await execAsync('npx hardhat compile', {
        cwd: process.cwd(),
        timeout: 30000
      })

      // Read compilation artifacts
      const artifactsDir = path.join(process.cwd(), 'artifacts', 'temp', 'TempContract.sol')
      const contractName = extractContractName(code)
      const artifactPath = path.join(artifactsDir, `${contractName}.json`)

      let abi = null
      let bytecode = null

      try {
        const artifactContent = await fs.readFile(artifactPath, 'utf-8')
        const artifact = JSON.parse(artifactContent)
        abi = artifact.abi
        bytecode = artifact.bytecode
      } catch (artifactError) {
        console.warn('Could not read artifact file:', artifactError)
      }

      // Clean up temp file
      await fs.unlink(contractPath).catch(() => {})

      return NextResponse.json({
        success: true,
        abi,
        bytecode,
        output: stdout
      })

    } catch (compileError: any) {
      // Clean up temp file
      await fs.unlink(contractPath).catch(() => {})

      return NextResponse.json({
        success: false,
        error: compileError.stderr || compileError.message || 'Compilation failed'
      })
    }

  } catch (error: any) {
    console.error('Compilation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function extractContractName(code: string): string {
  const match = code.match(/contract\s+(\w+)/)
  return match ? match[1] : 'TempContract'
}