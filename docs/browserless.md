# Browserless managed browsers

`scripts/playwright-local.mjs` can run its Playwright checks on
[Browserless](https://docs.browserless.io/baas/quick-start) managed Chromium
instead of a local browser. The `browserless` mode connects over CDP
(`chromium.connectOverCDP`) and reuses the session's default context, so the
same locators, waits, and screenshots behave as they do locally. Chromium does
not need to be installed for this mode.

Everything else stays local: `install`, `mcp`, and `check` are unchanged and
still use the project-local browser under `.tools/playwright/`.

## Setup

1. Create a free account and copy the API token from the
   [Browserless dashboard](https://browserless.io/account/).
2. Put the token in a Git-ignored `.env` file (copy `.env.example`) or export
   it for the current shell only:

   ```powershell
   $env:BROWSERLESS_TOKEN = '<your token>'
   ```

## Run the example

```powershell
npm run browserless:check
```

The script reads `BROWSERLESS_TOKEN` from the environment (`npm run
browserless:check` also loads a local `.env` file with
`--env-file-if-exists`), opens `https://example.com/` in a managed browser,
prints the page title, and saves a screenshot to
`.tools/playwright/output/browserless-check.png`. It never prints the token.

With the optional portable Node runtime, the launcher forwards the same mode:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/playwright-local.ps1 browserless
```

The launcher requires `scripts/setup-node.ps1` to have run once; the plain
`npm run` command above works with any Node 24.x installation.

## Regions and endpoints

The script connects to the shared US West fleet,
`wss://production-sfo.browserless.io`. Swap the host in
`BROWSERLESS_ENDPOINT` (`scripts/playwright-local.mjs`) for the nearest region:

| Region | Host |
| --- | --- |
| US West | `production-sfo.browserless.io` |
| Europe UK | `production-lon.browserless.io` |
| Europe Amsterdam | `production-ams.browserless.io` |

## Troubleshooting

- `Set BROWSERLESS_TOKEN ...` — the variable is empty; see Setup above.
- `401`/`403` while connecting — the token is wrong, revoked, or out of units.
- The check exits non-zero without a title — the public page or the fleet was
  unreachable; rerun once before investigating.

References:
- https://docs.browserless.io/baas/quick-start
- https://docs.browserless.io/overview/getting-started/connect-playwright
- https://docs.browserless.io/overview/connection-urls
