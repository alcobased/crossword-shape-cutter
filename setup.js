// public/setup.js

// Central App object for shared variables and DOM elements
window.App = {
  // DOM Elements
  crosswordGridDiv: document.getElementById("crosswordGrid"),
  resetGridBtn: document.getElementById("resetGridBtn"),
  confirmShapeBtn: document.getElementById("confirmShapeBtn"),
  finishCuttingBtn: document.getElementById("finishCuttingBtn"),
  puzzleContainer: document.getElementById("puzzleContainer"),

  // Modal Elements (reused by puzzle.js)
  charInputModal: document.getElementById("charInputModal"),
  charInputField: document.getElementById("charInputField"),
  saveCharBtn: document.getElementById("saveCharBtn"),
  cancelCharBtn: document.getElementById("cancelCharBtn"),
  deleteCellBtn: document.getElementById("deleteCellBtn"),
  radioActiveChar: document.getElementById("radioActiveChar"),
  radioBlackBoundary: document.getElementById("radioBlackBoundary"),

  // Constants
  CELL_SIZE: 40,
  GRID_COLS: 15,
  GRID_ROWS: 10,

  // Internal state for setup grid
  grid: [],
  currentCellElement: null, // To store the cell being edited in setup mode
};

// Apply initial styles using App.crosswordGridDiv
App.crosswordGridDiv.style.gridTemplateColumns = `repeat(${App.GRID_COLS}, ${App.CELL_SIZE}px)`;
App.crosswordGridDiv.style.gridTemplateRows = `repeat(${App.GRID_ROWS}, ${App.CELL_SIZE}px)`;
App.crosswordGridDiv.style.width = `${App.GRID_COLS * App.CELL_SIZE}px`;
App.crosswordGridDiv.style.height = `${App.GRID_ROWS * App.CELL_SIZE}px`;

function initializeGrid() {
  App.crosswordGridDiv.innerHTML = "";
  App.grid = []; // Use App.grid

  for (let r = 0; r < App.GRID_ROWS; r++) {
    App.grid[r] = [];
    for (let c = 0; c < App.GRID_COLS; c++) {
      const cellElement = document.createElement("div");
      cellElement.classList.add("grid-cell");
      cellElement.dataset.row = r;
      cellElement.dataset.col = c;

      cellElement.addEventListener("click", handleCellClick);

      App.crosswordGridDiv.appendChild(cellElement);

      App.grid[r][c] = {
        // Use App.grid
        type: 0,
        char: "",
        element: cellElement,
      };
    }
  }
  App.puzzleContainer.style.display = "none";
  App.crosswordGridDiv.style.display = "grid";
  document.querySelector(".controls").style.display = "flex"; // This one is not stored in App, so query it
}

function handleCellClick(event) {
  const cellElement = event.target;
  const row = parseInt(cellElement.dataset.row);
  const col = parseInt(cellElement.dataset.col);
  const cellData = App.grid[row][col]; // Use App.grid

  App.currentCellElement = cellElement; // Store the clicked cell globally

  // Pre-fill modal based on current cell state
  App.charInputField.value = cellData.char;
  if (cellData.type === 1) {
    App.radioActiveChar.checked = true;
    App.charInputField.style.display = "block";
  } else if (cellData.type === 2) {
    App.radioBlackBoundary.checked = true;
    App.charInputField.style.display = "none";
  } else {
    App.radioActiveChar.checked = true;
    App.charInputField.style.display = "block";
    App.charInputField.value = "";
  }

  App.charInputModal.style.display = "flex";
  App.charInputField.focus();
  App.charInputField.select();
}

// Event listener for radio button changes within the modal
document.querySelectorAll('input[name="cellType"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    if (event.target.value === "active-char") {
      App.charInputField.style.display = "block";
      App.charInputField.focus();
      App.charInputField.select();
    } else {
      App.charInputField.style.display = "none";
      App.charInputField.value = "";
    }
  });
});

// Event listeners for the modal buttons
App.saveCharBtn.addEventListener("click", () => {
  if (App.currentCellElement) {
    const row = parseInt(App.currentCellElement.dataset.row);
    const col = parseInt(App.currentCellElement.dataset.col);
    const cellData = App.grid[row][col]; // Use App.grid

    const selectedType = document.querySelector(
      'input[name="cellType"]:checked'
    ).value;

    // Reset classes first
    App.currentCellElement.classList.remove("active-char", "black-boundary");
    App.currentCellElement.textContent = "";
    cellData.char = "";

    if (selectedType === "active-char") {
      cellData.type = 1;
      App.currentCellElement.classList.add("active-char");
      const char = App.charInputField.value.toUpperCase().charAt(0) || "";
      cellData.char = char;
      App.currentCellElement.textContent = char;
    } else if (selectedType === "black-boundary") {
      cellData.type = 2;
      App.currentCellElement.classList.add("black-boundary");
    }
  }
  App.charInputModal.style.display = "none";
  App.charInputField.value = "";
  App.currentCellElement = null;
});

App.cancelCharBtn.addEventListener("click", () => {
  if (App.currentCellElement) {
    // If canceled from setup grid, revert the cell state to what it was before modal was opened.
    // Or for simplicity here, if it was newly clicked, set it back to inactive (type 0)
    // This makes sure if a user clicks, then cancels, the cell isn't left as 'active-char'
    const row = parseInt(App.currentCellElement.dataset.row);
    const col = parseInt(App.currentCellElement.dataset.col);
    const cellData = App.grid[row][col]; // Use App.grid

    // Revert cell to inactive only if it was just turned to active-char
    if (cellData.type === 1 && App.currentCellElement.textContent === "") {
      // implies it was newly activated
      cellData.type = 0;
      App.currentCellElement.classList.remove("active-char");
    }
  }
  App.charInputModal.style.display = "none";
  App.charInputField.value = "";
  App.currentCellElement = null;
});

App.deleteCellBtn.addEventListener("click", () => {
  if (App.currentCellElement) {
    const row = parseInt(App.currentCellElement.dataset.row);
    const col = parseInt(App.currentCellElement.dataset.col);
    const cellData = App.grid[row][col]; // Use App.grid

    cellData.type = 0;
    cellData.char = "";
    App.currentCellElement.classList.remove("active-char", "black-boundary");
    App.currentCellElement.textContent = "";
  }
  App.charInputModal.style.display = "none";
  App.charInputField.value = "";
  App.currentCellElement = null;
});

// Allow hitting Enter to save in the modal
App.charInputField.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    App.saveCharBtn.click();
  }
});

App.resetGridBtn.addEventListener("click", () => {
  initializeGrid();
  alert("Grid reset! Start cutting a new shape.");
});

App.confirmShapeBtn.addEventListener("click", () => {
  const activeCells = [];
  let minRow = App.GRID_ROWS,
    maxRow = -1,
    minCol = App.GRID_COLS,
    maxCol = -1;

  for (let r = 0; r < App.GRID_ROWS; r++) {
    for (let c = 0; c < App.GRID_COLS; c++) {
      const cell = App.grid[r][c]; // Use App.grid
      if (cell.type === 1 || cell.type === 2) {
        activeCells.push({ row: r, col: c, type: cell.type, char: cell.char });
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }

  if (activeCells.length === 0) {
    alert("No active cells marked! Please mark cells to form a shape.");
    return;
  }

  const shapeData = {
    cells: activeCells.map((cell) => ({
      row: cell.row - minRow,
      col: cell.col - minCol,
      type: cell.type,
      char: cell.char,
    })),
  };

  let savedShapes = JSON.parse(localStorage.getItem("crosswordShapes")) || [];
  shapeData.id = Date.now();
  savedShapes.push(shapeData);
  localStorage.setItem("crosswordShapes", JSON.stringify(savedShapes));
  alert("Shape saved successfully! Total shapes: " + savedShapes.length);

  initializeGrid();
});

initializeGrid();

// Expose initializeSetupGrid to the global scope if needed elsewhere (e.g., tests)
// Though with App object, it's usually better to call App.initializeSetupGrid()
window.initializeSetupGrid = initializeGrid;
