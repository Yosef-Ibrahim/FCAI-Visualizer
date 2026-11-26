param(
    [ValidateSet('install', 'mcp', 'check', 'browserless')]
    [string]$Mode = 'mcp'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
Set-Location $root
$version = (Get-Content "$root/.node-version" -Raw).Trim()
$arch = 'x64'
if ($env:PROCESSOR_ARCHITECTURE -eq 'ARM64' -or $env:PROCESSOR_ARCHITEW6432 -eq 'ARM64') { $arch = 'arm64' }
$nodeHome = "$root/.tools/node-v$version-win-$arch"
$node = "$nodeHome/node.exe"
if (!(Test-Path $node)) { throw 'Run scripts/setup-node.ps1 to install the project Node runtime first.' }
$env:PATH = "$nodeHome;$env:PATH"

# Process-local settings: downloads and browser scratch files stay in this repo.
$storage = "$root/.tools/playwright"
$env:PLAYWRIGHT_BROWSERS_PATH = "$storage/browsers"
$env:npm_config_cache = "$storage/npm-cache"
$env:TEMP = "$storage/tmp"
$env:TMP = $env:TEMP
$env:TMPDIR = $env:TEMP
foreach ($dir in @($env:PLAYWRIGHT_BROWSERS_PATH, $env:npm_config_cache, $env:TEMP, "$storage/output")) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
}

if ($Mode -eq 'install') {
    & "$root/npm.cmd" install --save-dev --save-exact @playwright/mcp --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
& $node "$PSScriptRoot/playwright-local.mjs" $Mode
exit $LASTEXITCODE
