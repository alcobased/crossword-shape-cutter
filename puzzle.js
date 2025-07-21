// public/puzzle.js

console.log("puzzle.js loaded");

// const finishCuttingBtn = document.getElementById("finishCuttingBtn");
// const puzzleContainer = document.getElementById("puzzleContainer");
const solutionArea = document.getElementById("solutionArea");
const shapeBank = document.getElementById("shapeBank");

// const crosswordGridDiv = document.getElementById("crosswordGrid"); // Needed to hide
const controlsDiv = document.querySelector(".controls"); // Needed to hide

let draggedItem = null;
let offsetX, offsetY;

// Function to make a shape draggable
function makeDraggable(element) {
  element.addEventListener("dragstart", (e) => {
    draggedItem = element;
    const rect = element.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    setTimeout(() => {
      element.style.opacity = "0.5";
    }, 0);
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

// Allow dropping onto the solution area (no change needed here for snapping)
solutionArea.addEventListener("dragover", (e) => {
  e.preventDefault();
});

solutionArea.addEventListener("drop", (e) => {
  e.preventDefault();
  if (draggedItem) {
    const dropAreaRect = solutionArea.getBoundingClientRect();

    let newX = e.clientX - dropAreaRect.left - offsetX;
    let newY = e.clientY - dropAreaRect.top - offsetY;

    const CELL_UNIT_SIZE = 30; // Match the width/height of .puzzle-cell

    newX = Math.round(newX / CELL_UNIT_SIZE) * CELL_UNIT_SIZE;
    newY = Math.round(newY / CELL_UNIT_SIZE) * CELL_UNIT_SIZE;

    draggedItem.style.left = `${newX}px`;
    draggedItem.style.top = `${newY}px`;
    draggedItem.style.position = "absolute"; // Ensure it's absolute here

    if (draggedItem.parentNode !== solutionArea) {
      solutionArea.appendChild(draggedItem);
    }
  }
});

// Allow dropping onto the shape bank
shapeBank.addEventListener("dragover", (e) => {
  e.preventDefault();
});

shapeBank.addEventListener("drop", (e) => {
  e.preventDefault();
  if (draggedItem) {
    const dropAreaRect = shapeBank.getBoundingClientRect(); // Get shapeBank's rect

    // Calculate position relative to shapeBank's top-left
    let newX = e.clientX - dropAreaRect.left - offsetX;
    let newY = e.clientY - dropAreaRect.top - offsetY;

    // Optional: Constrain within shape bank boundaries if desired
    // You might want to add some padding so shapes don't go exactly to the edge
    const SHAPE_PAD = 10; // Padding from bank edges
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
    draggedItem.style.position = "absolute"; // Ensure it's absolute for free placement

    if (draggedItem.parentNode !== shapeBank) {
      shapeBank.appendChild(draggedItem);
    }
  }
});

// Finish cutting and load puzzle button: LOAD FROM LOCALSTORAGE
finishCuttingBtn.addEventListener("click", () => {
  // Removed 'async' as no fetch is needed
  // --- LOCALSTORAGE LOGIC START ---
  let shapes = JSON.parse(localStorage.getItem("crosswordShapes")) || [];
  // --- LOCALSTORAGE LOGIC END ---

  if (shapes.length === 0) {
    alert("No shapes saved yet! Please cut some shapes first.");
    return;
  }

  shapeBank.innerHTML = "<h2>Shape Bank</h2>";
  solutionArea.innerHTML = "<h2>Solution Area</h2>";

  crosswordGridDiv.style.display = "none";
  controlsDiv.style.display = "none";

  puzzleContainer.style.display = "flex";

  let currentX = 10;
  let currentY = 50;
  const SPACING_X = 10;
  const SPACING_Y = 10;
  // ClientWidth might be 0 initially if element is hidden, so get it on demand or use a fallback
  // For initial load, make sure shapeBank is displayed for correct clientWidth
  // Or set MAX_ROW_WIDTH to a reasonable default and adjust if needed
  const MAX_ROW_WIDTH =
    shapeBank.clientWidth > 0 ? shapeBank.clientWidth - 20 : 250 - 20;

  shapes.forEach((shape) => {
    const shapeElement = document.createElement("div");
    shapeElement.classList.add("puzzle-shape");
    shapeElement.setAttribute("draggable", "true");
    shapeElement.setAttribute("id", `shape-${shape.id}`); // Keep ID for potential future use

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
});
