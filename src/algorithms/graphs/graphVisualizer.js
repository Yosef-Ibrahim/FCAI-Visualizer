// ═══════════════════════════════════════════════════════════════════════════════
//  BFS Graph Visualizer — Canvas + Events + Render Loop
//  Matches Tree Visualizer patterns exactly
// ═══════════════════════════════════════════════════════════════════════════════

import { THEMES, SPEED_TABLE, colA } from '../trees/avlTree.js';
import { codeSnippets } from '../../data/algorithmData.js';

const NODE_R = 22;
const NODE_COLORS = ['#5aa0ff', '#37be73', '#ff913c', '#b450f0', '#f54b82', '#2dc3c8'];

export function initGraphVisualizer(container) {
  container.innerHTML = '';
  container.style.display = 'flex';
  container.style.height = '100%';

  // Side panel
  const panel = document.createElement('aside');
  panel.className = 'tree-panel';
  panel.innerHTML = `
    <div class="tree-panel-title">
      <span class="tree-title-main">BFS Graph</span>
      <span class="tree-title-sub">Visualizer</span>
      <span class="tree-title-edition">Educational Edition</span>
    </div>
    <hr class="tree-divider"/>
    <section class="tree-section">
      <div class="tree-section-label">GRAPH SETUP</div>
      <div class="tree-gen-row">
        <label>Nodes:</label>
        <input class="tree-rand-input" id="gv-node-count" type="number" min="3" max="20" value="6"/>
        <button class="tree-btn tree-btn-green sm" id="gv-btn-create">Create</button>
      </div>
      <div class="tree-tip">Then click nodes to add edges (source → target)</div>
    </section>
    <hr class="tree-divider"/>
    <section class="tree-section">
      <div class="tree-section-label">EDGE MODE</div>
      <div class="tree-speed-row">
        <button class="tree-speed-btn active" data-dir="undirected">Undirected</button>
        <button class="tree-speed-btn" data-dir="directed">Directed</button>
      </div>
    </section>
    <hr class="tree-divider"/>
    <section class="tree-section">
      <div class="tree-section-label">BFS TRAVERSAL</div>
      <div class="tree-gen-row">
        <label>Start:</label>
        <input class="tree-rand-input" id="gv-start-node" type="number" min="0" value="0" style="width:50px"/>
        <button class="tree-btn tree-btn-accent sm" id="gv-btn-start-bfs">▶ Run BFS</button>
      </div>
      <div id="gv-queue-display" style="margin-top:8px;font-size:12px;color:var(--text-muted);min-height:20px"></div>
      <div id="gv-path-display" style="margin-top:4px;font-size:12px;color:var(--accent);min-height:20px"></div>
    </section>
    <hr class="tree-divider"/>
    <section class="tree-section">
      <div class="tree-section-label">DRAG MODE</div>
      <div class="tree-speed-row">
        <button class="tree-speed-btn active" data-drag="edges">Move with Edges</button>
        <button class="tree-speed-btn" data-drag="node">Move Node Only</button>
      </div>
    </section>
    <hr class="tree-divider"/>
    <section class="tree-section">
      <div class="tree-section-label">CODE TRACE</div>
      <div class="tree-gen-row">
        <label style="flex:1;font-size:13px;color:var(--text)">Show Code Panel</label>
        <label class="tree-toggle" style="position:relative;display:inline-block;width:34px;height:20px;">
          <input type="checkbox" id="gv-trace-toggle" checked style="opacity:0;width:0;height:0;" />
          <span class="tree-toggle-slider" style="position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:var(--border);transition:.4s;border-radius:20px;"></span>
        </label>
      </div>
    </section>
    <hr class="tree-divider"/>
    <section class="tree-section">
      <div class="tree-section-label">EXPORT / PRINT</div>
      <button class="tree-btn tree-btn-ghost sm" id="gv-btn-adj-list">Print Adjacency List</button>
      <button class="tree-btn tree-btn-ghost sm" id="gv-btn-adj-matrix">Print Adjacency Matrix</button>
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
    <button class="tree-btn tree-btn-danger-dim sm" id="gv-btn-reset" style="margin:8px 18px">Reset Graph</button>
    <button class="tree-btn tree-btn-danger sm" id="gv-btn-clear" style="margin:8px 18px">Clear Graph</button>
    <div class="tree-status-bar">
      <div class="tree-status-title">STATUS</div>
      <div class="tree-stat-line1" id="gv-stat1">Graph Ready</div>
      <div class="tree-stat-line2" id="gv-stat2">Create graph, then add edges</div>
    </div>
  `;

  // Canvas area
  const canvasWrap = document.createElement('main');
  canvasWrap.className = 'tree-canvas-wrap';
  canvasWrap.innerHTML = `
    <canvas class="tree-canvas" id="gv-canvas" role="img" aria-label="Graph Visualization Canvas"></canvas>
    <div aria-live="polite" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;" id="gv-aria-live"></div>
    <div class="tree-live-stats">
      <div class="tree-ls-label">LIVE STATS</div>
      <div class="tree-ls-nodes" id="gv-ls-nodes">Nodes: 0</div>
      <div class="tree-ls-edges" id="gv-ls-edges">Edges: 0</div>
      <div class="tree-ls-bfs" id="gv-ls-bfs">BFS: Not Started</div>
    </div>
    <div class="tree-hints">Click nodes to add edges &nbsp;|&nbsp; Drag to move &nbsp;|&nbsp; Scroll: Zoom &nbsp;|&nbsp; Right-click+Drag: Pan</div>
    <div class="tree-popup" id="gv-popup" style="display:none">
      <span class="tree-popup-msg" id="gv-popup-msg"></span>
      <div class="tree-popup-progress" id="gv-popup-progress"></div>
    </div>
    <div class="tree-popup" id="gv-export-popup" style="display:none;top:80px;max-width:400px;max-height:300px;overflow:auto">
      <span class="tree-popup-msg" id="gv-export-msg"></span>
    </div>
    <div class="tree-code-panel" id="gv-code-panel">
      <div class="tree-code-header">
        <span class="tree-code-title">⟨/⟩ Code Trace</span>
        <div style="display:flex;align-items:center;gap:8px;">
          <div class="tree-code-lang-bar" id="gv-code-lang-bar">
            <button class="tree-code-lang-btn active" data-lang="js">JS</button>
            <button class="tree-code-lang-btn" data-lang="python">Python</button>
            <button class="tree-code-lang-btn" data-lang="cpp">C++</button>
          </div>
          <button class="tree-code-close-btn" id="gv-code-close" title="Close">✕</button>
        </div>
      </div>
      <div class="tree-code-progress-wrap"><div class="tree-code-progress-bar" id="gv-code-progress"></div></div>
      <div class="tree-code-step-msg" id="gv-code-step-msg">Perform an operation to see code trace</div>
      <pre class="tree-code-pre"><code id="gv-code-lines"></code></pre>
    </div>
  `;

  container.appendChild(panel);
  container.appendChild(canvasWrap);

  const canvas = canvasWrap.querySelector('#gv-canvas');
  const ctx = canvas.getContext('2d');
  let speedIdx = 0;
  let destroyed = false;
  let bfsActive = false; // Guard against concurrent BFS executions

  // Graph state
  const graph = {
    nodes: [],
    edges: [],
    directed: false,
    dragMode: 'edges', // 'edges' or 'node'
    nodeCount: 0,
    pendingEdgeStart: null,
    bfsRunning: false,
    bfsQueue: [],
    bfsVisited: new Set(),
    bfsPath: [],
    bfsCurrent: null,
  };

  const cam = { x: 0, y: 0, zoom: 1, offsetX: 0, offsetY: 0 };
  let camReady = false;
  let isPanning = false, dragStartX = 0, dragStartY = 0, lastClickTime = 0;
  let draggedNode = null, draggedNodeOffset = { x: 0, y: 0 };

  let popupTimer = 0, popupMaxT = 0;
  const popupEl = canvasWrap.querySelector('#gv-popup');
  const popupMsg = canvasWrap.querySelector('#gv-popup-msg');
  const popupProg = canvasWrap.querySelector('#gv-popup-progress');

  function showPopup(msg, color, dur = 3.5) {
    popupMsg.textContent = msg;
    const ariaLive = canvasWrap.querySelector('#gv-aria-live');
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
    panel.querySelector('#gv-stat1').textContent = l1;
    panel.querySelector('#gv-stat2').textContent = l2;
  }

  function updateLiveStats() {
    canvasWrap.querySelector('#gv-ls-nodes').textContent = `Nodes: ${graph.nodes.length}`;
    canvasWrap.querySelector('#gv-ls-edges').textContent = `Edges: ${graph.edges.length}`;
    canvasWrap.querySelector('#gv-ls-bfs').textContent = graph.bfsRunning 
      ? `BFS: ${graph.bfsCurrent !== null ? 'Running...' : 'Starting...'}`
      : 'BFS: Not Started';
  }

  function getT() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    return isLight ? THEMES.light : THEMES.night;
  }

  function resizeCanvas() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w === 0 || h === 0) return; // Not laid out yet
    canvas.width = w * devicePixelRatio;
    canvas.height = h * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    if (!camReady) resetCamera();
  }

  function resetCamera() {
    const W = canvas.clientWidth, H = canvas.clientHeight;
    cam.offsetX = W * 0.5; cam.offsetY = H * 0.5;
    cam.x = 0; cam.y = 0; cam.zoom = 1; camReady = true;
  }

  const onResize = () => { if (!destroyed) resizeCanvas(); };
  const resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(container);
  resizeCanvas(); // try immediately
  // Also retry after layout in case clientWidth was 0
  requestAnimationFrame(() => { if (!destroyed) resizeCanvas(); });

  // ── Code Panel Logic ────────────────────────────────────────────────────
  const codeLinesEl = canvasWrap.querySelector('#gv-code-lines');
  const codeStepMsgEl = canvasWrap.querySelector('#gv-code-step-msg');
  const codeLangBar = canvasWrap.querySelector('#gv-code-lang-bar');
  const codeProgressBar = canvasWrap.querySelector('#gv-code-progress');
  const codePanel = canvasWrap.querySelector('#gv-code-panel');
  const codeCloseBtn = canvasWrap.querySelector('#gv-code-close');
  let currentLang = 'js';
  let traceEnabled = true;

  const traceToggle = panel.querySelector('#gv-trace-toggle');
  const toggleSlider = traceToggle.nextElementSibling;
  // Apply initial toggle styling
  toggleSlider.style.backgroundColor = traceEnabled ? 'var(--accent)' : 'var(--border)';
  toggleSlider.innerHTML = `<span style="position:absolute;height:14px;width:14px;left:${traceEnabled?'17px':'3px'};bottom:3px;background-color:white;transition:.4s;border-radius:50%;"></span>`;

  traceToggle.addEventListener('change', () => {
    traceEnabled = traceToggle.checked;
    toggleSlider.style.backgroundColor = traceEnabled ? 'var(--accent)' : 'var(--border)';
    toggleSlider.querySelector('span').style.left = traceEnabled ? '17px' : '3px';
    if (!traceEnabled) {
      codePanel.classList.remove('visible');
    } else if (graph.bfsRunning) {
      codePanel.classList.add('visible');
    }
  });

  codeCloseBtn.addEventListener('click', () => {
    codePanel.classList.remove('visible');
    traceToggle.checked = false;
    traceEnabled = false;
    toggleSlider.style.backgroundColor = 'var(--border)';
    toggleSlider.querySelector('span').style.left = '3px';
  });

  codeLangBar.querySelectorAll('.tree-code-lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentLang = btn.dataset.lang;
      codeLangBar.querySelectorAll('.tree-code-lang-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderCodeLines(-1); // Will just update language and keep current active line
    });
  });

  let currentActiveLine = -1;
  function renderCodeLines(activeLineIdx = -1, msg = null, progress = -1) {
    if (activeLineIdx !== -1) currentActiveLine = activeLineIdx;
    else activeLineIdx = currentActiveLine;

    if (msg) codeStepMsgEl.textContent = msg;
    if (progress >= 0) codeProgressBar.style.width = `${progress}%`;

    const codeObj = codeSnippets.bfs;
    const lines = codeObj[currentLang] || codeObj.js || [];
    
    codeLinesEl.innerHTML = lines.map((line, idx) => {
      const isPast = idx < activeLineIdx;
      const isActive = idx === activeLineIdx;
      let cls = 'tree-cline';
      if (isActive) cls += ' active';
      else if (isPast) cls += ' visited';
      return `<div class="${cls}">` +
             `<span class="tree-cline-num">${idx + 1}</span>` +
             `<span class="tree-cline-text">${escapeHtml(line)}</span>` +
             `</div>`;
    }).join('');

    if (activeLineIdx >= 0) {
      const activeLineEl = codeLinesEl.querySelector('.tree-cline.active');
      if (activeLineEl) activeLineEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // Graph operations
  function createGraph() {
    const count = parseInt(panel.querySelector('#gv-node-count').value, 10);
    if (isNaN(count) || count < 3 || count > 20) {
      showPopup('Please enter 3-20 nodes', '#ff4b4b', 2);
      return;
    }
    graph.nodes = [];
    graph.edges = [];
    graph.nodeCount = count;
    graph.bfsRunning = false;
    bfsActive = false;
    graph.bfsQueue = [];
    graph.bfsVisited = new Set();
    graph.bfsPath = [];
    graph.bfsCurrent = null;
    graph.pendingEdgeStart = null;

    // Position nodes in a circle
    const cx = 0, cy = 0, radius = Math.min(200, 60 + count * 15);
    for (let i = 0; i < count; i++) {
      const angle = (2 * Math.PI * i) / count - Math.PI / 2;
      graph.nodes.push({
        id: i,
        label: String(i),
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        curX: cx + radius * Math.cos(angle),
        curY: cy + radius * Math.sin(angle),
        color: NODE_COLORS[i % NODE_COLORS.length],
        state: 'default',
        pulseTimer: 0,
        alpha: 1, // Start fully visible
      });
    }

    showPopup(`Created graph with ${count} nodes`, '#48d782', 2);
    setStatus('Graph Created', 'Add edges, then click ▶ Run BFS');
    // Also update start node max
    const startInput = panel.querySelector('#gv-start-node');
    if (startInput) startInput.max = count - 1;
    panel.querySelector('#gv-queue-display').textContent = '';
    panel.querySelector('#gv-path-display').textContent = '';
  }

  function addEdge(fromId, toId) {
    if (fromId === toId) return; // No self-loops
    const exists = graph.edges.some(e => 
      (e.from === fromId && e.to === toId) ||
      (!graph.directed && e.from === toId && e.to === fromId)
    );
    if (exists) return; // No duplicates

    graph.edges.push({ from: fromId, to: toId });
    const label = graph.directed ? `${fromId}→${toId}` : `${fromId}–${toId}`;
    showPopup(`Added edge: ${label}`, '#5aa0ff', 2);
    setStatus('Edge Added', label);
  }

  function resetGraph() {
    graph.edges = [];
    graph.bfsRunning = false;
    bfsActive = false;
    graph.bfsQueue = [];
    graph.bfsVisited = new Set();
    graph.bfsPath = [];
    graph.bfsCurrent = null;
    graph.pendingEdgeStart = null;
    graph.nodes.forEach(n => {
      n.state = 'default';
      n.pulseTimer = 0;
    });
    panel.querySelector('#gv-queue-display').textContent = '';
    panel.querySelector('#gv-path-display').textContent = '';
    showPopup('Graph reset', '#ff913c', 2);
    setStatus('Graph Reset', 'Ready for new edges');
  }

  function clearGraph() {
    graph.nodes = [];
    graph.edges = [];
    graph.nodeCount = 0;
    graph.bfsRunning = false;
    bfsActive = false;
    graph.bfsQueue = [];
    graph.bfsVisited = new Set();
    graph.bfsPath = [];
    graph.bfsCurrent = null;
    graph.pendingEdgeStart = null;
    panel.querySelector('#gv-queue-display').textContent = '';
    panel.querySelector('#gv-path-display').textContent = '';
    canvasWrap.querySelector('#gv-export-popup').style.display = 'none';
    showPopup('Graph cleared', '#ff4b4b', 2);
    setStatus('Graph Cleared', 'Create nodes to start');
  }

  function startBFS() {
    if (graph.nodes.length === 0) {
      showPopup('Create graph first!', '#ff4b4b', 2);
      return;
    }
    if (bfsActive) {
      showPopup('BFS is already running!', '#ff4b4b', 2);
      return;
    }
    let startId = parseInt(panel.querySelector('#gv-start-node').value, 10);
    if (isNaN(startId) || startId < 0 || startId >= graph.nodes.length) {
      startId = 0;
      panel.querySelector('#gv-start-node').value = '0';
    }
    graph.bfsRunning = true;
    bfsActive = false;
    graph.pendingEdgeStart = null; // Clear any pending edge
    runBFS(startId);
  }

  async function runBFS(startId) {
    if (bfsActive) return; // Prevent concurrent executions
    bfsActive = true;

    graph.bfsQueue = [startId];
    graph.bfsVisited = new Set([startId]);
    graph.bfsPath = [];
    graph.nodes.forEach(n => { n.state = 'default'; n.pulseTimer = 0; });

    if (traceEnabled) {
      codePanel.classList.add('visible');
      codeStepMsgEl.classList.remove('done');
      renderCodeLines(0, 'Initialize visited set and queue', 0);
    }

    const T = getT();

    graph.nodes[startId].state = 'visiting';
    graph.nodes[startId].pulseTimer = 1.5;
    showPopup(`Starting BFS from node ${startId}`, T.accent, 2);
    setStatus(`BFS from ${startId}`, 'Queue: [' + startId + ']');
    panel.querySelector('#gv-queue-display').textContent = `Queue: [${startId}]`;
    panel.querySelector('#gv-path-display').textContent = `Visited: []`;

    await sleep(1200 / SPEED_TABLE[speedIdx]);
    if (destroyed) { bfsActive = false; return; }

    if (traceEnabled) renderCodeLines(3, 'Loop while queue is not empty', 10);

    while (graph.bfsQueue.length > 0 && !destroyed) {
      if (traceEnabled) renderCodeLines(4, 'Dequeue next node', 20);
      const current = graph.bfsQueue.shift();
      graph.bfsCurrent = current;
      graph.nodes[current].state = 'visiting';
      graph.nodes[current].pulseTimer = 1;

      const queueStr = '[' + graph.bfsQueue.join(', ') + ']';
      const pathStr = '[' + graph.bfsPath.join(', ') + ']';
      setStatus(`Processing node ${current}`, `Queue: ${queueStr}`);
      panel.querySelector('#gv-queue-display').textContent = `Queue: ${queueStr}`;
      panel.querySelector('#gv-path-display').textContent = `Visited: ${pathStr}`;

      if (traceEnabled) renderCodeLines(5, `Visit node ${current}`, 40);
      showPopup(`Visiting node ${current}`, T.accent2, 1.5);

      await sleep(800 / SPEED_TABLE[speedIdx]);
      if (destroyed) { bfsActive = false; return; }

      graph.nodes[current].state = 'visited';
      graph.bfsPath.push(current);

      if (traceEnabled) renderCodeLines(6, `Check neighbors of ${current}`, 50);

      // Find neighbors
      const neighbors = [];
      graph.edges.forEach(e => {
        if (e.from === current && !graph.bfsVisited.has(e.to)) {
          neighbors.push(e.to);
        }
        if (!graph.directed && e.to === current && !graph.bfsVisited.has(e.from)) {
          neighbors.push(e.from);
        }
      });

      for (const nid of neighbors) {
        if (destroyed) { bfsActive = false; return; }
        if (traceEnabled) renderCodeLines(7, `If neighbor ${nid} not visited...`, 60);
        if (!graph.bfsVisited.has(nid)) {
          if (traceEnabled) renderCodeLines(8, `Mark ${nid} visited & enqueue`, 80);
          graph.bfsVisited.add(nid);
          graph.bfsQueue.push(nid);
          graph.nodes[nid].state = 'queued';
          graph.nodes[nid].pulseTimer = 1.2;

          panel.querySelector('#gv-queue-display').textContent = `Queue: [${graph.bfsQueue.join(', ')}]`;
          await sleep(400 / SPEED_TABLE[speedIdx]);
        }
      }

      await sleep(300 / SPEED_TABLE[speedIdx]);
    }

    bfsActive = false;
    graph.bfsRunning = false;
    graph.bfsCurrent = null;
    if (!destroyed) {
      if (traceEnabled) {
        renderCodeLines(-1, '✓ BFS Complete', 100);
        codeStepMsgEl.classList.add('done');
      }
      showPopup(`BFS Complete! Visited: ${graph.bfsPath.join(' → ')}`, T.success, 4);
      setStatus('BFS Complete', `Visited ${graph.bfsPath.length} nodes`);
      panel.querySelector('#gv-queue-display').textContent = '';
      panel.querySelector('#gv-path-display').textContent = `Final: [${graph.bfsPath.join(', ')}]`;
    }
  }

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function getAdjacencyList() {
    const adj = {};
    graph.nodes.forEach(n => { adj[n.id] = []; });
    graph.edges.forEach(e => {
      adj[e.from].push(e.to);
      if (!graph.directed) adj[e.to].push(e.from);
    });
    let result = 'Adjacency List:\n\n';
    Object.entries(adj).sort((a,b) => a[0]-b[0]).forEach(([k, v]) => {
      result += `Node ${k}: [${v.sort((a,b) => a-b).join(', ')}]\n`;
    });
    return result;
  }

  function getAdjacencyMatrix() {
    const n = graph.nodes.length;
    const matrix = Array(n).fill(null).map(() => Array(n).fill(0));
    graph.edges.forEach(e => {
      matrix[e.from][e.to] = 1;
      if (!graph.directed) matrix[e.to][e.from] = 1;
    });
    
    let result = 'Adjacency Matrix:\n\n   ';
    for (let i = 0; i < n; i++) result += ` ${i} `;
    result += '\n';
    for (let i = 0; i < n; i++) {
      result += ` ${i} `;
      for (let j = 0; j < n; j++) {
        result += ` ${matrix[i][j]} `;
      }
      result += '\n';
    }
    return result;
  }

  function showExportPopup(msg) {
    const exportPopup = canvasWrap.querySelector('#gv-export-popup');
    canvasWrap.querySelector('#gv-export-msg').textContent = msg;
    exportPopup.style.display = 'block';
    exportPopup.style.borderColor = 'var(--accent)';

    // Non-blocking, non-interfering auto-hide
    if (graph._gvExportTimer) clearTimeout(graph._gvExportTimer);
    graph._gvExportTimer = setTimeout(() => {
      if (destroyed) return;
      exportPopup.style.display = 'none';
    }, 8000);
  }

  // Event handlers - wrap in error checking
  const btnCreate = panel.querySelector('#gv-btn-create');
  const btnReset = panel.querySelector('#gv-btn-reset');
  const btnClear = panel.querySelector('#gv-btn-clear');
  const btnStartBFS = panel.querySelector('#gv-btn-start-bfs');
  const btnAdjList = panel.querySelector('#gv-btn-adj-list');
  const btnAdjMatrix = panel.querySelector('#gv-btn-adj-matrix');

  if (btnCreate) btnCreate.addEventListener('click', createGraph);
  if (btnReset) btnReset.addEventListener('click', resetGraph);
  if (btnClear) btnClear.addEventListener('click', clearGraph);
  if (btnStartBFS) btnStartBFS.addEventListener('click', startBFS);
  if (btnAdjList) btnAdjList.addEventListener('click', () => showExportPopup(getAdjacencyList()));
  if (btnAdjMatrix) btnAdjMatrix.addEventListener('click', () => showExportPopup(getAdjacencyMatrix()));

  panel.querySelectorAll('.tree-speed-btn[data-speed]').forEach(btn => {
    btn.addEventListener('click', () => {
      speedIdx = parseInt(btn.dataset.speed, 10);
      panel.querySelectorAll('.tree-speed-btn[data-speed]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  panel.querySelectorAll('.tree-speed-btn[data-dir]').forEach(btn => {
    btn.addEventListener('click', () => {
      graph.directed = btn.dataset.dir === 'directed';
      panel.querySelectorAll('.tree-speed-btn[data-dir]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showPopup(graph.directed ? 'Directed edges' : 'Undirected edges', '#5aa0ff', 2);
    });
  });

  panel.querySelectorAll('.tree-speed-btn[data-drag]').forEach(btn => {
    btn.addEventListener('click', () => {
      graph.dragMode = btn.dataset.drag;
      panel.querySelectorAll('.tree-speed-btn[data-drag]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      showPopup(graph.dragMode === 'edges' ? 'Drag moves connected edges' : 'Drag moves node only', '#5aa0ff', 2);
    });
  });

  // Canvas interactions
  function getNodeAt(x, y) {
    const wx = (x - cam.offsetX) / cam.zoom + cam.x;
    const wy = (y - cam.offsetY) / cam.zoom + cam.y;
    for (const node of graph.nodes) {
      const dx = node.curX - wx;
      const dy = node.curY - wy;
      if (Math.sqrt(dx*dx + dy*dy) < NODE_R + 5) return node;
    }
    return null;
  }

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.button === 2) { isPanning = true; dragStartX = e.clientX; dragStartY = e.clientY; }
    if (e.button === 0) {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const node = getNodeAt(mx, my);
      if (node) {
        if (bfsActive || graph.bfsRunning) {
          return; // BFS is running or pending — ignore canvas clicks
        }
        if (graph.pendingEdgeStart !== null) {
          if (graph.pendingEdgeStart !== node.id) {
            addEdge(graph.pendingEdgeStart, node.id);
            graph.pendingEdgeStart = null;
            graph.nodes.forEach(n => n.state = n.state === 'queued' ? 'default' : n.state);
          }
        } else {
          graph.pendingEdgeStart = node.id;
          node.state = 'queued';
          node.pulseTimer = 2;
          showPopup(`Selected node ${node.id} as source`, '#ff913c', 2);
          setStatus('Edge Mode', 'Click target node to add edge');
        }
        draggedNode = node;
        draggedNodeOffset.x = mx;
        draggedNodeOffset.y = my;
      } else {
        graph.pendingEdgeStart = null;
        graph.nodes.forEach(n => { if (n.state === 'queued') n.state = 'default'; });
      }
      const now = Date.now();
      if (now - lastClickTime < 320) resetCamera();
      lastClickTime = now;
    }
  });

  canvas.addEventListener('contextmenu', e => e.preventDefault());

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

  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;

    
    if (isPanning) {
      cam.offsetX += e.clientX - dragStartX;
      cam.offsetY += e.clientY - dragStartY;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    }
    if (draggedNode) {
      const wx = (mx - cam.offsetX) / cam.zoom + cam.x;
      const wy = (my - cam.offsetY) / cam.zoom + cam.y;
      if (graph.dragMode === 'edges') {
        draggedNode.x = wx;
        draggedNode.y = wy;
        draggedNode.curX = wx;
        draggedNode.curY = wy;
      } else {
        draggedNode.x = wx;
        draggedNode.y = wy;
        draggedNode.curX = wx;
        draggedNode.curY = wy;
      }
    }
  };
  const onMouseUp = () => { isPanning = false; draggedNode = null; };
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  // Render loop
  let lastTime = performance.now();
  let rafId = null;

  function loop(now) {
    if (destroyed) return;
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    tickPopup(dt);
    updateLiveStats();

    const W = canvas.clientWidth, H = canvas.clientHeight;
    const T = getT();
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = T.bg;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(cam.offsetX, cam.offsetY);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(-cam.x, -cam.y);

    // Draw edges
    graph.edges.forEach(edge => {
      const fromNode = graph.nodes[edge.from];
      const toNode = graph.nodes[edge.to];
      if (!fromNode || !toNode) return;

      const alpha = Math.min(fromNode.alpha, toNode.alpha);
      ctx.beginPath();
      ctx.moveTo(fromNode.curX, fromNode.curY);
      ctx.lineTo(toNode.curX, toNode.curY);
      ctx.strokeStyle = colA(T.edgeCol, alpha * 0.8);
      ctx.lineWidth = 2;
      ctx.stroke();

      // Arrow for directed
      if (graph.directed) {
        const angle = Math.atan2(toNode.curY - fromNode.curY, toNode.curX - fromNode.curX);
        const ax = toNode.curX - NODE_R * Math.cos(angle);
        const ay = toNode.curY - NODE_R * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax - 10 * Math.cos(angle - Math.PI / 6), ay - 10 * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(ax - 10 * Math.cos(angle + Math.PI / 6), ay - 10 * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fillStyle = colA(T.edgeCol, alpha);
        ctx.fill();
      }
    });

    // Draw pending edge preview (intentionally omitted in BFS)
    if (graph.pendingEdgeStart !== null) {
      // no-op
    }


    // Draw nodes
    graph.nodes.forEach(node => {
      // Update alpha
      if (node.alpha < 1) node.alpha = Math.min(1, node.alpha + dt * 2);
      
      // Update pulse
      if (node.pulseTimer > 0) node.pulseTimer -= dt;

      const cx = node.curX, cy = node.curY, a = node.alpha;

      // Glow for queued/visiting
      if ((node.state === 'queued' || node.state === 'visiting') && node.pulseTimer > 0) {
        const p = Math.sin(node.pulseTimer * 8) * 0.5 + 0.5;
        ctx.beginPath(); ctx.arc(cx, cy, NODE_R + 10 * p, 0, Math.PI * 2);
        ctx.fillStyle = colA('#ffe628', p * 0.4 * a);
        ctx.fill();
      }

      // Node shadow
      ctx.beginPath(); ctx.arc(cx + 2, cy + 3, NODE_R, 0, Math.PI * 2);
      ctx.fillStyle = colA(T.nodeShadow, a * 0.4);
      ctx.fill();

      // Node circle
      let nodeColor = node.color;
      if (node.state === 'visited') nodeColor = '#48d782';
      else if (node.state === 'visiting') nodeColor = '#ff913c';
      else if (node.state === 'queued') nodeColor = '#ffc832';
      
      ctx.beginPath(); ctx.arc(cx, cy, NODE_R, 0, Math.PI * 2);
      ctx.fillStyle = colA(nodeColor, a);
      ctx.fill();
      
      // Highlight for pending
      if (node.id === graph.pendingEdgeStart) {
        ctx.beginPath(); ctx.arc(cx, cy, NODE_R + 5, 0, Math.PI * 2);
        ctx.strokeStyle = colA('#ff913c', a);
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Node label
      ctx.font = '700 14px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = colA('#ffffff', a);
      ctx.fillText(node.label, cx, cy + 1);
    });

    ctx.restore();
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  function destroy() {
    destroyed = true;
    if (rafId) cancelAnimationFrame(rafId);
    resizeObserver.disconnect();
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    container.innerHTML = '';
  }

  return { graph, destroy, resetCamera };
}