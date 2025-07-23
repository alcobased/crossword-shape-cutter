// public/puzzle.js

// Access shared elements and constants from the global App object
const solutionArea = document.getElementById("solutionArea"); // still need to get these specific puzzle elements
const shapeBank = document.getElementById("shapeBank");
const editSolutionGridBtn = document.getElementById("editSolutionGridBtn");
const solutionGridEditor = document.getElementById("solutionGridEditor");

// Access all shared elements and constants from App
const App = window.App; // Get the global App object

let draggedItem = null;
let offsetX, offsetY;

let solutionGridState = []; // Specific to puzzle.js
let currentSolutionCellElement = null; // Specific to puzzle.js

// Constants for the solution grid dimensions (match CSS and puzzle-cell size)
// These could also be part of the App object if they were shared elsewhere
const SOLUTION_GRID_COLS = 15;
const SOLUTION_GRID_ROWS = 10;
const SOLUTION_CELL_SIZE = 30;

// --- Solution Grid Editor Functions ---

function initializeSolutionGridEditor() {
  solutionGridEditor.innerHTML = "";
  solutionGridEditor.style.gridTemplateColumns = `repeat(${SOLUTION_GRID_COLS}, ${SOLUTION_CELL_SIZE}px)`;
  solutionGridEditor.style.gridTemplateRows = `repeat(${SOLUTION_GRID_ROWS}, ${SOLUTION_CELL_SIZE}px)`;
  solutionGridEditor.style.width = `${
    SOLUTION_GRID_COLS * SOLUTION_CELL_SIZE
  }px`;
  solutionGridEditor.style.height = `${
    SOLUTION_GRID_ROWS * SOLUTION_CELL_SIZE
  }px`;

  solutionGridState =
    JSON.parse(localStorage.getItem("solutionGridState")) || [];
  if (solutionGridState.length === 0) {
    for (let r = 0; r < SOLUTION_GRID_ROWS; r++) {
      solutionGridState[r] = [];
      for (let c = 0; c < SOLUTION_GRID_COLS; c++) {
        solutionGridState[r][c] = {
          type: 0,
          char: "",
        };
      }
    }
  }

  for (let r = 0; r < SOLUTION_GRID_ROWS; r++) {
    for (let c = 0; c < SOLUTION_GRID_COLS; c++) {
      const cellData = solutionGridState[r][c];
      const cellElement = document.createElement("div");
      cellElement.classList.add("grid-cell");
      cellElement.dataset.row = r;
      cellElement.dataset.col = c;

      if (cellData.type === 1) {
        cellElement.classList.add("active-char");
        cellElement.textContent = cellData.char;
      } else if (cellData.type === 2) {
        cellElement.classList.add("black-boundary");
      }

      cellElement.addEventListener("click", handleSolutionCellClick);
      solutionGridEditor.appendChild(cellElement);
    }
  }
}

function handleSolutionCellClick(event) {
  const cellElement = event.target;
  const row = parseInt(cellElement.dataset.row);
  const col = parseInt(cellElement.dataset.col);
  const cellData = solutionGridState[row][col];

  currentSolutionCellElement = {
    element: cellElement,
    data: cellData,
    row,
    col,
  };

  App.charInputField.value = cellData.char; // Access App.charInputField
  if (cellData.type === 1) {
    App.radioActiveChar.checked = true; // Access App.radioActiveChar
    App.charInputField.style.display = "block";
  } else if (cellData.type === 2) {
    App.radioBlackBoundary.checked = true; // Access App.radioBlackBoundary
    App.charInputField.style.display = "none";
  } else {
    App.radioActiveChar.checked = true;
    App.charInputField.style.display = "block";
    App.charInputField.value = "";
  }

  App.charInputModal.style.display = "flex"; // Access App.charInputModal
  App.charInputField.focus();
  App.charInputField.select();
}

// Event listener for radio button changes within the modal (now specific to App scope)
// This listener needs to be outside the global scope check if it's the only one
// or properly attached to the App object's event handling.
// For now, it remains as is, working with App.charInputField etc.
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

// Event listeners for the modal buttons (now apply to solution grid or setup grid based on context)
App.saveCharBtn.addEventListener("click", () => {
  // Determine if we are saving for setup grid or solution grid
  if (App.currentCellElement) {
    // Logic for setup grid (from setup.js)
    const row = parseInt(App.currentCellElement.dataset.row);
    const col = parseInt(App.currentCellElement.dataset.col);
    const cellData = App.grid[row][col]; // Access App.grid

    const selectedType = document.querySelector(
      'input[name="cellType"]:checked'
    ).value;

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
  } else if (currentSolutionCellElement) {
    // Logic for solution grid (from puzzle.js)
    const cellData = currentSolutionCellElement.data;
    const cellElement = currentSolutionCellElement.element;
    const row = currentSolutionCellElement.row;
    const col = currentSolutionCellElement.col;

    const selectedType = document.querySelector(
      'input[name="cellType"]:checked'
    ).value;

    cellElement.classList.remove("active-char", "black-boundary");
    cellElement.textContent = "";
    cellData.char = "";

    if (selectedType === "active-char") {
      cellData.type = 1;
      cellElement.classList.add("active-char");
      const char = App.charInputField.value.toUpperCase().charAt(0) || "";
      cellData.char = char;
      cellElement.textContent = char;
    } else if (selectedType === "black-boundary") {
      cellData.type = 2;
      cellElement.classList.add("black-boundary");
    }
    solutionGridState[row][col] = { ...cellData };
    localStorage.setItem(
      "solutionGridState",
      JSON.stringify(solutionGridState)
    );
  }
  App.charInputModal.style.display = "none";
  App.charInputField.value = "";
  App.currentCellElement = null; // Clear setup cell reference
  currentSolutionCellElement = null; // Clear solution cell reference
});

App.cancelCharBtn.addEventListener("click", () => {
  // If canceled from setup grid, revert the cell state
  if (App.currentCellElement) {
    const row = parseInt(App.currentCellElement.dataset.row);
    const col = parseInt(App.currentCellElement.dataset.col);
    const cellData = App.grid[row][col];

    if (cellData.type === 1 && App.currentCellElement.textContent === "") {
      cellData.type = 0;
      App.currentCellElement.classList.remove("active-char");
    }
  }
  // For both setup and solution: simply close modal, state remains unchanged if already set
  App.charInputModal.style.display = "none";
  App.charInputField.value = "";
  App.currentCellElement = null;
  currentSolutionCellElement = null;
});

App.deleteCellBtn.addEventListener("click", () => {
  if (App.currentCellElement) {
    // Logic for setup grid
    const row = parseInt(App.currentCellElement.dataset.row);
    const col = parseInt(App.currentCellElement.dataset.col);
    const cellData = App.grid[row][col];

    cellData.type = 0;
    cellData.char = "";
    App.currentCellElement.classList.remove("active-char", "black-boundary");
    App.currentCellElement.textContent = "";
  } else if (currentSolutionCellElement) {
    // Logic for solution grid
    const cellData = currentSolutionCellElement.data;
    const cellElement = currentSolutionCellElement.element;
    const row = currentSolutionCellElement.row;
    const col = currentSolutionCellElement.col;

    cellData.type = 0;
    cellData.char = "";
    cellElement.classList.remove("active-char", "black-boundary");
    cellElement.textContent = "";

    solutionGridState[row][col] = { ...cellData };
    localStorage.setItem(
      "solutionGridState",
      JSON.stringify(solutionGridState)
    );
  }
  App.charInputModal.style.display = "none";
  App.charInputField.value = "";
  App.currentCellElement = null;
  currentSolutionCellElement = null;
});

App.charInputField.addEventListener("keypress", (e) => {
  // Access App.charInputField
  if (e.key === "Enter") {
    App.saveCharBtn.click(); // Access App.saveCharBtn
  }
});

// --- Drag & Drop Logic ---
function makeDraggable(element) {
  element.addEventListener("dragstart", (e) => {
    if (solutionGridEditor.style.display === "none") {
      // Check solutionGridEditor
      draggedItem = element;
      const rect = element.getBoundingClientRect();
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      setTimeout(() => {
        element.style.opacity = "0.5";
      }, 0);
    } else {
      e.preventDefault();
    }
  });

  element.addEventListener("dragend", () => {
    setTimeout(() => {
      if (draggedItem) {
        draggedItem.style.opacity = "1";
      }
      draggedItem = null;
    }, 0);
  });
}

solutionArea.addEventListener("dragover", (e) => {
  e.preventDefault();
});

solutionArea.addEventListener("drop", (e) => {
  e.preventDefault();
  if (draggedItem) {
    const dropAreaRect = solutionArea.getBoundingClientRect();

    let newX = e.clientX - dropAreaRect.left - offsetX;
    let newY = e.clientY - dropAreaRect.top - offsetY;

    const CELL_UNIT_SIZE = 30;

    newX = Math.round(newX / CELL_UNIT_SIZE) * CELL_UNIT_SIZE;
    newY = Math.round(newY / CELL_UNIT_SIZE) * CELL_UNIT_SIZE;

    draggedItem.style.left = `${newX}px`;
    draggedItem.style.top = `${newY}px`;
    draggedItem.style.position = "absolute";

    if (draggedItem.parentNode !== solutionArea) {
      solutionArea.appendChild(draggedItem);
    }
  }
});

shapeBank.addEventListener("dragover", (e) => {
  e.preventDefault();
});

shapeBank.addEventListener("drop", (e) => {
  e.preventDefault();
  if (draggedItem) {
    const dropAreaRect = shapeBank.getBoundingClientRect();

    let newX = e.clientX - dropAreaRect.left - offsetX;
    let newY = e.clientY - dropAreaRect.top - offsetY;

    const SHAPE_PAD = 10;
    const shapeWidth = draggedItem.offsetWidth;
    const shapeHeight = draggedItem.offsetHeight;

    newX = Math.max(
      SHAPE_PAD,
      Math.min(newX, dropAreaRect.width - shapeWidth - SHAPE_PAD)
    );
    newY = Math.max(
      SHAPE_PAD,
      Math.min(newY, dropAreaRect.height - shapeHeight - SHAPE_PAD)
    );

    draggedItem.style.left = `${newX}px`;
    draggedItem.style.top = `${newY}px`;
    draggedItem.style.position = "absolute";

    if (draggedItem.parentNode !== shapeBank) {
      shapeBank.appendChild(draggedItem);
    }
  }
});

// --- Main App Flow Logic ---

App.finishCuttingBtn.addEventListener("click", () => {
  // Access App.finishCuttingBtn
  let shapes = JSON.parse(localStorage.getItem("crosswordShapes")) || [];

  if (shapes.length === 0) {
    alert("No shapes saved yet! Please cut some shapes first.");
    return;
  }

  // Resetting innerHTML will remove existing buttons, so re-create them carefully
  solutionArea.innerHTML = "<h2>Solution Area</h2>";
  shapeBank.innerHTML = "<h2>Shape Bank</h2>"; // Ensure shapeBank is also clean

  // Re-create the edit button and editor container (if you clear innerHTML)
  const newEditBtn = document.createElement("button");
  newEditBtn.id = "editSolutionGridBtn";
  newEditBtn.classList.add("edit-solution-btn");
  newEditBtn.textContent = "Edit Solution Grid";
  solutionArea.appendChild(newEditBtn);

  const newEditorDiv = document.createElement("div");
  newEditorDiv.id = "solutionGridEditor";
  newEditorDiv.classList.add("solution-grid-editor");
  solutionArea.appendChild(newEditorDiv);

  // Re-assign references to the newly created elements
  // We already have these as top-level consts in puzzle.js
  // but if they were deeply nested, you'd need to re-query them.
  // For this case, the top-level consts will point to the new elements naturally.

  // Attach event listener for the edit solution grid button
  newEditBtn.addEventListener("click", toggleSolutionGridEditor);

  App.crosswordGridDiv.style.display = "none"; // Access App.crosswordGridDiv
  App.controlsDiv = document.querySelector(".controls"); // Re-query controls as it's not in App scope if you didn't add it
  App.controlsDiv.style.display = "none";

  App.puzzleContainer.style.display = "flex"; // Access App.puzzleContainer

  let currentX = 10;
  let currentY = 50;
  const SPACING_X = 10;
  const SPACING_Y = 10;
  const MAX_ROW_WIDTH =
    shapeBank.clientWidth > 0 ? shapeBank.clientWidth - 20 : 250 - 20;

  shapes.forEach((shape) => {
    const shapeElement = document.createElement("div");
    shapeElement.classList.add("puzzle-shape");
    shapeElement.setAttribute("draggable", "true");
    shapeElement.setAttribute("id", `shape-${shape.id}`);

    let shapeMaxRow = 0;
    let shapeMaxCol = 0;
    shape.cells.forEach((cell) => {
      shapeMaxRow = Math.max(shapeMaxRow, cell.row);
      shapeMaxCol = Math.max(shapeMaxCol, cell.col);
    });

    for (let r = 0; r <= shapeMaxRow; r++) {
      for (let c = 0; c < shapeMaxCol + 1; c++) {
        const cellData = shape.cells.find(
          (cell) => cell.row === r && cell.col === c
        );
        const cellElement = document.createElement("span");
        cellElement.classList.add("puzzle-cell");

        if (cellData) {
          if (cellData.type === 1) {
            cellElement.textContent = cellData.char;
          } else if (cellData.type === 2) {
            cellElement.classList.add("black");
          }
        } else {
          cellElement.classList.add("inactive-cell");
        }
        shapeElement.appendChild(cellElement);
      }
      if (r < shapeMaxRow) {
        const br = document.createElement("br");
        shapeElement.appendChild(br);
      }
    }

    shapeBank.appendChild(shapeElement);

    shapeElement.style.position = "absolute";

    if (
      currentX + shapeElement.offsetWidth + SPACING_X > MAX_ROW_WIDTH &&
      currentX !== 10
    ) {
      currentX = 10;
      currentY += shapeElement.offsetHeight + SPACING_Y;
    }

    shapeElement.style.left = `${currentX}px`;
    shapeElement.style.top = `${currentY}px`;

    currentX += shapeElement.offsetWidth + SPACING_X;

    makeDraggable(shapeElement);
  });

  initializeSolutionGridEditor();
});

// Toggle Solution Grid Editor Visibility
function toggleSolutionGridEditor() {
  // Re-get element references here as they might have been overwritten by innerHTML
  const currentSolutionGridEditor =
    document.getElementById("solutionGridEditor");
  const currentEditSolutionGridBtn = document.getElementById(
    "editSolutionGridBtn"
  );

  const isEditorVisible = currentSolutionGridEditor.style.display === "grid";

  if (isEditorVisible) {
    currentSolutionGridEditor.style.display = "none";
    currentEditSolutionGridBtn.textContent = "Edit Solution Grid";
    solutionArea.classList.remove("editing");
  } else {
    currentSolutionGridEditor.style.display = "grid";
    currentEditSolutionGridBtn.textContent = "Done Editing";
    solutionArea.classList.add("editing");
  }
}
