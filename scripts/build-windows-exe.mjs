#!/usr/bin/env node

/**
 * 构建 Windows 可执行程序脚本
 *
 * 功能：
 * 1. 构建 Web 应用
 * 2. 复制构建产物到 md-cli
 * 3. 使用 pkg 打包成 Windows exe
 */

import { spawn } from 'child_process'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const rootDir = join(__dirname, '..')
const webDir = join(rootDir, 'apps/web')
const cliDir = join(rootDir, 'packages/md-cli')

/**
 * 执行命令
 */
function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`\n▶️  执行: ${command} ${args.join(' ')}`)
    console.log(`📁 目录: ${cwd}\n`)

    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    })

    child.on('close', code => {
      if (code === 0) {
        console.log(`✅ 完成: ${command} ${args.join(' ')}\n`)
        resolve()
      } else {
        reject(new Error(`命令失败，退出代码: ${code}`))
      }
    })

    child.on('error', err => {
      reject(err)
    })
  })
}

async function build() {
  try {
    console.log('🚀 开始构建 Windows 可执行程序\n')
    console.log('=' .repeat(60))

    // 1. 构建 Web 应用
    console.log('\n📦 步骤 1/4: 构建 Web 应用...')
    await runCommand('pnpm', ['web', 'build'], rootDir)

    // 2. 复制构建产物
    console.log('\n📋 步骤 2/4: 复制构建产物到 md-cli...')
    await runCommand('npx', ['shx', 'rm', '-rf', 'packages/md-cli/dist'], rootDir)
    await runCommand('npx', ['shx', 'cp', '-r', 'apps/web/dist', 'packages/md-cli/'], rootDir)

    // 3. 安装 md-cli 依赖（如果需要）
    console.log('\n📥 步骤 3/4: 检查 md-cli 依赖...')
    if (!existsSync(join(cliDir, 'node_modules'))) {
      await runCommand('pnpm', ['install'], cliDir)
    }

    // 4. 使用 pkg 打包
    console.log('\n🔨 步骤 4/4: 使用 pkg 打包 Windows exe...')

    // 确保构建目录存在
    const buildDir = join(cliDir, 'build')
    if (!existsSync(buildDir)) {
      mkdirSync(buildDir, { recursive: true })
    }

    await runCommand('pnpm', ['run', 'build:exe:win'], cliDir)

    console.log('\n' + '=' .repeat(60))
    console.log('✅ 构建完成!')
    console.log('\n📍 可执行文件位置:')
    console.log(`   ${join(cliDir, 'build/md-cli.exe')}`)
    console.log('\n💡 使用方法:')
    console.log('   双击 md-cli.exe 即可启动')
    console.log('   或在命令行运行: .\\md-cli.exe')
    console.log('\n🎉 Windows 程序构建成功!\n')

  } catch (err) {
    console.error('\n❌ 构建失败:', err.message)
    process.exit(1)
  }
}

build()
