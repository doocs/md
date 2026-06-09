# Links .claude/skills -> .agents/skills for Claude Code discovery.
# Uses directory junction on Windows (no admin required).

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$link = Join-Path $root '.claude\skills'
$target = Join-Path $root '.agents\skills'

if (-not (Test-Path $target)) {
  Write-Error "Missing target directory: $target"
}

if (Test-Path $link) {
  $item = Get-Item $link -Force
  if ($item.LinkType -eq 'Junction' -or $item.LinkType -eq 'SymbolicLink') {
    if ($item.Target -contains $target -or $item.Target -contains (Resolve-Path $target).Path) {
      Write-Host "Already linked: $link -> $target"
      exit 0
    }
  }
  Remove-Item $link -Force -Recurse
}

New-Item -ItemType Junction -Path $link -Target $target | Out-Null
Write-Host "Linked $link -> $target"
