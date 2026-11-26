import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const mcpRoot = dirname(require.resolve('@playwright/mcp/package.json'))
// Resolve the exact browser library used by MCP, including nested dependencies.
const mcpRequire = createRequire(join(mcpRoot, 'package.json'))
const { chromium } = mcpRequire('playwright')
const storage = join(root, '.tools', 'playwright')
const mode = process.argv[2]
const LOCAL_MODES = ['install', 'mcp', 'check']
// Shared Browserless fleet (US West). See docs/browserless.md for other regions.
const BROWSERLESS_ENDPOINT = 'wss://production-sfo.browserless.io'

if (LOCAL_MODES.includes(mode)
  && resolve(process.env.PLAYWRIGHT_BROWSERS_PATH || '.') !== join(storage, 'browsers')) {
  throw new Error('Use scripts/playwright-local.ps1 to configure project-local storage.')
}

if (mode === 'install') {
  const cli = join(dirname(mcpRequire.resolve('playwright/package.json')), 'cli.js')
  const result = spawnSync(process.execPath, [cli, 'install', 'chromium', '--no-shell'], { stdio: 'inherit' })
  if (result.error) throw result.error
  process.exitCode = result.status ?? 1
} else if (mode === 'browserless') {
  // Managed browser: no local Chromium download, the token authorizes the session.
  const token = (process.env.BROWSERLESS_TOKEN || '').trim()
  if (!token) throw new Error('Set BROWSERLESS_TOKEN before running mode "browserless" (see .env.example).')
  const output = join(storage, 'output')
  mkdirSync(output, { recursive: true })
  const browser = await chromium.connectOverCDP(`${BROWSERLESS_ENDPOINT}?token=${encodeURIComponent(token)}`)
  try {
    // Reuse the session's default context so launch options (proxy, profile) apply.
    const context = browser.contexts()[0] ?? await browser.newContext()
    const page = await context.newPage()
    await page.goto('https://example.com/', { waitUntil: 'domcontentloaded' })
    const title = await page.title()
    await page.screenshot({ path: join(output, 'browserless-check.png') })
    console.log(`Browserless check passed.\nEndpoint: ${BROWSERLESS_ENDPOINT}\nPage title: ${title}`)
  } finally {
    await browser.close()
  }
} else {
  const executablePath = chromium.executablePath()
  if (!existsSync(executablePath)) throw new Error('Run scripts/playwright-local.ps1 install first.')
  if (mode === 'mcp') {
    const result = spawnSync(process.execPath, [join(mcpRoot, 'cli.js'),
      '--headless', '--isolated', '--executable-path', executablePath,
      '--output-dir', join(storage, 'output'),
    ], { stdio: 'inherit', cwd: root })
    if (result.error) throw result.error
    process.exitCode = result.status ?? 1
  } else if (mode === 'check') {
    const browser = await chromium.launch({ executablePath, headless: true })
    try {
      const page = await browser.newPage()
      await page.setContent('<button onclick="this.textContent=\'Passed\'">Check browser</button>')
      await page.getByRole('button', { name: 'Check browser' }).click()
      await page.getByRole('button', { name: 'Passed', exact: true }).waitFor()
      await page.screenshot({ path: join(storage, 'output', 'smoke-check.png') })
      console.log(`Browser check passed.\nNode: ${process.execPath}\nBrowser: ${executablePath}\nTemp: ${process.env.TEMP}`)
    } finally {
      await browser.close()
    }
  } else {
    throw new Error(`Unknown mode: ${mode}`)
  }
}