#!/usr/bin/env node
// Responsive layout smoke check.
//
// Serves the production build and loads every visualizer route at a phone and a
// tablet viewport, failing on the layout defects that unit tests cannot see:
//   1. the page scrolls horizontally,
//   2. an interactive control is clipped outside the viewport,
//   3. a control sits underneath the floating contact dock at maximum scroll.
//
// Usage:
//   npm run build && npm run smoke:layout
//   SMOKE_ROUTES=sorting,dp npm run smoke:layout      # debug a subset
//   SMOKE_BASE_URL=http://127.0.0.1:5173 npm run smoke:layout   # use a running server

import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { preview } from 'vite';
import { chromium } from 'playwright';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.SMOKE_PORT || 4173);

// Routes that render a visualizer, a workbench, or a full tool page. Kept
// explicit (rather than scraped from App.jsx) so the smoke check states exactly
// which screens are covered; add new pages here when they ship.
const ROUTES = [
  '/',
  '/courses/data-structure',
  '/courses/data-structure/arrays',
  '/courses/data-structure/stacks',
  '/courses/data-structure/queues',
  '/courses/data-structure/linked-lists',
  '/courses/data-structure/sorting',
  '/courses/data-structure/searching',
  '/courses/data-structure/graphs',
  '/courses/data-structure/hashing',
  '/courses/advanced-data-structure',
  '/courses/advanced-data-structure/trees',
  '/courses/advanced-data-structure/avl-tree',
  '/courses/advanced-data-structure/red-black-tree',
  '/courses/advanced-data-structure/b-tree',
  '/courses/advanced-data-structure/trie',
  '/courses/advanced-data-structure/suffix-trie',
  '/courses/advanced-data-structure/suffix-tree',
  '/courses/advanced-data-structure/suffix-array',
  '/courses/algorithms/dynamic-programming',
  '/courses/algorithms/greedy',
  '/courses/operating-systems/cpu-scheduling',
  '/courses/information-theory-compression/lossless',
  '/courses/information-theory-compression/lossy',
  '/sorting/bubble',
  '/searching/binary-search',
  '/graphs/bfs',
  '/trees/bst',
  '/data-structures/array',
  '/practice',
  '/compare',
];

const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
];

// Runs in the page. Returns layout defects for the current route/viewport.
function auditLayout() {
  const TOLERANCE = 1;
  const problems = [];

  const nameOf = (el) => {
    const cls = (el.getAttribute('class') || '').trim().split(/\s+/).slice(0, 2).join('.');
    return `${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''}`;
  };

  // The rect an element actually occupies after every clipping ancestor is
  // applied, or null when nothing of it is visible.
  const clippedRect = (el) => {
    let rect = el.getBoundingClientRect();
    for (let parent = el.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      const clipsX = style.overflowX !== 'visible';
      const clipsY = style.overflowY !== 'visible';
      if (!clipsX && !clipsY) continue;
      const box = parent.getBoundingClientRect();
      const left = box.left + parent.clientLeft;
      const top = box.top + parent.clientTop;
      if (clipsX) {
        rect = {
          ...rect,
          left: Math.max(rect.left, left),
          right: Math.min(rect.right, left + parent.clientWidth),
        };
      }
      if (clipsY) {
        rect = {
          ...rect,
          top: Math.max(rect.top, top),
          bottom: Math.min(rect.bottom, top + parent.clientHeight),
        };
      }
      if (rect.right - rect.left < 1 || rect.bottom - rect.top < 1) return null;
    }
    return rect;
  };

  const isVisible = (el) => {
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = el.getBoundingClientRect();
    return rect.width >= 2 && rect.height >= 2;
  };

  // 1. Horizontal page overflow (the shell scrolls sideways).
  const content = document.querySelector('.app-content');
  if (content) {
    const overflow = content.scrollWidth - content.clientWidth;
    if (overflow > TOLERANCE) {
      problems.push({
        kind: 'page-overflow',
        detail: `.app-content scrollWidth ${content.scrollWidth} > clientWidth ${content.clientWidth} (${overflow}px)`,
      });
    }
  }
  const docOverflow = document.documentElement.scrollWidth - window.innerWidth;
  if (docOverflow > TOLERANCE) {
    problems.push({
      kind: 'page-overflow',
      detail: `document scrollWidth ${document.documentElement.scrollWidth} > viewport ${window.innerWidth} (${docOverflow}px)`,
    });
  }

  const controls = document.querySelectorAll(
    'button, a[href], input, select, textarea, summary, [role="tab"], [role="button"]',
  );

  // 2. A control clipped outside the viewport, unreachable at any scroll.
  for (const el of controls) {
    if (el.closest('.contact-dock-root') || !isVisible(el)) continue;
    const rect = clippedRect(el);
    if (!rect) continue;
    if (rect.right > window.innerWidth + TOLERANCE || rect.left < -TOLERANCE) {
      problems.push({
        kind: 'control-offscreen',
        detail: `${nameOf(el)} "${(el.textContent || '').trim().slice(0, 24)}" spans ${Math.round(rect.left)}–${Math.round(rect.right)}px`,
      });
    }
  }

  // 3. A control hidden under the floating contact dock at maximum scroll.
  const dock = document.querySelector('.contact-dock');
  if (dock) {
    content.scrollTop = content.scrollHeight;
    const treePage = document.querySelector('.tree-page');
    if (treePage && getComputedStyle(treePage).overflowY === 'auto') {
      treePage.scrollTop = treePage.scrollHeight;
    }
    const dockRect = dock.getBoundingClientRect();
    for (const el of controls) {
      if (el.closest('.contact-dock-root') || !isVisible(el)) continue;
      const rect = clippedRect(el);
      if (!rect) continue;
      const overlapX = Math.min(rect.right, dockRect.right) - Math.max(rect.left, dockRect.left);
      const overlapY = Math.min(rect.bottom, dockRect.bottom) - Math.max(rect.top, dockRect.top);
      if (overlapX > 4 && overlapY > 4) {
        problems.push({
          kind: 'control-under-dock',
          detail: `${nameOf(el)} "${(el.textContent || '').trim().slice(0, 24)}" overlaps the contact dock`,
        });
      }
    }
  }

  return problems;
}

const selectedRoutes = process.env.SMOKE_ROUTES
  ? ROUTES.filter((route) => process.env.SMOKE_ROUTES.split(',').some((needle) => route.includes(needle.trim())))
  : ROUTES;

if (!selectedRoutes.length) {
  console.error(`SMOKE_ROUTES matched no route. Known routes:\n  ${ROUTES.join('\n  ')}`);
  process.exit(1);
}

let server = null;
let baseUrl = process.env.SMOKE_BASE_URL;
if (!baseUrl) {
  if (!existsSync(join(root, 'dist', 'index.html'))) {
    console.error('dist/index.html is missing — run `npm run build` before `npm run smoke:layout`.');
    process.exit(1);
  }
  server = await preview({
    root,
    logLevel: 'error',
    preview: { host: '127.0.0.1', port, strictPort: true },
  });
  baseUrl = `http://127.0.0.1:${port}`;
}

const failures = [];
let checks = 0;
let browser = null;

try {
  try {
    browser = await chromium.launch();
  } catch (error) {
    console.error('Could not launch Chromium — install it with `npx playwright install chromium`.');
    throw error;
  }
  const page = await browser.newPage();
  page.setDefaultTimeout(20_000);

  for (const viewport of VIEWPORTS) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    for (const route of selectedRoutes) {
      checks += 1;
      try {
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'load' });
        await page.waitForSelector('.app-content', { state: 'attached' });
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => (document.fonts ? document.fonts.ready.then(() => true) : true));
        await page.evaluate(
          () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(() => done(true)))),
        );
        const problems = await page.evaluate(auditLayout);
        for (const problem of problems) {
          failures.push({ viewport, route, ...problem });
        }
      } catch (error) {
        failures.push({
          viewport,
          route,
          kind: 'page-error',
          detail: error instanceof Error ? error.message.split('\n')[0] : String(error),
        });
      }
    }
    const prefix = `  ${viewport.name} ${viewport.width}×${viewport.height}`;
    console.log(`${prefix}: ${selectedRoutes.length} routes`);
  }
} finally {
  if (browser) await browser.close();
  if (server) await new Promise((done) => server.httpServer.close(done));
}

if (failures.length) {
  console.error(`\nLayout smoke failed: ${failures.length} problem(s) across ${checks} route/viewport loads.\n`);
  for (const failure of failures) {
    console.error(`  ✗ ${failure.viewport.name} ${failure.viewport.width}px  ${failure.route}`);
    console.error(`      ${failure.kind}: ${failure.detail}`);
  }
  process.exit(1);
}

console.log(`\n✓ Layout smoke passed — ${checks} route/viewport loads, no horizontal overflow, no clipped controls, no dock overlap.`);
