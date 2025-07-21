// public/setup.js

const crosswordGridDiv = document.getElementById("crosswordGrid");
const resetGridBtn = document.getElementById("resetGridBtn");
const confirmShapeBtn = document.getElementById("confirmShapeBtn");
const finishCuttingBtn = document.getElementById("finishCuttingBtn");
const puzzleContainer = document.getElementById("puzzleContainer");

// New DOM elements for the modal
const charInputModal = document.getElementById("charInputModal");
const charInputField = document.getElementById("charInputField");
const saveCharBtn = document.getElementById("saveCharBtn");
const cancelCharBtn = document.getElementById("cancelCharBtn");
const deleteCellBtn = document.getElementById("deleteCellBtn"); // New delete button
const radioActiveChar = document.getElementById("radioActiveChar"); // New radio button
const radioBlackBoundary = document.getElementById("radioBlackBoundary"); // New radio button

const CELL_SIZE = 40;
const GRID_COLS = 15;
const GRID_ROWS = 10;

crosswordGridDiv.style.gridTemplateColumns = `repeat(${GRID_COLS}, ${CELL_SIZE}px)`;
crosswordGridDiv.style.gridTemplateRows = `repeat(${GRID_ROWS}, ${CELL_SIZE}px)`;
crosswordGridDiv.style.width = `${GRID_COLS * CELL_SIZE}px`;
crosswordGridDiv.style.height = `${GRID_ROWS * CELL_SIZE}px`;

let grid = [];
let currentCellElement = null; // To store the cell being edited

function initializeGrid() {
  crosswordGridDiv.innerHTML = "";
  grid = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < GRID_COLS; c++) {
      const cellElement = document.createElement("div");
      cellElement.classList.add("grid-cell");
      cellElement.dataset.row = r;
      cellElement.dataset.col = c;

      cellElement.addEventListener("click", handleCellClick);

      crosswordGridDiv.appendChild(cellElement);

      grid[r][c] = {
        type: 0, // 0: inactive, 1: active-char, 2: black-boundary
        char: "",
        element: cellElement,
      };
    }
  }
  puzzleContainer.style.display = "none";
  crosswordGridDiv.style.display = "grid";
  document.querySelector(".controls").style.display = "flex";
}

function handleCellClick(event) {
  const cellElement = event.target;
  const row = parseInt(cellElement.dataset.row);
  const col = parseInt(cellElement.dataset.col);
  const cellData = grid[row][col];

  currentCellElement = cellElement; // Store the clicked cell

  // Pre-fill modal based on current cell state
  charInputField.value = cellData.char;
  if (cellData.type === 1) {
    // Active Character
    radioActiveChar.checked = true;
    charInputField.style.display = "block"; // Show char input for active cells
  } else if (cellData.type === 2) {
    // Black Boundary
    radioBlackBoundary.checked = true;
    charInputField.style.display = "none"; // Hide char input for black cells
  } else {
    // Inactive (default to active char when opening form for new selection)
    radioActiveChar.checked = true;
    charInputField.style.display = "block";
    charInputField.value = ""; // Clear char input for new inactive cells
  }

  charInputModal.style.display = "flex"; // Show the modal
  charInputField.focus(); // Focus the input field
  charInputField.select(); // Select existing text if any
}

// Event listener for radio button changes within the modal
document.querySelectorAll('input[name="cellType"]').forEach((radio) => {
  radio.addEventListener("change", (event) => {
    if (event.target.value === "active-char") {
      charInputField.style.display = "block";
      charInputField.focus();
      charInputField.select();
    } else {
      charInputField.style.display = "none";
      charInputField.value = ""; // Clear char input if switching to black boundary
    }
  });
});

// Event listeners for the modal buttons
saveCharBtn.addEventListener("click", () => {
  if (currentCellElement) {
    const row = parseInt(currentCellElement.dataset.row);
    const col = parseInt(currentCellElement.dataset.col);
    const cellData = grid[row][col];

    const selectedType = document.querySelector(
      'input[name="cellType"]:checked'
    ).value;

    // Reset classes first
    currentCellElement.classList.remove("active-char", "black-boundary");
    currentCellElement.textContent = "";
    cellData.char = "";

    if (selectedType === "active-char") {
      cellData.type = 1;
      currentCellElement.classList.add("active-char");
      const char = charInputField.value.toUpperCase().charAt(0) || "";
      cellData.char = char;
      currentCellElement.textContent = char;
    } else if (selectedType === "black-boundary") {
      cellData.type = 2;
      currentCellElement.classList.add("black-boundary");
      // Black cells don't have characters
    }
  }
  charInputModal.style.display = "none";
  charInputField.value = "";
  currentCellElement = null;
});

cancelCharBtn.addEventListener("click", () => {
  // Simply close the modal without changing the cell's state
  charInputModal.style.display = "none";
  charInputField.value = "";
  currentCellElement = null;
});

deleteCellBtn.addEventListener("click", () => {
  // New delete/inactive button logic
  if (currentCellElement) {
    const row = parseInt(currentCellElement.dataset.row);
    const col = parseInt(currentCellElement.dataset.col);
    const cellData = grid[row][col];

    cellData.type = 0; // Set to inactive
    cellData.char = ""; // Clear char
    currentCellElement.classList.remove("active-char", "black-boundary"); // Remove all classes
    currentCellElement.textContent = ""; // Clear text
  }
  charInputModal.style.display = "none";
  charInputField.value = "";
  currentCellElement = null;
});

// Allow hitting Enter to save in the modal
charInputField.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    saveCharBtn.click();
  }
});

resetGridBtn.addEventListener("click", () => {
  initializeGrid();
  alert("Grid reset! Start cutting a new shape.");
});

confirmShapeBtn.addEventListener("click", () => {
  const activeCells = [];
  let minRow = GRID_ROWS,
    maxRow = -1,
    minCol = GRID_COLS,
    maxCol = -1;

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const cell = grid[r][c];
      if (cell.type === 1 || cell.type === 2) {
        // Include both active and black cells
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

window.initializeSetupGrid = initializeGrid;
