// ═══════════════════════════════════════════════════════════════════════════════
//  Tree Visualizer — Canvas + Events + Render Loop
//  STRICTLY PORTED from native BST.js (lines 526-866)
//  Attaches imperatively to a DOM container — zero React dependencies
// ═══════════════════════════════════════════════════════════════════════════════

import { BST, THEMES, SPEED_TABLE, drawTree } from './avlTree.js';

/**
 * Initialize the tree visualizer inside a container element.
 * @param {HTMLElement} container - DOM element to mount into
 * @returns {{ tree: BST, destroy: () => void, resetCamera: () => void }}
 */
export function initTreeVisualizer(container, type = 'avl') {
  const isBST = type === 'bst';
  const titleName = isBST ? 'Binary Search Tree' : 'AVL Tree';
  const readyMsg = isBST ? 'BST Ready' : 'AVL Tree Ready';

  // ── Build DOM ──────────────────────────────────────────────────────────
  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.height = '100%';

  // Side panel
  const panel = document.createElement('aside');
  panel.className = 'tree-panel';
  panel.innerHTML = `
    <div class="tree-panel-title">
      <span class="tree-title-main">${titleName}</span>
      <span class="tree-title-sub">Visualizer</span>
      <span class="tree-title-edition">Educational Edition</span>
    </div>
    <hr class="tree-divider"/>
    <section class="tree-section">
      <div class="tree-section-label">NODE VALUE</div>
      <div class="tree-input-row"><input class="tree-val-input" id="tv-val-input" type="text" value="0" autocomplete="off" spellcheck="false"/></div>
      <div class="tree-tip">Tip: prefix with <kbd>-</kbd> for negatives</div>
      <button class="tree-btn tree-btn-accent" id="tv-btn-insert">Insert Node</button>
      <button class="tree-btn tree-btn-danger" id="tv-btn-delete">Delete Node</button>
      <button class="tree-btn tree-btn-danger-dim" id="tv-btn-clear">Clear Entire Tree</button>
    </section>
    <hr class="tree-divider"/>
    <section class="tree-section">
      <div class="tree-section-label">SEARCH</div>
      <div class="tree-btn-row-2">
        <button class="tree-btn tree-btn-orange sm" id="tv-btn-pred">Predecessor</button>
        <button class="tree-btn tree-btn-orange sm" id="tv-btn-succ">Successor</button>
      </div>
    </section>
    <hr class="tree-divider"/>
    <section class="tree-section">
      <div class="tree-section-label">TRAVERSALS</div>
      <button class="tree-btn tree-btn-ghost sm tv-trav-btn" data-trav="pre">Pre-Order (Root→L→R)</button>
      <button class="tree-btn tree-btn-ghost sm tv-trav-btn" data-trav="in">In-Order (Sorted)</button>
      <button class="tree-btn tree-btn-ghost sm tv-trav-btn" data-trav="post">Post-Order (L→R→Root)</button>
      <button class="tree-btn tree-btn-ghost sm tv-trav-btn" data-trav="bfs">Breadth-First (Levels)</button>
    </section>
    <hr class="tree-divider"/>
    <section class="tree-section">
      <div class="tree-section-label">RANDOM GENERATOR</div>
      <div class="tree-gen-row">
        <label>N =</label>
        <input class="tree-rand-input" id="tv-rand-input" type="number" min="1" max="99" value="12"/>
        <button class="tree-btn tree-btn-green sm" id="tv-btn-gen">Generate!</button>
      </div>
    </section>
    <hr class="tree-divider"/>
    <section class="tree-section">
      <div class="tree-section-label">ANIMATION SPEED</div>
      <div class="tree-speed-row">
        <button class="tree-speed-btn active" data-speed="0">Slow</button>
        <button class="tree-speed-btn" data-speed="1">Normal</button>
        <button class="tree-speed-btn" data-speed="2">Fast</button>
      </div>
    </section>
    <hr class="tree-divider"/>
    <section class="tree-section">
      <div class="tree-section-label">PRESET SCENARIOS</div>
      <button class="tree-btn tree-btn-preset sm" id="tv-btn-preset-ll">Insert: LL Imbalance</button>
      <button class="tree-btn tree-btn-preset sm" id="tv-btn-preset-rr">Insert: RR Imbalance</button>
      <button class="tree-btn tree-btn-preset sm" id="tv-btn-preset-lr">Insert: LR Imbalance</button>
      <button class="tree-btn tree-btn-preset sm" id="tv-btn-preset-rl">Insert: RL Imbalance</button>
      <button class="tree-btn tree-btn-preset sm" id="tv-btn-preset-del-leaf">Delete: Leaf Node</button>
      <button class="tree-btn tree-btn-preset sm" id="tv-btn-preset-del-1child">Delete: 1 Child</button>
      <button class="tree-btn tree-btn-preset sm" id="tv-btn-preset-del-2child">Delete: 2 Children</button>
      <button class="tree-btn tree-btn-preset sm" id="tv-btn-preset-del-root">Delete: Root Node</button>
      <button class="tree-btn tree-btn-preset sm" id="tv-btn-preset-cascade">Advanced: Cascading</button>
    </section>
    <div class="tree-status-bar">
      <div class="tree-status-title">STATUS</div>
      <div class="tree-stat-line1" id="tv-stat1">${readyMsg}</div>
      <div class="tree-stat-line2" id="tv-stat2">Type a value and press Insert!</div>
    </div>
  `;

  // Canvas area
  const canvasWrap = document.createElement('main');
  canvasWrap.className = 'tree-canvas-wrap';
  canvasWrap.innerHTML = `
    <canvas class="tree-canvas" id="tv-canvas" role="img" aria-label="Tree Visualization Canvas"></canvas>
    <div aria-live="polite" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;" id="tv-aria-live"></div>
    <div class="tree-live-stats">
      <div class="tree-ls-label">LIVE STATS</div>
      <div class="tree-ls-nodes" id="tv-ls-nodes">Nodes: 0</div>
      <div class="tree-ls-height" id="tv-ls-height">Height: 0</div>
      <div class="tree-ls-balance tree-ls-balanced" id="tv-ls-balance">Balanced ✓</div>
    </div>
    <div class="tree-depth-legend">
      <span class="tree-legend-label">Depth:</span>
      <span class="tree-legend-dot" style="background:#5aa0ff"></span>
      <span class="tree-legend-dot" style="background:#37be73"></span>
      <span class="tree-legend-dot" style="background:#ff913c"></span>
      <span class="tree-legend-dot" style="background:#b450f0"></span>
      <span class="tree-legend-dot" style="background:#f54b82"></span>
      <span class="tree-legend-dot" style="background:#2dc3c8"></span>
      <span class="tree-legend-dot" style="background:#e1c828"></span>
      <span class="tree-legend-dot" style="background:#8cd23c"></span>
    </div>
    <div class="tree-hints">Scroll: Zoom &nbsp;|&nbsp; Right-click+Drag: Pan &nbsp;|&nbsp; Double-click: Reset View &nbsp;|&nbsp; Enter: Insert</div>
    <div class="tree-trav-bar" id="tv-trav-bar" style="display:none">
      <span class="tree-trav-title" id="tv-trav-title"></span>
      <span class="tree-trav-result" id="tv-trav-result"></span>
    </div>
    <div class="tree-popup" id="tv-popup" style="display:none">
      <span class="tree-popup-msg" id="tv-popup-msg"></span>
      <div class="tree-popup-progress" id="tv-popup-progress"></div>
    </div>
  `;

  container.appendChild(panel);
  container.appendChild(canvasWrap);

  // ── References ─────────────────────────────────────────────────────────
  const canvas = canvasWrap.querySelector('#tv-canvas');
  const ctx = canvas.getContext('2d');
  const tree = new BST();
  tree.isAVL = !isBST;
  let speedIdx = 0;
  let destroyed = false;

  const cam = { x:0, y:0, zoom:1, offsetX:0, offsetY:0 };
  let camReady = false;
  let isDragging = false, dragStartX = 0, dragStartY = 0, lastClickTime = 0;

  // Popup state
  let popupTimer = 0, popupMaxT = 0;
  const popupEl = canvasWrap.querySelector('#tv-popup');
  const popupMsg = canvasWrap.querySelector('#tv-popup-msg');
  const popupProg = canvasWrap.querySelector('#tv-popup-progress');

  function showPopup(msg, color, dur = 3.5) {
    popupMsg.textContent = msg;
    const ariaLive = canvasWrap.querySelector('#tv-aria-live');
    if (ariaLive) ariaLive.textContent = msg;
    popupEl.style.setProperty('--popup-border', color);
    popupEl.style.borderColor = color;
    popupEl.style.display = 'block';
    popupEl.style.opacity = '1';
    popupProg.style.width = '100%';
    popupProg.style.background = color;
    popupTimer = dur; popupMaxT = dur;
  }

  function tickPopup(dt) {
    if (popupTimer <= 0) return;
    popupTimer = Math.max(0, popupTimer - dt);
    const frac = popupMaxT > 0 ? popupTimer / popupMaxT : 0;
    const fade = Math.min(1, popupTimer * 3);
    popupEl.style.opacity = fade.toFixed(3);
    popupProg.style.width = (frac * 100).toFixed(1) + '%';
    if (popupTimer <= 0) popupEl.style.display = 'none';
  }

  function setStatus(l1, l2) {
    panel.querySelector('#tv-stat1').textContent = l1;
    panel.querySelector('#tv-stat2').textContent = l2;
  }

  function setTraversal(title, result) {
    const bar = canvasWrap.querySelector('#tv-trav-bar');
    if (!title) { bar.style.display = 'none'; return; }
    bar.style.display = 'flex';
    canvasWrap.querySelector('#tv-trav-title').textContent = title;
    canvasWrap.querySelector('#tv-trav-result').textContent = result;
  }

  function updateLiveStats() {
    const nc = tree.getNodeCount(), ht = tree.getTreeHeight();
    const bal = nc <= 1 || ht <= Math.ceil(1.45 * Math.log2(nc + 1) + 1.6);
    canvasWrap.querySelector('#tv-ls-nodes').textContent = `Nodes: ${nc}`;
    canvasWrap.querySelector('#tv-ls-height').textContent = `Height: ${ht}`;
    const balEl = canvasWrap.querySelector('#tv-ls-balance');
    if (!tree.isAVL) {
      balEl.textContent = 'Unbalanced Mode';
      balEl.className = 'tree-ls-balance';
      balEl.style.color = '#78829b';
    } else if (bal) { 
      balEl.textContent = 'Balanced ✓'; 
      balEl.className = 'tree-ls-balance tree-ls-balanced'; 
    } else { 
      balEl.textContent = 'Unbalanced!'; 
      balEl.className = 'tree-ls-balance tree-ls-unbalanced'; 
    }
  }

  // ── Canvas resize ──────────────────────────────────────────────────────
  function resizeCanvas() {
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    if (!camReady) resetCamera();
  }

  function resetCamera() {
    const W = canvas.clientWidth, H = canvas.clientHeight;
    cam.offsetX = W * 0.5; cam.offsetY = H * 0.35;
    cam.x = 0; cam.y = 0; cam.zoom = 1; camReady = true;
  }

  const onResize = () => { if (!destroyed) resizeCanvas(); };
  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(container);
  resizeCanvas();

  // ── Input helpers ──────────────────────────────────────────────────────
  const valInput = panel.querySelector('#tv-val-input');
  const randInput = panel.querySelector('#tv-rand-input');
  function getVal() { const v = parseInt(valInput.value, 10); return isNaN(v) ? 0 : Math.max(-9999, Math.min(9999, v)); }

  // ── Actions ────────────────────────────────────────────────────────────
  function getT() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return isLight ? THEMES.light : THEMES.night;
  }

  function doInsert() {
    const val = getVal(); tree.searchPath = [];
    const T = getT();
    const rotMsg = tree.insertNode(val);
    let m = `Inserted: ${val}`; if (rotMsg) m += `  (${rotMsg})`;
    const statusDetail = tree.isAVL ? (rotMsg || 'No rotation needed') : 'Standard BST insert';
    showPopup(m, rotMsg ? T.accent2 : T.success);
    setStatus(`Inserted ${val}`, statusDetail);
    setTraversal('', '');
  }
  function doDelete() {
    const val = getVal(); tree.searchPath = [];
    const T = getT();
    const rotMsg = tree.deleteNode(val);
    let m = `Deleted: ${val}`; if (rotMsg) m += `  (${rotMsg})`;
    const statusDetail = tree.isAVL ? (rotMsg || 'No rotation needed') : 'Standard BST delete';
    showPopup(m, T.danger);
    setStatus(`Deleted ${val}`, statusDetail);
    setTraversal('', '');
  }
  function doClear() {
    tree.clearTree(); tree.searchPath = [];
    const T = getT();
    setTraversal('', ''); setStatus('Tree cleared', 'Start fresh!');
    showPopup('Tree cleared!', T.danger, 2);
  }
  function doPred() {
    const T = getT();
    const val = getVal(), pv = tree.getPredecessor(val);
    const m = pv !== null ? `Pred(${val}) = ${pv}` : `No predecessor for ${val}`;
    showPopup(m, T.accent2); setStatus(m, 'Path shown in yellow');
  }
  function doSucc() {
    const T = getT();
    const val = getVal(), sv = tree.getSuccessor(val);
    const m = sv !== null ? `Succ(${val}) = ${sv}` : `No successor for ${val}`;
    showPopup(m, T.accent2); setStatus(m, 'Path shown in yellow');
  }
function doGenerate() {
    const T = getT();
    let count = parseInt(randInput.value, 10);
    if (isNaN(count) || count < 1) count = 1;
    if (count > 99) count = 99;
    tree.clearTree(); tree.searchPath = [];
    const used = new Set(); let ins = 0, att = 0;
    while (ins < count && att < count * 30) {
      const v = Math.floor(Math.random() * 199) - 99;
      if (!used.has(v)) { used.add(v); tree.insertNode(v); ins++; att++; }
    }
    showPopup(`Generated ${ins} random nodes!`, T.success);
    setStatus(`Random tree: ${ins} nodes`, 'Add / delete nodes freely!');
    setTraversal('', '');
  }

  let presetInProgress = false;
  async function runPreset(presetFn) {
    if (presetInProgress) return;
    presetInProgress = true;
    tree.clearTree();
    tree.searchPath = [];
    setTraversal('', '');
    const T = getT();
    try {
      await presetFn(T);
    } catch (e) {
      console.error('Preset error:', e);
    }
    presetInProgress = false;
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function doPresetLL(T) {
    tree.buildFromArray([30, 20, 40, 10]);
    showPopup('Building tree: [30, 20, 40, 10]', T.success, 2);
    setStatus('Preset: LL Imbalance', 'Tree built. Inserting 5...');
    await sleep(1400);
    tree.setSlowMode(true);
    tree.clearHighlight();
    tree.searchPath = tree.getInsertionPath(5);
    showPopup('Inserting 5... Path: 30 → 20 → 10', T.accent, 2.5);
    await sleep(1800);
    tree.insertNode(5);
    await sleep(800);
    const bf = tree.getBalanceFactor(30);
    tree.highlightNode(30, '#ff4b4b', 3);
    tree.searchPath = [];
    showPopup(`⚠️ Node 30 has Balance Factor = ${bf}`, '#ff4b4b', 3);
    setStatus('Balance Factor = ' + bf, 'Left-Left Imbalance detected!');
    await sleep(2800);
    tree.clearHighlight();
    tree.highlightNode(30, '#ffc832', 2.5);
    tree.highlightNode(20, '#ffc832', 2.5);
    showPopup('Performing RIGHT ROTATION on node 30', '#ffc832', 2.5);
    setStatus('Right Rotation', 'Node 30 rotates with child 20');
    await sleep(2500);
    tree.setSlowMode(false);
    showPopup('✓ LL Imbalance corrected!', T.success, 2.5);
    setStatus('Insertion complete', 'Tree is now balanced');
  }

  async function doPresetRR(T) {
    tree.buildFromArray([30, 20, 40, 50]);
    showPopup('Building tree: [30, 20, 40, 50]', T.success, 2);
    setStatus('Preset: RR Imbalance', 'Tree built. Inserting 60...');
    await sleep(1400);
    tree.setSlowMode(true);
    tree.clearHighlight();
    tree.searchPath = tree.getInsertionPath(60);
    showPopup('Inserting 60... Path: 30 → 40 → 50', T.accent, 2.5);
    await sleep(1800);
    tree.insertNode(60);
    await sleep(800);
    const bf = tree.getBalanceFactor(30);
    tree.highlightNode(30, '#ff4b4b', 3);
    tree.searchPath = [];
    showPopup(`⚠️ Node 30 has Balance Factor = ${bf}`, '#ff4b4b', 3);
    setStatus('Balance Factor = ' + bf, 'Right-Right Imbalance detected!');
    await sleep(2800);
    tree.clearHighlight();
    tree.highlightNode(30, '#ffc832', 2.5);
    tree.highlightNode(40, '#ffc832', 2.5);
    showPopup('Performing LEFT ROTATION on node 30', '#ffc832', 2.5);
    setStatus('Left Rotation', 'Node 30 rotates with child 40');
    await sleep(2500);
    tree.setSlowMode(false);
    showPopup('✓ RR Imbalance corrected!', T.success, 2.5);
    setStatus('Insertion complete', 'Tree is now balanced');
  }

  async function doPresetLR(T) {
    tree.buildFromArray([30, 20, 40, 10]);
    showPopup('Building tree: [30, 20, 40, 10]', T.success, 2);
    setStatus('Preset: LR Imbalance', 'Tree built. Inserting 25...');
    await sleep(1400);
    tree.setSlowMode(true);
    tree.clearHighlight();
    tree.searchPath = tree.getInsertionPath(25);
    showPopup('Inserting 25... Path: 30 → 20 → 10', T.accent, 2.5);
    await sleep(1800);
    tree.insertNode(25);
    await sleep(800);
    const bf = tree.getBalanceFactor(20);
    tree.highlightNode(20, '#ff4b4b', 3);
    tree.searchPath = [];
    showPopup(`⚠️ Node 20 has Balance Factor = ${bf}`, '#ff4b4b', 3);
    setStatus('Balance Factor = ' + bf, 'Left-Right Imbalance detected!');
    await sleep(2800);
    tree.clearHighlight();
    tree.highlightNode(20, '#ffc832', 2);
    tree.highlightNode(10, '#ffc832', 2);
    showPopup('Step 1: LEFT ROTATION on node 20', '#ffc832', 2);
    setStatus('LR: Step 1', 'Left rotation on 20');
    await sleep(2200);
    tree.highlightNode(30, '#ffc832', 2);
    tree.highlightNode(20, '#ffc832', 2);
    showPopup('Step 2: RIGHT ROTATION on node 30', '#ffc832', 2);
    setStatus('LR: Step 2', 'Right rotation on 30');
    await sleep(2200);
    tree.setSlowMode(false);
    showPopup('✓ LR Imbalance corrected!', T.success, 2.5);
    setStatus('Insertion complete', 'Tree is now balanced');
  }

  async function doPresetRL(T) {
    tree.buildFromArray([30, 20, 40, 50]);
    showPopup('Building tree: [30, 20, 40, 50]', T.success, 2);
    setStatus('Preset: RL Imbalance', 'Tree built. Inserting 35...');
    await sleep(1400);
    tree.setSlowMode(true);
    tree.clearHighlight();
    tree.searchPath = tree.getInsertionPath(35);
    showPopup('Inserting 35... Path: 30 → 40 → 50', T.accent, 2.5);
    await sleep(1800);
    tree.insertNode(35);
    await sleep(800);
    const bf = tree.getBalanceFactor(40);
    tree.highlightNode(40, '#ff4b4b', 3);
    tree.searchPath = [];
    showPopup(`⚠️ Node 40 has Balance Factor = ${bf}`, '#ff4b4b', 3);
    setStatus('Balance Factor = ' + bf, 'Right-Left Imbalance detected!');
    await sleep(2800);
    tree.clearHighlight();
    tree.highlightNode(40, '#ffc832', 2);
    tree.highlightNode(50, '#ffc832', 2);
    showPopup('Step 1: RIGHT ROTATION on node 40', '#ffc832', 2);
    setStatus('RL: Step 1', 'Right rotation on 40');
    await sleep(2200);
    tree.highlightNode(30, '#ffc832', 2);
    tree.highlightNode(40, '#ffc832', 2);
    showPopup('Step 2: LEFT ROTATION on node 30', '#ffc832', 2);
    setStatus('RL: Step 2', 'Left rotation on 30');
    await sleep(2200);
    tree.setSlowMode(false);
    showPopup('✓ RL Imbalance corrected!', T.success, 2.5);
    setStatus('Insertion complete', 'Tree is now balanced');
  }

  async function doPresetDelLeaf(T) {
    tree.buildFromArray([30, 20, 40, 10, 25]);
    showPopup('Building tree: [30, 20, 40, 10, 25]', T.success, 2);
    setStatus('Preset: Delete Leaf', 'Tree built. Deleting leaf node 10...');
    await sleep(1400);
    tree.setSlowMode(true);
    tree.clearHighlight();
    tree.searchPath = [30, 20, 10];
    tree.highlightNode(10, '#ff913c', 2.5);
    showPopup('Finding node 10... Path: 30 → 20 → 10', T.accent, 2.5);
    setStatus('Searching', 'Node 10 is a leaf (no children)');
    await sleep(2000);
    tree.clearHighlight();
    tree.highlightNode(10, '#ff4b4b', 2);
    showPopup('Deleting leaf node 10...', '#ff4b4b', 2);
    setStatus('Deleting', 'Simply remove from parent');
    await sleep(1800);
    tree.deleteNode(10);
    tree.searchPath = [];
    await sleep(800);
    tree.setSlowMode(false);
    showPopup('✓ Leaf node deleted!', T.success, 2.5);
    setStatus('Deletion complete', 'No rebalancing needed');
  }

  async function doPresetDel1Child(T) {
    tree.buildFromArray([30, 20, 40, 10, 25, 50, 5]);
    showPopup('Building tree: [30, 20, 40, 10, 25, 50, 5]', T.success, 2);
    setStatus('Preset: Delete Node with 1 Child', 'Tree built. Deleting node 20...');
    await sleep(1400);
    tree.setSlowMode(true);
    tree.clearHighlight();
    tree.searchPath = [30, 20];
    tree.highlightNode(20, '#ff913c', 2.5);
    showPopup('Finding node 20... Path: 30 → 20', T.accent, 2.5);
    setStatus('Searching', 'Node 20 has ONE child (25)');
    await sleep(2000);
    tree.clearHighlight();
    tree.highlightNode(20, '#ff4b4b', 1.5);
    tree.highlightNode(25, '#5aa0ff', 2);
    showPopup('Node 20 has 1 child (25). Promoting child...', '#ff4b4b', 2.5);
    setStatus('Promotion', 'Replace 20 with its child 25');
    await sleep(2000);
    tree.deleteNode(20);
    tree.searchPath = [];
    await sleep(800);
    tree.setSlowMode(false);
    showPopup('✓ Node deleted! (1 child promoted)', T.success, 2.5);
    setStatus('Deletion complete', 'No rebalancing needed');
  }

  async function doPresetDel2Children(T) {
    tree.buildFromArray([30, 20, 40, 10, 25, 35, 50]);
    showPopup('Building tree: [30, 20, 40, 10, 25, 35, 50]', T.success, 2);
    setStatus('Preset: Delete Node with 2 Children', 'Tree built. Deleting node 30...');
    await sleep(1400);
    tree.setSlowMode(true);
    tree.clearHighlight();
    tree.searchPath = [30];
    tree.highlightNode(30, '#ff913c', 2.5);
    showPopup('Finding node 30 (target)...', T.accent, 2);
    setStatus('Searching', 'Node 30 has TWO children');
    await sleep(1800);
    tree.clearHighlight();
    tree.highlightNode(30, '#ff4b4b', 1.5);
    tree.highlightNode(40, '#5aa0ff', 2);
    showPopup('Finding IN-ORDER SUCCESSOR (min of right subtree)', '#5aa0ff', 2.5);
    setStatus('Finding Successor', 'Successor is smallest value in right subtree');
    await sleep(2200);
    tree.highlightNode(35, '#ffc832', 2);
    showPopup('Successor found: 35 (min in right subtree)', '#ffc832', 2.5);
    setStatus('Successor = 35', 'Replace 30 with 35');
    await sleep(2000);
    tree.clearHighlight();
    tree.highlightNode(30, '#ff4b4b', 1.5);
    showPopup('Replacing 30 with 35, then deleting 35 from right', '#ff4b4b', 3);
    setStatus('Replace & Delete', 'Copy successor value, delete successor node');
    await sleep(2800);
    tree.deleteNode(30);
    tree.searchPath = [];
    await sleep(800);
    tree.setSlowMode(false);
    showPopup('✓ Node deleted! (2 children - successor method)', T.success, 2.5);
    setStatus('Deletion complete', 'No rebalancing needed');
  }

  async function doPresetDelRoot(T) {
    tree.buildFromArray([50, 30, 70, 20, 40, 60, 80]);
    showPopup('Building tree: [50, 30, 70, 20, 40, 60, 80]', T.success, 2);
    setStatus('Preset: Delete Root', 'Tree built. Deleting ROOT node 50...');
    await sleep(1400);
    tree.setSlowMode(true);
    tree.clearHighlight();
    tree.searchPath = [50];
    tree.highlightNode(50, '#ff4b4b', 2.5);
    showPopup('Target is ROOT node 50!', '#ff4b4b', 2);
    setStatus('Deleting Root', 'Root has 2 children');
    await sleep(2000);
    tree.clearHighlight();
    tree.highlightNode(50, '#ff913c', 1.5);
    tree.highlightNode(70, '#5aa0ff', 2);
    showPopup('Finding in-order successor (min of right subtree)', T.accent, 2.5);
    setStatus('Successor', 'Find successor from right subtree');
    await sleep(2200);
    tree.highlightNode(60, '#ffc832', 2);
    showPopup('Successor = 60', '#ffc832', 2);
    await sleep(1800);
    tree.clearHighlight();
    tree.highlightNode(50, '#ff4b4b', 1.5);
    showPopup('Replace root (50) with successor (60)', '#ff4b4b', 2.5);
    setStatus('Replace', 'Root value replaced with 60');
    await sleep(2200);
    tree.deleteNode(50);
    tree.searchPath = [];
    await sleep(800);
    tree.setSlowMode(false);
    showPopup('✓ Root node deleted! New root is 60', T.success, 2.5);
    setStatus('Deletion complete', 'Tree height reduced');
  }

  async function doPresetCascade(T) {
    tree.buildFromArray([50, 30, 70, 20, 40, 60, 80, 10]);
    showPopup('Building tree: [50, 30, 70, 20, 40, 60, 80, 10]', T.success, 2);
    setStatus('Advanced: Cascading', 'Inserting 5 to trigger cascade...');
    await sleep(1400);
    tree.setSlowMode(true);
    tree.clearHighlight();
    tree.searchPath = tree.getInsertionPath(5);
    showPopup('Inserting 5... Path: 50 → 30 → 20 → 10', T.accent, 2.5);
    await sleep(1800);
    tree.insertNode(5);
    await sleep(600);
    tree.clearHighlight();
    const bf20 = tree.getBalanceFactor(20);
    tree.highlightNode(20, '#ff4b4b', 2);
    showPopup(`Node 20: BF = ${bf20} (Left-Left)`, '#ff4b4b', 2.5);
    setStatus('First imbalance', 'Node 20 needs right rotation');
    await sleep(2200);
    tree.setSlowMode(true);
    tree.clearHighlight();
    tree.highlightNode(20, '#ffc832', 1.5);
    tree.highlightNode(10, '#ffc832', 1.5);
    showPopup('Rotating 20 with 10...', '#ffc832', 2);
    setStatus('Rotation 1', 'Right rotation at 20');
    await sleep(2000);
    const bf50 = tree.getBalanceFactor(50);
    tree.clearHighlight();
    tree.highlightNode(50, '#ff4b4b', 2.5);
    showPopup(`Node 50: BF = ${bf50} (cascading!)`, '#ff4b4b', 2.5);
    setStatus('Cascading up', 'Imbalance propagates to parent!');
    await sleep(2500);
    tree.clearHighlight();
    tree.highlightNode(50, '#ffc832', 1.5);
    tree.highlightNode(30, '#ffc832', 1.5);
    showPopup('Rotating 50 with 30...', '#ffc832', 2);
    setStatus('Rotation 2', 'Right rotation at 50');
    await sleep(2000);
    tree.setSlowMode(false);
    showPopup('✓ Cascading rotations complete!', T.success, 2.5);
    setStatus('Complete', 'Tree fully balanced after cascade');
  }

  // ── Event binding ──────────────────────────────────────────────────────
  valInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doInsert(); });
  panel.querySelector('#tv-btn-insert').addEventListener('click', doInsert);
  panel.querySelector('#tv-btn-delete').addEventListener('click', doDelete);
  panel.querySelector('#tv-btn-clear').addEventListener('click', doClear);
  panel.querySelector('#tv-btn-pred').addEventListener('click', doPred);
  panel.querySelector('#tv-btn-succ').addEventListener('click', doSucc);
  panel.querySelector('#tv-btn-gen').addEventListener('click', doGenerate);

  panel.querySelector('#tv-btn-preset-ll').addEventListener('click', () => runPreset(doPresetLL));
  panel.querySelector('#tv-btn-preset-rr').addEventListener('click', () => runPreset(doPresetRR));
  panel.querySelector('#tv-btn-preset-lr').addEventListener('click', () => runPreset(doPresetLR));
  panel.querySelector('#tv-btn-preset-rl').addEventListener('click', () => runPreset(doPresetRL));
  panel.querySelector('#tv-btn-preset-del-leaf').addEventListener('click', () => runPreset(doPresetDelLeaf));
  panel.querySelector('#tv-btn-preset-del-1child').addEventListener('click', () => runPreset(doPresetDel1Child));
  panel.querySelector('#tv-btn-preset-del-2child').addEventListener('click', () => runPreset(doPresetDel2Children));
  panel.querySelector('#tv-btn-preset-del-root').addEventListener('click', () => runPreset(doPresetDelRoot));
  panel.querySelector('#tv-btn-preset-cascade').addEventListener('click', () => runPreset(doPresetCascade));


  panel.querySelectorAll('.tv-trav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const trav = btn.dataset.trav; let title, result;
      switch (trav) {
        case 'pre':  title = 'Pre-Order:';     result = tree.getPreOrderString();     break;
        case 'in':   title = 'In-Order:';      result = tree.getInOrderString();      break;
        case 'post': title = 'Post-Order:';    result = tree.getPostOrderString();    break;
        case 'bfs':  title = 'Breadth-First:'; result = tree.getBreadthFirstString(); break;
      }
      setTraversal(title, result);
    });
  });

  panel.querySelectorAll('.tree-speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      speedIdx = parseInt(btn.dataset.speed, 10);
      panel.querySelectorAll('.tree-speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ── Canvas interactions ────────────────────────────────────────────────
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const wx = (mx - cam.offsetX) / cam.zoom + cam.x;
    const wy = (my - cam.offsetY) / cam.zoom + cam.y;
    const f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    cam.zoom = Math.max(0.08, Math.min(6, cam.zoom * f));
    cam.offsetX = mx - (wx - cam.x) * cam.zoom;
    cam.offsetY = my - (wy - cam.y) * cam.zoom;
  }, { passive: false });

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.button === 2) { isDragging = true; dragStartX = e.clientX; dragStartY = e.clientY; }
    if (e.button === 0) { const now = Date.now(); if (now - lastClickTime < 320) resetCamera(); lastClickTime = now; }
  });
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  const onMouseMove = (e) => {
    if (!isDragging) return;
    cam.offsetX += e.clientX - dragStartX; cam.offsetY += e.clientY - dragStartY;
    dragStartX = e.clientX; dragStartY = e.clientY;
  };
  const onMouseUp = () => { isDragging = false; };
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  // Touch
  let lastTouchDist = 0;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist = Math.hypot(dx, dy);
    }
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      cam.zoom = Math.max(0.08, Math.min(6, cam.zoom * (dist / (lastTouchDist || dist))));
      lastTouchDist = dist;
    }
  }, { passive: true });

  // ── Render loop ────────────────────────────────────────────────────────
  let lastTime = performance.now();
  let rafId = null;

  function loop(now) {
    if (destroyed) return;
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    tree.tickAnimations(dt, SPEED_TABLE[speedIdx]);
    tickPopup(dt);
    updateLiveStats();

    const W = canvas.clientWidth, H = canvas.clientHeight;
    const T = getT();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(cam.offsetX, cam.offsetY);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);
    drawTree(ctx, tree.root, 0, tree.searchPath, T);
    ctx.restore();

    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  // ── Destroy (cleanup for React useEffect) ──────────────────────────────
  function destroy() {
    destroyed = true;
    if (rafId) cancelAnimationFrame(rafId);
    resizeObserver.disconnect();
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    container.innerHTML = '';
  }

  return { tree, destroy, resetCamera };
}
