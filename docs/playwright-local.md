# Project-local Playwright MCP (Windows)

For managed Chromium in the cloud instead of a local download, see
[docs/browserless.md](browserless.md).

OpenCode uses `opencode.json` to launch Playwright MCP with the portable Node
version pinned in `.node-version`. Open `/mcps` to connect the `playwright`
server (restart the project session if it has not discovered the config).
Start the app with `.\npm.cmd run dev`, then ask OpenCode to inspect its local URL.

Install or restore the MCP dependency and matching Chromium browser:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/playwright-local.ps1 install
```

Verify browser launch, clicking, and screenshots:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/playwright-local.ps1 check
```

The launcher sets process-local `PLAYWRIGHT_BROWSERS_PATH`, `npm_config_cache`,
`TEMP`, `TMP`, and `TMPDIR`. Browsers, npm cache, temporary profiles/downloads,
and screenshots live under `.tools/playwright/` (already Git-ignored).
Packages are local devDependencies in `node_modules`; no global installation
or persistent system environment changes are needed.

MCP uses headless Chromium with an explicit local executable and isolated
sessions. Closing a browser discards cookies and login state. Automatically
named screenshots go to `.tools/playwright/output/`; explicitly named files
may be saved elsewhere within the workspace.

Always use the launcher for browser installation and execution so these paths
remain active. It downloads Chromium, not the globally installed Chrome/Edge
channels. The ordinary `npm.cmd` launcher does not set these Playwright-specific
cache/temp settings. OpenCode's own storage and Windows-managed OS files are
outside the scope of this setup.

References:
- https://playwright.dev/docs/browsers#managing-browser-binaries
- https://github.com/microsoft/playwright-mcp
- https://opencode.ai/v2/docs/mcp-servers
