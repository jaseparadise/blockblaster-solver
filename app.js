
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
    reader.onload = (e) => {
      screenshotPreview.src = e.target?.result;
      screenshotWrap.classList.remove("hidden");
      setStatus("Screenshot loaded. Use it as reference while entering the board and pieces.");
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
