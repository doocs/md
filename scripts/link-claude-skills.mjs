import { execSync } from 'node:child_process'
import { platform } from 'node:os'

const cmd = platform() === 'win32'
  ? 'powershell -ExecutionPolicy Bypass -File scripts/link-claude-skills.ps1'
  : 'bash scripts/link-claude-skills.sh'

execSync(cmd, { stdio: 'inherit' })
