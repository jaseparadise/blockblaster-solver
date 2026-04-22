
const BOARD_SIZE = 8;

const PIECES = [
  { id: "single", name: "Single block", cells: [[0,0]] },

  { id: "line2_h", name: "2-line horizontal", cells: [[0,0],[0,1]] },
  { id: "line2_v", name: "2-line vertical", cells: [[0,0],[1,0]] },

  { id: "line3_h", name: "3-line horizontal", cells: [[0,0],[0,1],[0,2]] },
  { id: "line3_v", name: "3-line vertical", cells: [[0,0],[1,0],[2,0]] },
  { id: "L3_dr", name: "3-block L └", cells: [[0,0],[1,0],[1,1]] },
  { id: "L3_dl", name: "3-block L ┘", cells: [[0,1],[1,0],[1,1]] },
  { id: "L3_ur", name: "3-block L ┌", cells: [[0,0],[0,1],[1,0]] },
  { id: "L3_ul", name: "3-block L ┐", cells: [[0,0],[0,1],[1,1]] },

  { id: "line4_h", name: "4-line horizontal", cells: [[0,0],[0,1],[0,2],[0,3]] },
  { id: "line4_v", name: "4-line vertical", cells: [[0,0],[1,0],[2,0],[3,0]] },
  { id: "square2", name: "2×2 square", cells: [[0,0],[0,1],[1,0],[1,1]] },
  { id: "T_up", name: "T up", cells: [[0,0],[0,1],[0,2],[1,1]] },
  { id: "T_down", name: "T down", cells: [[0,1],[1,0],[1,1],[1,2]] },
  { id: "T_left", name: "T left", cells: [[0,1],[1,0],[1,1],[2,1]] },
  { id: "T_right", name: "T right", cells: [[0,0],[1,0],[1,1],[2,0]] },
  { id: "L4_dr", name: "L4 └", cells: [[0,0],[1,0],[2,0],[2,1]] },
  { id: "L4_dl", name: "L4 ┘", cells: [[0,1],[1,1],[2,0],[2,1]] },
  { id: "L4_ur", name: "L4 ┌", cells: [[0,0],[0,1],[1,0],[2,0]] },
  { id: "L4_ul", name: "L4 ┐", cells: [[0,0],[0,1],[1,1],[2,1]] },
  { id: "Z_h", name: "Z horizontal", cells: [[0,0],[0,1],[1,1],[1,2]] },
  { id: "Z_v", name: "Z vertical", cells: [[0,1],[1,0],[1,1],[2,0]] },
  { id: "S_h", name: "S horizontal", cells: [[0,1],[0,2],[1,0],[1,1]] },
  { id: "S_v", name: "S vertical", cells: [[0,0],[1,0],[1,1],[2,1]] },
  { id: "hook4_right", name: "Hook4 right", cells: [[0,0],[1,0],[1,1],[1,2]] },
  { id: "hook4_left", name: "Hook4 left", cells: [[0,2],[1,0],[1,1],[1,2]] },
  { id: "hook4_up", name: "Hook4 up", cells: [[0,0],[0,1],[0,2],[1,0]] },
  { id: "hook4_down", name: "Hook4 down", cells: [[0,2],[1,0],[1,1],[1,2]] },

  { id: "line5_h", name: "5-line horizontal", cells: [[0,0],[0,1],[0,2],[0,3],[0,4]] },
  { id: "line5_v", name: "5-line vertical", cells: [[0,0],[1,0],[2,0],[3,0],[4,0]] },
  { id: "rect2x3", name: "2×3 rectangle", cells: [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2]] },
  { id: "rect3x2", name: "3×2 rectangle", cells: [[0,0],[0,1],[1,0],[1,1],[2,0],[2,1]] },
  { id: "corner5_dr", name: "5-block corner ┐", cells: [[0,0],[0,1],[0,2],[1,2],[2,2]] },
  { id: "corner5_dl", name: "5-block corner ┌", cells: [[0,0],[0,1],[0,2],[1,0],[2,0]] },
  { id: "corner5_ur", name: "5-block corner ┘", cells: [[0,0],[1,0],[2,0],[2,1],[2,2]] },
  { id: "corner5_ul", name: "5-block corner └", cells: [[0,2],[1,2],[2,0],[2,1],[2,2]] },

  { id: "square3", name: "3×3 full square", cells: [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]] },
];

const state = {
  board: Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0)),
  selectedPieces: ["single", "single", "single"],
  overlayMoves: [],
  screenshotMeta: null,
};

const boardGrid = document.getElementById("boardGrid");
const filledCount = document.getElementById("filledCount");
const emptyCount = document.getElementById("emptyCount");
const piecesArea = document.getElementById("piecesArea");
const resultBox = document.getElementById("resultBox");
const statusBox = document.getElementById("statusBox");
const screenshotInput = document.getElementById("screenshotInput");
const screenshotWrap = document.getElementById("screenshotWrap");
const screenshotPreview = document.getElementById("screenshotPreview");

let deferredPrompt = null;

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, l };
}

function loadImageFromDataUrl(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawImageToCanvas(img) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  ctx.drawImage(img, 0, 0);
  return { canvas, ctx, width: canvas.width, height: canvas.height };
}

function buildPixelAccess(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  function getPixel(x, y) {
    const xx = Math.max(0, Math.min(width - 1, Math.round(x)));
    const yy = Math.max(0, Math.min(height - 1, Math.round(y)));
    const idx = (yy * width + xx) * 4;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
    const { h, s, l } = rgbToHsl(r, g, b);
    return { r, g, b, a, h, s, l, lum: 0.299 * r + 0.587 * g + 0.114 * b };
  }
  return { getPixel };
}

function componentSearch(mask, cols, rows) {
  const visited = new Uint8Array(cols * rows);
  const comps = [];
  const idx = (x, y) => y * cols + x;
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const id = idx(x, y);
      if (!mask[id] || visited[id]) continue;
      const queue = [[x, y]];
      visited[id] = 1;
      let minX = x, maxX = x, minY = y, maxY = y, area = 0;
      while (queue.length) {
        const [cx, cy] = queue.pop();
        area += 1;
        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;
        for (const [dx, dy] of dirs) {
          const nx = cx + dx, ny = cy + dy;
          if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
          const nid = idx(nx, ny);
          if (!mask[nid] || visited[nid]) continue;
          visited[nid] = 1;
          queue.push([nx, ny]);
        }
      }
      comps.push({ area, minX, maxX, minY, maxY, width: maxX - minX + 1, height: maxY - minY + 1 });
    }
  }
  return comps;
}

function detectBoardFromCanvas(ctx, width, height) {
  const { getPixel } = buildPixelAccess(ctx, width, height);
  const scale = Math.min(280 / width, 280 / height, 1);
  const cols = Math.max(80, Math.round(width * scale));
  const rows = Math.max(120, Math.round(height * scale));
  const startX = Math.floor(cols * 0.15);
  const endX = Math.ceil(cols * 0.85);
  const startY = Math.floor(rows * 0.12);
  const endY = Math.ceil(rows * 0.72);
  const mask = new Uint8Array(cols * rows);

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const px = getPixel((x + 0.5) / cols * width, (y + 0.5) / rows * height);
      // dark neutral board/background cells
      const darkBoardish = px.lum < 105 && px.s < 0.28;
      if (darkBoardish) mask[y * cols + x] = 1;
    }
  }

  const comps = componentSearch(mask, cols, rows)
    .filter(c => c.area > cols * rows * 0.01)
    .filter(c => c.minY < rows * 0.7 && c.maxY > rows * 0.2);

  if (!comps.length) return null;

  const scored = comps.map(c => {
    const ratio = c.width / c.height;
    const ratioPenalty = Math.abs(1 - ratio);
    const score = c.area - ratioPenalty * c.area * 0.8;
    return { ...c, score };
  }).sort((a, b) => b.score - a.score);

  const best = scored[0];
  const pad = 0.03;
  const x = Math.max(0, Math.round((best.minX / cols) * width - width * pad));
  const y = Math.max(0, Math.round((best.minY / rows) * height - height * pad));
  const w = Math.min(width - x, Math.round((best.width / cols) * width + width * pad * 2));
  const h = Math.min(height - y, Math.round((best.height / rows) * height + height * pad * 2));
  const side = Math.round((w + h) / 2);
  return { x, y, w: side, h: side };
}

function extractBoardState(ctx, width, height, boardBox) {
  const { getPixel } = buildPixelAccess(ctx, width, height);
  const perCell = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const left = boardBox.x + (c + 0.18) * boardBox.w / BOARD_SIZE;
      const top = boardBox.y + (r + 0.18) * boardBox.h / BOARD_SIZE;
      const right = boardBox.x + (c + 0.82) * boardBox.w / BOARD_SIZE;
      const bottom = boardBox.y + (r + 0.82) * boardBox.h / BOARD_SIZE;
      let sumLum = 0, sumSat = 0, count = 0, brightPixels = 0, blueish = 0;
      const stepX = Math.max(2, Math.floor((right - left) / 5));
      const stepY = Math.max(2, Math.floor((bottom - top) / 5));
      for (let y = top; y < bottom; y += stepY) {
        for (let x = left; x < right; x += stepX) {
          const px = getPixel(x, y);
          sumLum += px.lum;
          sumSat += px.s;
          count += 1;
          if (px.lum > 122) brightPixels += 1;
          if (px.b > px.r + 12 || px.s > 0.2) blueish += 1;
        }
      }
      perCell.push({ r, c, lum: sumLum / count, sat: sumSat / count, brightRatio: brightPixels / count, colorRatio: blueish / count });
    }
  }

  const lumSorted = [...perCell].map(c => c.lum).sort((a, b) => a - b);
  const darkBase = lumSorted.slice(0, 16).reduce((a, b) => a + b, 0) / 16;
  const board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
  for (const cell of perCell) {
    const filled = cell.lum > darkBase + 22 || cell.brightRatio > 0.2 || cell.colorRatio > 0.28;
    board[cell.r][cell.c] = filled ? 1 : 0;
  }
  return board;
}

function estimateBackground(ctx, width, height, zone) {
  const { getPixel } = buildPixelAccess(ctx, width, height);
  const samples = [];
  for (let y = zone.y; y < zone.y + zone.h; y += Math.max(4, Math.floor(zone.h / 12))) {
    for (let x = zone.x; x < zone.x + zone.w; x += Math.max(4, Math.floor(zone.w / 12))) {
      samples.push(getPixel(x, y));
    }
  }
  const byLum = samples.sort((a, b) => a.lum - b.lum);
  const middle = byLum.slice(Math.floor(byLum.length * 0.35), Math.floor(byLum.length * 0.65));
  const avg = middle.reduce((acc, p) => {
    acc.r += p.r; acc.g += p.g; acc.b += p.b; return acc;
  }, { r: 0, g: 0, b: 0 });
  const n = Math.max(1, middle.length);
  return { r: avg.r / n, g: avg.g / n, b: avg.b / n };
}

function colorDistance(a, b) {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
}

function detectPieceComponents(ctx, width, height, boardBox) {
  const zone = {
    x: Math.floor(width * 0.12),
    y: Math.min(height - 10, Math.floor(boardBox.y + boardBox.h + height * 0.04)),
    w: Math.floor(width * 0.76),
    h: Math.max(30, Math.floor(height - (boardBox.y + boardBox.h + height * 0.08)))
  };
  if (zone.y >= height - 20) return [];
  const bg = estimateBackground(ctx, width, height, zone);
  const { getPixel } = buildPixelAccess(ctx, width, height);
  const scale = Math.min(260 / zone.w, 180 / zone.h, 1);
  const cols = Math.max(100, Math.round(zone.w * scale));
  const rows = Math.max(50, Math.round(zone.h * scale));
  const mask = new Uint8Array(cols * rows);

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = getPixel(zone.x + (x + 0.5) / cols * zone.w, zone.y + (y + 0.5) / rows * zone.h);
      const dist = colorDistance(px, bg);
      const active = dist > 26 && (px.s > 0.18 || px.lum > 110 || Math.abs(px.r - px.g) + Math.abs(px.g - px.b) > 25);
      if (active) mask[y * cols + x] = 1;
    }
  }

  const comps = componentSearch(mask, cols, rows)
    .filter(c => c.area > cols * rows * 0.002)
    .filter(c => c.width > 4 && c.height > 4)
    .map(c => ({
      x: Math.round(zone.x + c.minX / cols * zone.w),
      y: Math.round(zone.y + c.minY / rows * zone.h),
      w: Math.round(c.width / cols * zone.w),
      h: Math.round(c.height / rows * zone.h),
      area: c.area,
      centerX: zone.x + (c.minX + c.width / 2) / cols * zone.w
    }))
    .sort((a, b) => a.centerX - b.centerX);

  // Prefer the 3 strongest, left-to-right, near lower half.
  return comps.filter(c => c.y > zone.y + zone.h * 0.05).slice(0, 6);
}

function identifyPieceFromBBox(ctx, width, height, bbox) {
  const { getPixel } = buildPixelAccess(ctx, width, height);
  const pad = 2;
  const x0 = Math.max(0, bbox.x - pad), y0 = Math.max(0, bbox.y - pad);
  const x1 = Math.min(width, bbox.x + bbox.w + pad), y1 = Math.min(height, bbox.y + bbox.h + pad);

  // local background from edges
  const edgeSamples = [];
  for (let x = x0; x < x1; x += Math.max(1, Math.floor((x1 - x0) / 12))) {
    edgeSamples.push(getPixel(x, y0));
    edgeSamples.push(getPixel(x, y1 - 1));
  }
  for (let y = y0; y < y1; y += Math.max(1, Math.floor((y1 - y0) / 12))) {
    edgeSamples.push(getPixel(x0, y));
    edgeSamples.push(getPixel(x1 - 1, y));
  }
  const bg = edgeSamples.reduce((acc, p) => ({ r: acc.r + p.r, g: acc.g + p.g, b: acc.b + p.b }), { r: 0, g: 0, b: 0 });
  bg.r /= edgeSamples.length; bg.g /= edgeSamples.length; bg.b /= edgeSamples.length;

  const w = x1 - x0, h = y1 - y0;
  const mask = Array.from({ length: h }, () => Array(w).fill(0));
  let minX = w, minY = h, maxX = 0, maxY = 0, activeCount = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = getPixel(x0 + x, y0 + y);
      const dist = colorDistance(px, bg);
      const active = dist > 24 && (px.s > 0.12 || px.lum > 100 || Math.abs(px.r - px.g) + Math.abs(px.g - px.b) > 18);
      if (active) {
        mask[y][x] = 1;
        activeCount += 1;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!activeCount) return null;

  const tw = maxX - minX + 1;
  const th = maxY - minY + 1;
  let best = null;

  for (const piece of PIECES) {
    const { rows, cols } = pieceDimensions(piece);
    const cellW = tw / cols;
    const cellH = th / rows;
    const aspectPenalty = Math.abs(1 - (cellW / cellH));
    let onScore = 0, offScore = 0, onBins = 0, offBins = 0;
    for (let pr = 0; pr < rows; pr++) {
      for (let pc = 0; pc < cols; pc++) {
        const bx0 = Math.floor(minX + pc * cellW);
        const by0 = Math.floor(minY + pr * cellH);
        const bx1 = Math.floor(minX + (pc + 1) * cellW);
        const by1 = Math.floor(minY + (pr + 1) * cellH);
        let active = 0, total = 0;
        for (let y = by0; y < Math.max(by0 + 1, by1); y++) {
          for (let x = bx0; x < Math.max(bx0 + 1, bx1); x++) {
            active += mask[Math.min(h - 1, y)][Math.min(w - 1, x)];
            total += 1;
          }
        }
        const ratio = total ? active / total : 0;
        const shouldBeOn = piece.cells.some(([r, c]) => r === pr && c === pc);
        if (shouldBeOn) { onScore += ratio; onBins += 1; }
        else { offScore += ratio; offBins += 1; }
      }
    }
    const score = (onScore / Math.max(1, onBins)) - (offScore / Math.max(1, offBins)) - aspectPenalty * 0.35;
    if (!best || score > best.score) best = { piece, score };
  }
  return best && best.score > 0.3 ? best.piece.id : (best ? best.piece.id : null);
}

async function analyzeScreenshotFromSrc(src) {
  const img = await loadImageFromDataUrl(src);
  const { ctx, width, height } = drawImageToCanvas(img);
  const boardBox = detectBoardFromCanvas(ctx, width, height);
  if (!boardBox) {
    throw new Error("Could not find the 8×8 board in this screenshot.");
  }

  const detectedBoard = extractBoardState(ctx, width, height, boardBox);
  const comps = detectPieceComponents(ctx, width, height, boardBox);
  const identified = [];
  for (const comp of comps) {
    const id = identifyPieceFromBBox(ctx, width, height, comp);
    if (id) identified.push(id);
  }

  // dedupe nearby shadows by taking the first 3 meaningful ids
  const selected = identified.slice(0, 3);
  return { board: detectedBoard, pieces: selected, boardBox, foundComponents: comps.length };
}

function buildBoard() {
  boardGrid.innerHTML = "";
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = `cell ${state.board[r][c] ? "filled" : ""}`;
      cell.dataset.row = String(r);
      cell.dataset.col = String(c);
      cell.addEventListener("click", () => {
        state.board[r][c] = state.board[r][c] ? 0 : 1;
        state.overlayMoves = [];
        renderBoard();
      });
      boardGrid.appendChild(cell);
    }
  }
  renderBoard();
}

function renderBoard() {
  const overlayMap = new Map();
  state.overlayMoves.forEach((move, idx) => {
    const moveClass = `move-${idx + 1}`;
    move.absoluteCells.forEach(([r, c]) => {
      const key = `${r},${c}`;
      const existing = overlayMap.get(key) || [];
      existing.push(moveClass);
      overlayMap.set(key, existing);
    });
  });

  [...boardGrid.children].forEach((cell) => {
    const r = Number(cell.dataset.row);
    const c = Number(cell.dataset.col);
    const key = `${r},${c}`;
    const moveClasses = overlayMap.get(key) || [];

    cell.className = "cell";
    if (state.board[r][c]) cell.classList.add("filled");
    moveClasses.forEach(cls => cell.classList.add(cls));
  });

  const filled = state.board.flat().reduce((a, b) => a + b, 0);
  filledCount.textContent = String(filled);
  emptyCount.textContent = String(BOARD_SIZE * BOARD_SIZE - filled);
}

function getPieceById(id) {
  return PIECES.find((p) => p.id === id);
}

function pieceDimensions(piece) {
  const rows = Math.max(...piece.cells.map(([r]) => r)) + 1;
  const cols = Math.max(...piece.cells.map(([,c]) => c)) + 1;
  return { rows, cols };
}

function renderPieceSelectors() {
  piecesArea.innerHTML = "";
  const tpl = document.getElementById("pieceSelectorTemplate");
  state.selectedPieces.forEach((pieceId, index) => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.querySelector("h3").textContent = `Piece ${index + 1}`;
    const select = node.querySelector(".piece-select");
    PIECES.forEach((piece) => {
      const option = document.createElement("option");
      option.value = piece.id;
      option.textContent = piece.name;
      if (piece.id === pieceId) option.selected = true;
      select.appendChild(option);
    });
    const preview = node.querySelector(".piece-preview");
    const randomBtn = node.querySelector(".random-piece-btn");

    function paintPreview() {
      const piece = getPieceById(select.value);
      state.selectedPieces[index] = piece.id;
      preview.innerHTML = "";
      const { rows, cols } = pieceDimensions(piece);
      for (let r = 0; r < rows; r++) {
        const row = document.createElement("div");
        row.className = "piece-row";
        for (let c = 0; c < cols; c++) {
          const cell = document.createElement("div");
          const on = piece.cells.some(([pr, pc]) => pr === r && pc === c);
          cell.className = `piece-cell ${on ? "on" : ""}`;
          row.appendChild(cell);
        }
        preview.appendChild(row);
      }
    }

    select.addEventListener("change", () => {
      state.overlayMoves = [];
      paintPreview();
    });
    randomBtn.addEventListener("click", () => {
      const random = PIECES[Math.floor(Math.random() * PIECES.length)];
      select.value = random.id;
      state.overlayMoves = [];
      paintPreview();
    });

    paintPreview();
    piecesArea.appendChild(node);
  });
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function canPlace(board, piece, baseR, baseC) {
  return piece.cells.every(([r,c]) => {
    const rr = baseR + r;
    const cc = baseC + c;
    return rr >= 0 && rr < BOARD_SIZE && cc >= 0 && cc < BOARD_SIZE && board[rr][cc] === 0;
  });
}

function legalPlacements(board, piece) {
  const { rows, cols } = pieceDimensions(piece);
  const placements = [];
  for (let r = 0; r <= BOARD_SIZE - rows; r++) {
    for (let c = 0; c <= BOARD_SIZE - cols; c++) {
      if (canPlace(board, piece, r, c)) placements.push({ row: r, col: c });
    }
  }
  return placements;
}

function placeAndClear(board, piece, row, col) {
  const next = cloneBoard(board);
  for (const [r, c] of piece.cells) {
    next[row + r][col + c] = 1;
  }

  const fullRows = [];
  const fullCols = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    if (next[r].every((v) => v === 1)) fullRows.push(r);
  }
  for (let c = 0; c < BOARD_SIZE; c++) {
    let full = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (next[r][c] !== 1) {
        full = false;
        break;
      }
    }
    if (full) fullCols.push(c);
  }

  for (const r of fullRows) for (let c = 0; c < BOARD_SIZE; c++) next[r][c] = 0;
  for (const c of fullCols) for (let r = 0; r < BOARD_SIZE; r++) next[r][c] = 0;

  return { board: next, cleared: fullRows.length + fullCols.length, fullRows, fullCols };
}

function countFilled(board) {
  return board.flat().reduce((a, b) => a + b, 0);
}

function countHoles(board) {
  let holes = 0;
  for (let r = 1; r < BOARD_SIZE - 1; r++) {
    for (let c = 1; c < BOARD_SIZE - 1; c++) {
      if (board[r][c] === 0) {
        const neighbors = [board[r-1][c], board[r+1][c], board[r][c-1], board[r][c+1]].reduce((a,b) => a+b, 0);
        if (neighbors >= 3) holes += 1;
      }
    }
  }
  return holes;
}

function edgeRoughness(board) {
  let rough = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (r + 1 < BOARD_SIZE && board[r][c] !== board[r+1][c]) rough += 1;
      if (c + 1 < BOARD_SIZE && board[r][c] !== board[r][c+1]) rough += 1;
    }
  }
  return rough;
}

function futureMobility(board) {
  let fits = 0;
  for (const piece of PIECES) {
    if (legalPlacements(board, piece).length > 0) fits += 1;
  }
  return fits;
}

function boardScore(board, clears, placedCount) {
  const filled = countFilled(board);
  const holes = countHoles(board);
  const rough = edgeRoughness(board);
  const mobility = futureMobility(board);
  return (
    placedCount * 100000 +
    clears * 2500 +
    mobility * 25 -
    filled * 35 -
    holes * 160 -
    rough * 4
  );
}

function permutations(items) {
  if (items.length <= 1) return [items];
  const result = [];
  for (let i = 0; i < items.length; i++) {
    const rest = items.slice(0, i).concat(items.slice(i + 1));
    for (const perm of permutations(rest)) result.push([items[i], ...perm]);
  }
  return result;
}

function solveBoard(board, pieceIds) {
  const pieceObjects = pieceIds.map((id, idx) => ({ ...getPieceById(id), slot: idx + 1 }));
  const perms = permutations(pieceObjects);
  let best = null;

  function search(currentBoard, order, moveIndex, moves, totalClears) {
    if (moveIndex >= order.length) {
      const placedCount = moves.length;
      const score = boardScore(currentBoard, totalClears, placedCount);
      const candidate = { score, moves: [...moves], finalBoard: currentBoard, clears: totalClears, placedCount };
      if (!best || candidate.score > best.score) best = candidate;
      return;
    }

    const piece = order[moveIndex];
    const placements = legalPlacements(currentBoard, piece);

    if (placements.length === 0) {
      const placedCount = moves.length;
      const score = boardScore(currentBoard, totalClears, placedCount);
      const candidate = { score, moves: [...moves], finalBoard: currentBoard, clears: totalClears, placedCount };
      if (!best || candidate.score > best.score) best = candidate;
      return;
    }

    for (const placement of placements) {
      const outcome = placeAndClear(currentBoard, piece, placement.row, placement.col);
      const absoluteCells = piece.cells.map(([r,c]) => [placement.row + r, placement.col + c]);
      moves.push({
        pieceName: piece.name,
        slot: piece.slot,
        row: placement.row,
        col: placement.col,
        absoluteCells,
        cleared: outcome.cleared,
        clearedRows: outcome.fullRows,
        clearedCols: outcome.fullCols,
      });
      search(outcome.board, order, moveIndex + 1, moves, totalClears + outcome.cleared);
      moves.pop();
    }
  }

  for (const perm of perms) search(board, perm, 0, [], 0);
  return best;
}

function setStatus(message) {
  statusBox.textContent = message;
}

function humanCell([r, c]) {
  return `(${r + 1}, ${c + 1})`;
}

function renderResult(result) {
  if (!result) {
    resultBox.classList.add("hidden");
    state.overlayMoves = [];
    renderBoard();
    return;
  }

  state.overlayMoves = result.moves.slice(0, 3);
  renderBoard();

  const filled = countFilled(result.finalBoard);
  const allFit = result.placedCount === 3;
  const summary = allFit
    ? `All 3 pieces can be placed. Best sequence found with ${result.clears} clear(s) and ${filled} filled cells remaining.`
    : `Not all pieces can be placed from the current position. Best sequence places ${result.placedCount}/3 piece(s), creates ${result.clears} clear(s), and leaves ${filled} filled cells.`;

  resultBox.innerHTML = `
    <h3>Best sequence</h3>
    <p>${summary}</p>
    <div class="sequence">
      ${result.moves.map((move, idx) => `
        <div class="move-card">
          <div class="move-label">
            <span class="move-indicator move-${idx + 1}"></span>
            <strong>Move ${idx + 1}</strong>
          </div>
          Use <code>Piece ${move.slot}</code> (${move.pieceName}) at top-left board cell <code>${humanCell([move.row, move.col])}</code>.<br />
          Covers: ${move.absoluteCells.map(humanCell).join(", ")}<br />
          ${move.cleared ? `Clears ${move.cleared} line(s).` : `No clear on this move.`}
        </div>
      `).join("")}
    </div>
    <h4>Final board metrics</h4>
    <p>
      Score: <code>${Math.round(result.score)}</code><br />
      Filled cells: <code>${filled}</code><br />
      Holes: <code>${countHoles(result.finalBoard)}</code><br />
      Future mobility: <code>${futureMobility(result.finalBoard)}</code> approved shapes still fit
    </p>
  `;
  resultBox.classList.remove("hidden");
}

function registerEvents() {
  document.getElementById("clearBoardBtn").addEventListener("click", () => {
    state.board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
    state.overlayMoves = [];
    renderBoard();
    resultBox.classList.add("hidden");
    setStatus("Board cleared.");
  });

  document.getElementById("invertBoardBtn").addEventListener("click", () => {
    state.board = state.board.map((row) => row.map((v) => (v ? 0 : 1)));
    state.overlayMoves = [];
    renderBoard();
    resultBox.classList.add("hidden");
    setStatus("Board inverted.");
  });

  document.getElementById("resetPiecesBtn").addEventListener("click", () => {
    state.selectedPieces = ["single", "single", "single"];
    state.overlayMoves = [];
    renderPieceSelectors();
    resultBox.classList.add("hidden");
    setStatus("Pieces reset.");
  });

  document.getElementById("solveBtn").addEventListener("click", () => {
    setStatus("Searching all legal placements for the current 3 pieces...");
    const result = solveBoard(cloneBoard(state.board), [...state.selectedPieces]);
    if (!result) {
      state.overlayMoves = [];
      renderBoard();
      setStatus("No legal placement found.");
      resultBox.classList.add("hidden");
      return;
    }
    const allFit = result.placedCount === 3;
    setStatus(allFit ? "Solved. All three pieces can be placed." : `Solved. Best sequence places ${result.placedCount} of 3 pieces.`);
    renderResult(result);
  });

  
  screenshotInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target?.result;
      screenshotPreview.src = src;
      screenshotWrap.classList.remove("hidden");
      setStatus("Screenshot loaded. Reading board and pieces...");
      try {
        const detected = await analyzeScreenshotFromSrc(src);
        state.board = detected.board;
        state.overlayMoves = [];
        if (detected.pieces.length === 3) {
          state.selectedPieces = detected.pieces;
        } else if (detected.pieces.length > 0) {
          state.selectedPieces = [
            detected.pieces[0] || "single",
            detected.pieces[1] || "single",
            detected.pieces[2] || "single",
          ];
        }
        renderBoard();
        renderPieceSelectors();
        resultBox.classList.add("hidden");
        const pieceNames = state.selectedPieces.map(id => getPieceById(id)?.name || id).join(", ");
        setStatus(`Screenshot read automatically. Detected ${countFilled(state.board)} filled cells and pieces: ${pieceNames}. Review and correct anything that looks wrong.`);
      } catch (err) {
        setStatus(`Screenshot loaded, but auto-read failed: ${err.message} You can still enter the board and pieces manually.`);
      }
    };
    reader.readAsDataURL(file);
  });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    document.getElementById("installBtn").classList.remove("hidden");
  });

  document.getElementById("installBtn").addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    document.getElementById("installBtn").classList.add("hidden");
  });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

buildBoard();
renderPieceSelectors();
registerEvents();
registerServiceWorker();
