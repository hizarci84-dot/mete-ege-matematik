import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, '..')
const frontendDir = path.join(rootDir, 'frontend')

console.log('🚀 Mete ve Ege Test Çözme & Takip Sistemi başlatılıyor...')

// Start backend
const backend = spawn('node', ['server/index.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true
})

// Start frontend
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: frontendDir,
  stdio: 'inherit',
  shell: true
})

function cleanup() {
  console.log('\n🛑 Sistem kapatılıyor...')
  backend.kill()
  frontend.kill()
  process.exit()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
