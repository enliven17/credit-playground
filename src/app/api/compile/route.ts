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

    // Extract contract name
    const contractName = extractContractName(code)
    
    // Create contract file in contracts directory
    const contractsDir = path.join(process.cwd(), 'contracts')
    await fs.mkdir(contractsDir, { recursive: true })
    
    const contractPath = path.join(contractsDir, `${contractName}.sol`)
    await fs.writeFile(contractPath, code)

    try {
      // Clean previous artifacts
      const artifactsDir = path.join(process.cwd(), 'artifacts')
      try {
        await fs.rm(artifactsDir, { recursive: true, force: true })
      } catch {}

      // Compile using Hardhat
      const { stdout, stderr } = await execAsync('npx hardhat compile', {
        cwd: process.cwd(),
        timeout: 30000,
        env: { ...process.env, FORCE_COLOR: '0' }
      })

      // Read compilation artifacts
      const artifactPath = path.join(process.cwd(), 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`)

      let abi = null
      let bytecode = null

      try {
        const artifactContent = await fs.readFile(artifactPath, 'utf-8')
        const artifact = JSON.parse(artifactContent)
        abi = artifact.abi
        bytecode = artifact.bytecode
      } catch (artifactError) {
        console.warn('Could not read artifact file:', artifactError)
        // Try to find any contract artifact
        try {
          const contractsArtifactsDir = path.join(process.cwd(), 'artifacts', 'contracts')
          const files = await fs.readdir(contractsArtifactsDir, { recursive: true })
          const jsonFiles = files.filter(f => f.toString().endsWith('.json') && !f.toString().includes('.dbg.json'))
          
          if (jsonFiles.length > 0) {
            const firstArtifact = path.join(contractsArtifactsDir, jsonFiles[0].toString())
            const artifactContent = await fs.readFile(firstArtifact, 'utf-8')
            const artifact = JSON.parse(artifactContent)
            abi = artifact.abi
            bytecode = artifact.bytecode
          }
        } catch (fallbackError) {
          console.warn('Fallback artifact reading failed:', fallbackError)
        }
      }

      // Clean up contract file
      await fs.unlink(contractPath).catch(() => {})

      if (!abi || !bytecode) {
        return NextResponse.json({
          success: false,
          error: 'Compilation succeeded but could not extract ABI or bytecode'
        })
      }

      return NextResponse.json({
        success: true,
        abi,
        bytecode,
        output: stdout
      })

    } catch (compileError: any) {
      // Clean up contract file
      await fs.unlink(contractPath).catch(() => {})

      let errorMessage = 'Compilation failed'
      if (compileError.stderr) {
        errorMessage = compileError.stderr
      } else if (compileError.stdout) {
        errorMessage = compileError.stdout
      } else if (compileError.message) {
        errorMessage = compileError.message
      }

      return NextResponse.json({
        success: false,
        error: errorMessage
      })
    }

  } catch (error: any) {
    console.error('Compilation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error: ' + error.message },
      { status: 500 }
    )
  }
}

function extractContractName(code: string): string {
  const match = code.match(/contract\s+(\w+)/)
  return match ? match[1] : 'TempContract'
}