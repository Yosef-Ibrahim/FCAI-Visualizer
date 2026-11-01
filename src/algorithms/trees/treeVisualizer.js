// ═══════════════════════════════════════════════════════════════════════════════
//  Tree Visualizer — Canvas + Events + Render Loop
//  STRICTLY PORTED from native BST.js (lines 526-866)
//  Attaches imperatively to a DOM container — zero React dependencies
// ═══════════════════════════════════════════════════════════════════════════════

import { THEMES, SPEED_TABLE, AVLTree } from './AVLTree.js';
import { RedBlackTree } from './RedBlackTree.js';
import { BST } from './BST.js';

const hintIcon = (paths) => `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

/**
 * Initialize the tree visualizer inside a container element.
 * @param {HTMLElement} container - DOM element to mount into
 * @returns {{ tree: BST, destroy: () => void, resetCamera: () => void }}
 */
export function initTreeVisualizer(container, type = 'avl') {
  const isBST = type === 'bst';
  const isAVL = type === 'avl';
  const isRBT = type === 'rbt';
  const titleName = isBST ? 'Binary Search Tree' : isAVL ? 'AVL Tree' : 'Red‑Black Tree';
  const readyMsg = isBST ? 'BST Ready' : isAVL ? 'AVL Tree Ready' : 'Red‑Black Tree Ready';



  const propsTitle = isRBT
    ? 'RED-BLACK TREE PROPERTIES'
    : isAVL
      ? 'AVL TREE PROPERTIES'
      : 'BINARY SEARCH TREE PROPERTIES';

  const propsStatus = isRBT
    ? 'The properties will be checked after an operation.'
    : isAVL
      ? 'The balance factor will be checked after an operation.'
      : 'The ordering property will be checked after an operation.';

  const propsItems = isRBT
    ? `
        <li data-property="1">Every node is red or black.</li>
        <li data-property="2">The root is black.</li>
        <li data-property="3">Every NIL leaf is black (NIL leaves are implicit).</li>
        <li data-property="4">A red node cannot have a red child.</li>
        <li data-property="5">Every path to descendant NIL leaves has equal black height.</li>
      `
    : isAVL
      ? `
        <li data-property="1">Balance factor of every node is in {-1, 0, +1}.</li>
        <li data-property="2">Left subtree is balanced (|bf| &le; 1).</li>
        <li data-property="3">Right subtree is balanced (|bf| &le; 1).</li>
        <li data-property="4">Binary search tree ordering is preserved.</li>
      `
      : `
        <li data-property="1">Keys in left subtree are strictly less than node.</li>
        <li data-property="2">Keys in right subtree are strictly greater than node.</li>
        <li data-property="3">Both left and right subtrees are valid BSTs.</li>
        <li data-property="4">All keys in the tree are strictly unique.</li>
      `;

  // ── Build DOM ──────────────────────────────────────────────────────────
  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.height = '100%';

  // Side panel
  const panel = document.createElement('aside');
  panel.className = 'tree-panel';
  if (isRBT) panel.classList.add('tree-panel-rbt');
  panel.innerHTML = `
    <div class="tree-panel-title">
      <span class="tree-title-main">${titleName}</span>
      <span class="tree-title-sub">Visualizer</span>
      <span class="tree-title-edition">Educational Edition</span>
    </div>
    <hr class="tree-divider"/>
    <section class="tree-section">
      <div class="tree-section-label">NODE VALUE</div>
      <div class="tree-input-row"><input class="tree-val-input" id="tv-val-input" type="text" autocomplete="off" spellcheck="false"/></div>
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
        <button class="tree-btn tree-btn-succ sm" id="tv-btn-succ">Successor</button>
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
    <section class="tree-section rbt-learning-panel" aria-live="polite">
      <div class="tree-section-label">ALGORITHM STEPS</div>
      <div class="rbt-step-count" id="tv-rbt-step-count">No operation yet</div>
      <h3 class="rbt-step-title" id="tv-rbt-step-title">Ready to explore</h3>
      <p class="rbt-step-explanation" id="tv-rbt-step-explanation">Insert or delete a value to see the real ${titleName} algorithm, one step at a time.</p>
      <div class="rbt-step-involved" id="tv-rbt-step-involved"></div>
      <div class="rbt-lock-message" id="tv-rbt-lock-message" hidden>Finish or replay the current history before starting another operation.</div>
      <div class="rbt-playback-controls">
        <button class="tree-btn tree-btn-ghost sm" id="tv-rbt-previous" type="button" disabled aria-label="Previous algorithm step">Previous</button>
        <button class="tree-btn tree-btn-accent sm" id="tv-rbt-play" type="button" disabled>Play</button>
        <button class="tree-btn tree-btn-ghost sm" id="tv-rbt-pause" type="button" disabled>Pause</button>
        <button class="tree-btn tree-btn-ghost sm" id="tv-rbt-next" type="button" disabled aria-label="Next algorithm step">Next</button>
        <button class="tree-btn tree-btn-ghost sm" id="tv-rbt-restart" type="button" disabled>Restart</button>
      </div>
      <div class="rbt-properties-title">${propsTitle}</div>
      <div class="rbt-property-status" id="tv-rbt-property-status">${propsStatus}</div>
      <ol class="rbt-properties-list">
        ${propsItems}
      </ol>
    </section>
    <hr class="tree-divider"/>
    <section class="tree-section tree-preset-section">
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
    <div class="tree-hints" aria-label="Canvas instructions">
      <span class="tree-hint"><span class="tree-hint-icon">${hintIcon('<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><path d="M11 8v6"/><path d="M8 11h6"/>')}</span><span>Scroll to zoom</span></span>
      <span class="tree-hint"><span class="tree-hint-icon">${hintIcon('<path d="m5 3 14 9-7 1-3 7z"/>')}</span><span>Right-click + drag to pan</span></span>
      <span class="tree-hint"><span class="tree-hint-icon">${hintIcon('<path d="M3 7v6h6"/><path d="M3.5 13a9 9 0 1 0 2.1-6.5L3 9"/>')}</span><span>Double-click to reset view</span></span>
      <span class="tree-hint"><span class="tree-hint-icon">${hintIcon('<path d="m9 10-5 5 5 5"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>')}</span><span><kbd>Enter</kbd> to insert</span></span>
    </div>
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
  let tree;
  if (isBST) {
    tree = new BST();
    tree.isAVL = false;
  } else if (isAVL) {
    tree = new AVLTree();
    tree.isAVL = true;
  } else if (isRBT) {
    tree = new RedBlackTree();
    tree.isAVL = false;
  }
  let speedIdx = 0;
  let destroyed = false;
  let rbtHistory = [];
  let rbtHistoryIndex = -1;
  let rbtProgress = 1;
  let rbtPlaying = false;
  let rbtTransitioning = false;
  let rbtDirection = 1;
  let rbtBusy = false;
  let rbtPlayElapsed = 0;

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
    updateLiveStats();
    drawTreeFrame();
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

  function updateRbtControls() {
    const hasHistory = rbtHistory.length > 0;
    const atEnd = rbtHistoryIndex >= rbtHistory.length - 1;
    panel.querySelector('#tv-rbt-previous').disabled = !hasHistory || rbtHistoryIndex <= 0;
    panel.querySelector('#tv-rbt-play').disabled = !hasHistory || rbtPlaying || rbtHistory.length < 2;
    panel.querySelector('#tv-rbt-pause').disabled = !hasHistory || !rbtPlaying;
    panel.querySelector('#tv-rbt-next').disabled = !hasHistory || atEnd;
    panel.querySelector('#tv-rbt-restart').disabled = !hasHistory;
    panel.querySelector('#tv-rbt-play').textContent = atEnd ? 'Replay' : 'Play';
  }

  function updateRbtLesson() {
    const event = rbtHistory[rbtHistoryIndex];
    const count = panel.querySelector('#tv-rbt-step-count');
    const title = panel.querySelector('#tv-rbt-step-title');
    const explanation = panel.querySelector('#tv-rbt-step-explanation');
    const involved = panel.querySelector('#tv-rbt-step-involved');
    const properties = panel.querySelectorAll('.rbt-properties-list li');
    if (!event) {
      count.textContent = 'No operation yet';
      title.textContent = 'Ready to explore';
      explanation.textContent = `Insert or delete a value to see the real ${titleName} algorithm, one step at a time.`;
      involved.textContent = '';
      panel.querySelector('#tv-rbt-property-status').textContent = propsStatus;
      properties.forEach((item) => item.classList.remove('is-current', 'is-satisfied'));
      updateRbtControls();
      return;
    }
    count.textContent = `Step ${rbtHistoryIndex + 1} of ${rbtHistory.length}`;
    title.textContent = event.operation;
    explanation.textContent = event.explanation;
    const roles = Object.entries(event.roles || {})
      .filter(([, value]) => value !== null && value !== undefined)
      .map(([role, value]) => `${role}: ${value}`);
    involved.textContent = roles.length ? `Nodes involved — ${roles.join(' · ')}` : '';
    const propertyStatus = panel.querySelector('#tv-rbt-property-status');
    if (isRBT) {
      propertyStatus.textContent = event.property === 'all'
        ? 'All five properties are satisfied.'
        : typeof event.property === 'number'
          ? `Property ${event.property} is being repaired.`
          : 'No Red-Black property violation is flagged at this step.';
    } else if (isAVL) {
      propertyStatus.textContent = event.property === 'all'
        ? 'All balance factors are satisfied.'
        : typeof event.property === 'number'
          ? `Imbalance detected (rule ${event.property}).`
          : 'Checking balance factors...';
    } else {
      propertyStatus.textContent = event.property === 'all'
        ? 'Binary Search Tree ordering is satisfied.'
        : 'Maintaining binary search tree ordering...';
    }
    properties.forEach((item) => {
      const property = Number(item.dataset.property);
      item.classList.toggle('is-current', event.property === property);
      item.classList.toggle('is-satisfied', event.property === 'all');
    });
    updateRbtControls();
  }

  function setRbtBusy(busy) {
    rbtBusy = busy;
    panel.querySelector('#tv-rbt-lock-message').hidden = !busy;
    panel.querySelector('#tv-val-input').disabled = busy;
    panel.querySelectorAll('#tv-btn-insert, #tv-btn-delete, #tv-btn-clear, #tv-btn-gen, #tv-btn-pred, #tv-btn-succ, .tv-trav-btn')
      .forEach((button) => { button.disabled = busy; });
  }

  function startRbtOperation(action, value) {
    if (rbtBusy) return;
    const history = [];
    if (action === 'insert') tree.insert(value, (event) => history.push(event));
    else tree.delete(value, (event) => history.push(event));
    rbtHistory = history;
    rbtHistoryIndex = history.length ? 0 : -1;
    rbtProgress = 1;
    rbtDirection = 1;
    rbtTransitioning = false;
    rbtPlayElapsed = 0;
    rbtPlaying = history.length > 1;
    setRbtBusy(history.length > 1);
    updateRbtLesson();
    const detail = `${history.length} real algorithm steps recorded`;
    setStatus(`${action === 'insert' ? 'Insert' : 'Delete'} ${value}`, detail);
    setTraversal('', '');
  }

  function advanceRbtStep() {
    if (rbtHistoryIndex >= rbtHistory.length - 1) return;
    rbtHistoryIndex++;
    rbtDirection = 1;
    rbtProgress = 0;
    rbtPlayElapsed = 0;
    updateRbtLesson();
  }

  function tickRbtPlayback(dt) {
    const duration = [1.45, 0.8, 0.34][speedIdx];
    if (rbtProgress < 1 && (rbtPlaying || rbtTransitioning)) {
      rbtProgress = Math.min(1, rbtProgress + dt / duration);
      if (rbtProgress >= 1 && rbtTransitioning) {
        rbtTransitioning = false;
        if (!rbtPlaying && rbtHistoryIndex >= rbtHistory.length - 1) setRbtBusy(false);
      }
      return;
    }
    if (!rbtPlaying) return;
    rbtPlayElapsed += dt;
    if (rbtPlayElapsed < duration) return;
    if (rbtHistoryIndex < rbtHistory.length - 1) {
      advanceRbtStep();
    } else {
      rbtPlaying = false;
      rbtTransitioning = false;
      setRbtBusy(false);
      updateRbtControls();
    }
  }

  function updateLiveStats() {
    let nc = tree.getNodeCount(), ht = tree.getTreeHeight();
    if (rbtHistoryIndex >= 0 && rbtHistory[rbtHistoryIndex]) {
      const measure = (node) => {
        if (!node) return { count: 0, height: -1 };
        const left = measure(node.left);
        const right = measure(node.right);
        return { count: left.count + right.count + 1, height: Math.max(left.height, right.height) + 1 };
      };
      const visible = measure(rbtHistory[rbtHistoryIndex].snapshot);
      nc = visible.count;
      ht = visible.height;
    }
    const bal = nc <= 1 || ht <= Math.ceil(1.45 * Math.log2(nc + 1) + 1.6);
    canvasWrap.querySelector('#tv-ls-nodes').textContent = `Nodes: ${nc}`;
    canvasWrap.querySelector('#tv-ls-height').textContent = `Height: ${ht}`;
    const balEl = canvasWrap.querySelector('#tv-ls-balance');
    if (tree.isRedBlack) {
      balEl.textContent = 'Red-Black rules';
      balEl.className = 'tree-ls-balance tree-ls-balanced';
    } else if (!tree.isAVL) {
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
  function getVal() {
    const raw = valInput.value.trim();
    if (raw === '') return null;
    const value = Number(raw);
    if (!Number.isFinite(value)) return null;
    return Math.max(-9999, Math.min(9999, value));
  }

  // ── Actions ────────────────────────────────────────────────────────────
  function getT() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return isLight ? THEMES.light : THEMES.night;
  }

  function doInsert() {
    const val = getVal();
    if (val === null) {
      setStatus('Enter a valid number', 'The value cannot be empty.');
      valInput.focus();
      return;
    }
    if (rbtBusy) return;
    tree.searchPath = [];
    startRbtOperation('insert', val);
    valInput.value = '';
    valInput.focus();
  }

  function doDelete() {
    const val = getVal();
    if (val === null) {
      setStatus('Enter a valid number', 'The value cannot be empty.');
      valInput.focus();
      return;
    }
    tree.searchPath = [];
    startRbtOperation('delete', val);
  }

  function doClear() {
    if (rbtBusy) return;
    tree.clearTree();
    tree.searchPath = [];
    rbtHistory = [];
    rbtHistoryIndex = -1;
    rbtPlaying = false;
    rbtTransitioning = false;
    rbtDirection = 1;
    rbtProgress = 1;
    setRbtBusy(false);
    updateRbtLesson();
    updateRbtControls();
    const T = getT();
    setTraversal('', '');
    setStatus('Tree cleared', 'Start fresh!');
    showPopup('Tree cleared!', T.danger, 2);
  }

  function doPred() {
    const T = getT();
    const val = getVal();
    const pv = tree.getPredecessor(val);
    tree.searchPath = pv !== null ? [val, pv] : [val];
    const m = pv !== null ? `Pred(${val}) = ${pv}` : `No predecessor for ${val}`;
    showPopup(m, T.accent2);
    setStatus(m, 'Node highlighted');
  }

  function doSucc() {
    const T = getT();
    const val = getVal();
    const sv = tree.getSuccessor(val);
    tree.searchPath = sv !== null ? [val, sv] : [val];
    const m = sv !== null ? `Succ(${val}) = ${sv}` : `No successor for ${val}`;
    showPopup(m, T.accent2);
    setStatus(m, 'Node highlighted');
  }

  function doGenerate() {
    if (rbtBusy) return;
    const T = getT();
    let count = parseInt(randInput.value, 10);
    if (isNaN(count) || count < 1) count = 1;
    if (count > 99) count = 99;
    tree.clearTree();
    tree.searchPath = [];
    const used = new Set();
    let ins = 0, att = 0;
    const generated = [];
    while (ins < count && att < count * 30) {
      const v = Math.floor(Math.random() * 199) - 99;
      if (!used.has(v)) {
        used.add(v);
        generated.push(v);
        ins++;
      }
      att++;
    }
    const history = [];
    generated.forEach((value) => tree.insert(value, (event) => history.push(event)));
    rbtHistory = history;
    rbtHistoryIndex = history.length ? 0 : -1;
    rbtProgress = 1;
    rbtPlayElapsed = 0;
    rbtDirection = 1;
    rbtTransitioning = false;
    rbtPlaying = history.length > 1;
    setRbtBusy(history.length > 1);
    updateRbtLesson();
    showPopup(`Generated ${ins} random nodes!`, T.success);
    setStatus(`Random tree: ${ins} nodes`, 'Add / delete nodes freely!');
    setTraversal('', '');
  }

  function runPresetOperation(buildValues, opAction, opValue) {
    if (rbtBusy) return;
    tree.clearTree();
    tree.searchPath = [];
    setTraversal('', '');
    buildValues.forEach((v) => tree.insert(v));
    startRbtOperation(opAction, opValue);
  }

  function doPresetLL() {
    runPresetOperation([30, 20, 40, 10], 'insert', 5);
  }

  function doPresetRR() {
    runPresetOperation([30, 20, 40, 50], 'insert', 60);
  }

  function doPresetLR() {
    runPresetOperation([30, 20, 40, 10], 'insert', 25);
  }

  function doPresetRL() {
    runPresetOperation([30, 20, 40, 50], 'insert', 35);
  }

  function doPresetDelLeaf() {
    runPresetOperation([30, 20, 40, 10, 25], 'delete', 10);
  }

  function doPresetDel1Child() {
    runPresetOperation([30, 20, 40, 10, 25, 50, 5], 'delete', 20);
  }

  function doPresetDel2Children() {
    runPresetOperation([30, 20, 40, 10, 25, 35, 50], 'delete', 30);
  }

  function doPresetDelRoot() {
    runPresetOperation([50, 30, 70, 20, 40, 60, 80], 'delete', 50);
  }

  function doPresetCascade() {
    runPresetOperation([50, 25, 75, 10, 30, 60, 85, 5, 15, 28, 35, 80, 90, 88, 95], 'delete', 10);
  }

  // ── Event binding ──────────────────────────────────────────────────────
  valInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doInsert(); });
  panel.querySelector('#tv-btn-insert').addEventListener('click', doInsert);
  panel.querySelector('#tv-btn-delete').addEventListener('click', doDelete);
  panel.querySelector('#tv-btn-clear').addEventListener('click', doClear);
  panel.querySelector('#tv-btn-pred').addEventListener('click', doPred);
  panel.querySelector('#tv-btn-succ').addEventListener('click', doSucc);
  panel.querySelector('#tv-btn-gen').addEventListener('click', doGenerate);

  panel.querySelector('#tv-btn-preset-ll').addEventListener('click', doPresetLL);
  panel.querySelector('#tv-btn-preset-rr').addEventListener('click', doPresetRR);
  panel.querySelector('#tv-btn-preset-lr').addEventListener('click', doPresetLR);
  panel.querySelector('#tv-btn-preset-rl').addEventListener('click', doPresetRL);
  panel.querySelector('#tv-btn-preset-del-leaf').addEventListener('click', doPresetDelLeaf);
  panel.querySelector('#tv-btn-preset-del-1child').addEventListener('click', doPresetDel1Child);
  panel.querySelector('#tv-btn-preset-del-2child').addEventListener('click', doPresetDel2Children);
  panel.querySelector('#tv-btn-preset-del-root').addEventListener('click', doPresetDelRoot);
  panel.querySelector('#tv-btn-preset-cascade').addEventListener('click', doPresetCascade);


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

  panel.querySelector('#tv-rbt-previous').addEventListener('click', () => {
    rbtPlaying = false;
    rbtTransitioning = true;
    rbtDirection = -1;
    if (rbtHistoryIndex > 0) {
      rbtHistoryIndex--;
      rbtProgress = 0;
      rbtPlayElapsed = 0;
      setRbtBusy(true);
      updateRbtLesson();
    } else rbtTransitioning = false;
  });
  panel.querySelector('#tv-rbt-next').addEventListener('click', () => {
    rbtPlaying = false;
    advanceRbtStep();
    rbtTransitioning = rbtHistoryIndex >= 0 && rbtProgress < 1;
    setRbtBusy(rbtTransitioning || rbtHistoryIndex < rbtHistory.length - 1);
    updateRbtLesson();
  });
  panel.querySelector('#tv-rbt-play').addEventListener('click', () => {
    if (rbtHistory.length < 2) return;
    if (rbtHistoryIndex >= rbtHistory.length - 1) {
      rbtHistoryIndex = 0;
      rbtProgress = 1;
      rbtPlayElapsed = 0;
      updateRbtLesson();
    }
    rbtDirection = 1;
    rbtTransitioning = false;
    setRbtBusy(true);
    rbtPlaying = true;
    updateRbtControls();
  });
  panel.querySelector('#tv-rbt-pause').addEventListener('click', () => {
    rbtPlaying = false;
    rbtTransitioning = false;
    updateRbtControls();
  });
  panel.querySelector('#tv-rbt-restart').addEventListener('click', () => {
    rbtPlaying = false;
    rbtTransitioning = false;
    rbtDirection = 1;
    rbtHistoryIndex = 0;
    rbtProgress = 1;
    rbtPlayElapsed = 0;
    setRbtBusy(rbtHistory.length > 1);
    updateRbtLesson();
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

  function layoutRbtSnapshot(snapshot, width, height) {
    const nodes = [];
    const edges = [];
    let maxDepth = 0;
    const visit = (node, depth, parentValue = null) => {
      if (!node) return;
      maxDepth = Math.max(maxDepth, depth);
      visit(node.left, depth + 1, node.value);
      nodes.push({ ...node, depth, parentValue });
      visit(node.right, depth + 1, node.value);
    };
    visit(snapshot, 0);
    const spacing = nodes.length > 1
      ? Math.min(90, Math.max(34, (width - 80) / (nodes.length - 1)))
      : 84;
    const levelGap = maxDepth > 0
      ? Math.max(48, Math.min(78, (height - 110) / maxDepth))
      : 78;
    nodes.forEach((node, index) => {
      node.x = (index - (nodes.length - 1) / 2) * spacing;
      node.y = node.depth * levelGap;
      if (node.parentValue !== null) edges.push({ parentValue: node.parentValue, value: node.value });
    });
    return {
      nodes: new Map(nodes.map((node) => [node.value, node])),
      edges,
      radius: Math.max(13, Math.min(20, spacing * 0.27)),
    };
  }

  function mixHex(from, to, progress) {
    const a = from.match(/[0-9a-f]{2}/gi) || ['00', '00', '00'];
    const b = to.match(/[0-9a-f]{2}/gi) || ['00', '00', '00'];
    return `#${a.map((part, index) => {
      const start = parseInt(part, 16);
      const end = parseInt(b[index], 16);
      return Math.round(start + (end - start) * progress).toString(16).padStart(2, '0');
    }).join('')}`;
  }

  function drawRbtSnapshot(snapshot, previousSnapshot, progress, event, theme, width, height) {
    if (!snapshot && !previousSnapshot) return;
    const eased = progress * progress * (3 - 2 * progress);
    const before = layoutRbtSnapshot(previousSnapshot, width, height);
    const after = layoutRbtSnapshot(snapshot, width, height);
    const nodeRadius = Math.min(before.radius, after.radius);
    const pointFor = (value, oldNode, newNode) => {
      if (oldNode && newNode) {
        return {
          x: oldNode.x + (newNode.x - oldNode.x) * eased,
          y: oldNode.y + (newNode.y - oldNode.y) * eased,
        };
      }
      if (newNode) {
        const oldParent = before.nodes.get(newNode.parentValue);
        const start = oldParent || { x: newNode.x, y: newNode.y - 42 };
        return { x: start.x + (newNode.x - start.x) * eased, y: start.y + (newNode.y - start.y) * eased };
      }
      const newParent = after.nodes.get(oldNode.parentValue);
      const end = newParent || { x: oldNode.x, y: oldNode.y - 36 };
      return { x: oldNode.x + (end.x - oldNode.x) * eased, y: oldNode.y + (end.y - oldNode.y) * eased };
    };
    const point = (value) => pointFor(value, before.nodes.get(value), after.nodes.get(value));

    const drawEdges = (layout, alpha) => {
      if (alpha <= 0) return;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = theme.edgeCol || theme.nodeStroke;
      ctx.lineWidth = 2.5;
      layout.edges.forEach(({ parentValue, value }) => {
        const from = point(parentValue);
        const to = point(value);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y + nodeRadius);
        ctx.lineTo(to.x, to.y - nodeRadius);
        ctx.stroke();
      });
    };
    drawEdges(before, 1 - eased);
    drawEdges(after, eased);

    const roleColors = {
      current: '#ffd166',
      target: '#ff6b6b',
      parent: '#62b6ff',
      grandparent: '#b794f4',
      uncle: '#ff9f43',
      sibling: '#45d6c5',
      successor: '#f472b6',
      nearChild: '#fb7185',
      farChild: '#4ade80',
    };
    const roles = event ? event.roles : {};
    const roleByValue = new Map();
    Object.entries(roles || {}).forEach(([role, value]) => {
      if (value !== null && value !== undefined && roleColors[role] && !roleByValue.has(value)) {
        roleByValue.set(value, role);
      }
    });
    const searchPathSet = new Set(tree.searchPath || []);
    const values = new Set([...before.nodes.keys(), ...after.nodes.keys()]);
    values.forEach((value) => {
      const oldNode = before.nodes.get(value);
      const newNode = after.nodes.get(value);
      const position = point(value);
      const alpha = oldNode && newNode ? 1 : oldNode ? 1 - eased : eased;
      if (alpha <= 0) return;
      const getNodeFill = (node) => {
        if (!node) return null;
        if (node.color === 'red') return '#d94f59';
        if (node.color === 'black') return '#202532';
        return theme.nodeFill || '#1769aa';
      };
      const oldFill = getNodeFill(oldNode);
      const newFill = getNodeFill(newNode);
      const fill = oldFill && newFill ? mixHex(oldFill, newFill, eased) : newFill || oldFill;
      const role = roleByValue.get(value);
      const isSearchHit = !role && searchPathSet.has(value);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = fill;
      ctx.strokeStyle = role ? roleColors[role] : isSearchHit ? (theme.accent2 || '#ecc365') : theme.nodeStroke;
      ctx.lineWidth = role || isSearchHit ? 4 : 2;
      ctx.beginPath();
      ctx.arc(position.x, position.y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      const isColoredNode = (newNode && (newNode.color === 'red' || newNode.color === 'black')) ||
                            (oldNode && (oldNode.color === 'red' || oldNode.color === 'black'));
      ctx.fillStyle = isColoredNode ? '#ffffff' : (theme.nodeText || '#ffffff');
      ctx.font = '700 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(value), position.x, position.y);
      if (role) {
        ctx.font = '600 9px Inter, sans-serif';
        ctx.fillStyle = roleColors[role];
        ctx.fillText(role === 'grandparent' ? 'grandparent' : role, position.x, position.y - nodeRadius - 8);
      }
    });
    ctx.globalAlpha = 1;
  }

  function drawTreeFrame() {
    const W = canvas.clientWidth, H = canvas.clientHeight;
    const T = getT();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = T.bg; ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(cam.offsetX, cam.offsetY);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);
    const event = rbtHistory[rbtHistoryIndex];
    const snapshot = event ? event.snapshot : tree._snapshotTree();
    const transitionFromIndex = rbtHistoryIndex - rbtDirection;
    const previous = rbtProgress < 1 && transitionFromIndex >= 0 && transitionFromIndex < rbtHistory.length
      ? rbtHistory[transitionFromIndex].snapshot
      : snapshot;
    drawRbtSnapshot(snapshot, previous, rbtProgress, event, T, W, H);
    ctx.restore();
  }

  function loop(now) {
    if (destroyed) return;
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    tree.tickAnimations(dt, SPEED_TABLE[speedIdx]);
    tickRbtPlayback(dt);
    tickPopup(dt);
    updateLiveStats();
    drawTreeFrame();

    rafId = requestAnimationFrame(loop);
  }
  updateLiveStats();
  drawTreeFrame();
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
