const $ = document.querySelector.bind(document);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const clickSound = new Audio("./sounds/clickSound.wav");
clickSound.volume = 0.4;

const gameOverSound = new Audio("./sounds/gameOverSound.wav");
gameOverSound.volume = 0.4;

const winSound = new Audio("./sounds/gameWinSound.wav");
winSound.volume = 0.4;

const keyboardKeySound = new Audio("./sounds/keyboardKeySound.wav");
keyboardKeySound.volume = 0.4;

const $initialScreen = $(".initial-screen");
const $gameScreen = $(".game-screen");
const $gameGrid = $(".grid");
const $startInput = $("#start");
const $time = $("#time");
const $score = $(".score");
const $gameOverScreen = $(".game-over-screen");
const $gameWinScreen = $(".game-win-screen");
const $winTime = $("#win-time");
const $difficultyScreen = $(".game-difficulty-screen");
const $selectors = $(".selectors");
const $easy = $("#easy");
const $normal = $("#normal");
const $hard = $("#hard");

let gameStarted = false; // Indica si el juego ha comenzado

let virusCount = 0; // Indica el número de virus
let firewallCount = 0; // Indica el número de  firewall que se pueden usar
let time = 0; // Indica el tiempo
let timer; // Indica el timerd

let VIRUS_PROBABILITY = 0; // Indica la probabilidad de que un virus aparezca
let VIRUS_MAX_PROXIMITY = 0; // Indica la cuantos virus pueden haber juntos.

let BOARD_SIZE = 0;
let board = []; // Matriz del tablero

const difficultyTypes = {
  easy: "easy",
  normal: "normal",
  hard: "hard",
};

const DIFFICULTIES = {
  easy: {
    id: "easy",
    virusProbability: 20,
    virusMaxProximity: 3,
    boardSize: 8,
  },
  normal: {
    id: "normal",
    virusProbability: 40,
    virusMaxProximity: 5,
    boardSize: 12,
  },
  hard: {
    id: "hard",
    virusProbability: 70,
    virusMaxProximity: 5,
    boardSize: 16,
  },
};

let currentDifficulty;

initEvents();

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

function startGame(difficulty) {
  $initialScreen.style.display = "none";
  $gameOverScreen.style.display = "none";
  $gameScreen.style.display = "flex";
  $gameScreen.style.opacity = "1";
  time = 0;
  $time.textContent = time;
  VIRUS_PROBABILITY = difficulty.virusProbability;
  VIRUS_MAX_PROXIMITY = difficulty.virusMaxProximity;
  BOARD_SIZE = difficulty.boardSize;

  generateBoard();
  timer = setInterval(() => {
    time++;
    $("#time").textContent = time;
  }, 1000);
}
function initEvents() {
  document.addEventListener("keydown", (e) => {
    playSound(keyboardKeySound);
    if (e.key === "Enter" && !gameStarted && !currentDifficulty) {
      getDifficulty();
      return;
    }
    if (e.key === "Enter" && !gameStarted && currentDifficulty) {
      startGame(currentDifficulty);
      return;
    }
    if (e.key === "Enter" && gameStarted && currentDifficulty) {
      $gameWinScreen.style.display = "none";
      $gameScreen.style.display = "none";
      $initialScreen.style.display = "flex";
      currentDifficulty = null;
      gameStarted = false;
      return;
    }
    
    
  });
  document.addEventListener("click", () => {
    playSound(clickSound);
  });
}

function getDifficulty() {
  $difficultyScreen.style.display = "flex";
  $initialScreen.style.display = "none";
  $selectors.querySelectorAll(".selector").forEach((selector) => {
    selector.addEventListener("click", (event) => {
      switch (event.target.id) {
        case difficultyTypes.easy:
          currentDifficulty = DIFFICULTIES.easy;
          break;
        case difficultyTypes.normal:
          currentDifficulty = DIFFICULTIES.normal;
          break;
        case difficultyTypes.hard:
          currentDifficulty = DIFFICULTIES.hard;
          break;
      }
      if (currentDifficulty) {
        $difficultyScreen.style.display = "none";
        startGame(currentDifficulty);
        gameStarted = true;
      }
    });
  });
  $document.addEventListener("click", () => {
    playSound(clickSound);
  });
}

function generateBoard() {
  $gameGrid.innerHTML = ""; // Limpiar tablero anterior
  board = []; // Resetear matriz
  virusCount = 0;

  $gameGrid.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 1fr)`;
  $gameGrid.style.gridTemplateRows = `repeat(${BOARD_SIZE}, 1fr)`;

  // Generar matriz y celdas
  for (let y = 0; y < BOARD_SIZE; y++) {
    const row = [];
    for (let x = 0; x < BOARD_SIZE; x++) {
      const $cell = document.createElement("li");
      $cell.classList.add("cell", "neon-orange-cell"); // Añadir clase base y estilo neon

      const dice = Math.random() * 100;
      let isVirus = false;

      $cell.addEventListener("click", handleCellClick);
      $cell.addEventListener("auxclick", handleCellRightClick);
      $cell.addEventListener("contextmenu", (e) => e.preventDefault());
      

      if (dice < VIRUS_PROBABILITY) {
        $cell.classList.add("virus");
        isVirus = true;
        virusCount++;
      }

      $cell.dataset.x = x;
      $cell.dataset.y = y;
      $gameGrid.appendChild($cell);

      row.push({
        element: $cell,
        x: x,
        y: y,
        isVirus: isVirus,
      });
    }
    board.push(row);
  }

  // Verificar proximidad excesiva de virus (post-generación)
  // Nota: Iteramos para corregir aglomeraciones
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cellData = board[y][x];
      let proximity = countVirusNeighbors(x, y);

      if (proximity > VIRUS_MAX_PROXIMITY) {
        // Reducir la densidad quitando virus de los vecinos
        const neighbors = getNeighbors(x, y);
        for (const neighbor of neighbors) {
          if (neighbor.isVirus && proximity > VIRUS_MAX_PROXIMITY) {
            neighbor.isVirus = false;
            neighbor.element.classList.remove("virus");
            virusCount--;
            proximity--;
          }
        }
      }
    }
  }

  // Calcular proximidad final y mostrarla
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cellData = board[y][x];
      if (cellData.isVirus) continue;

      const proximity = countVirusNeighbors(x, y);
      cellData.proximity = proximity;
      cellData.element.dataset.virusProximity = proximity;
    }
  }
  firewallCount = virusCount;
  $("#firewall-count").textContent = firewallCount;
}

function getNeighbors(x, y) {
  const neighbors = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;

      const nx = x + dx;
      const ny = y + dy;

      // Verificar limites
      if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
        neighbors.push(board[ny][nx]);
      }
    }
  }
  return neighbors;
}

function countVirusNeighbors(x, y) {
  const neighbors = getNeighbors(x, y);
  return neighbors.filter((n) => n.isVirus).length;
}

function handleCellClick(event) {
  const cellData = board[event.target.dataset.y][event.target.dataset.x];
  if (cellData.element.classList.contains("flagged") && !cellData.isVirus) {
    firewallCount++;
    cellData.element.classList.remove("flagged");
    revealCell(cellData);
    $("#firewall-count").textContent = firewallCount;
    return;
  }
  if (cellData.isVirus) {
    gameOver();
    return;
  }
  revealCell(cellData);

  checkWin();
}

function handleCellRightClick(event) {
  event.preventDefault();
  playSound(clickSound);
  if (event.target.classList.contains("revealed")) {
    return;
  }
  const cellData = board[event.target.dataset.y][event.target.dataset.x];
  if (firewallCount === 0 && !cellData.isFlagged) {
    return;
  }
  cellData.isFlagged = !cellData.isFlagged;
  cellData.element.classList.toggle("flagged");
  cellData.element.innerHTML = cellData.isFlagged ? "⛨" : "";

  if (cellData.element.classList.contains("virus") && cellData.isFlagged) {
    virusCount--;
    firewallCount--;
    $("#firewall-count").textContent = firewallCount;
    console.log(`virusCount: ${virusCount}`);
    return;
  }
  if (cellData.element.classList.contains("virus") && !cellData.isFlagged) {
    virusCount++;
    firewallCount++;
    console.log(`virusCount: ${virusCount}`);
    $("#firewall-count").textContent = firewallCount;
    return;
  }
  if (cellData.element.classList.contains("flagged") && cellData.isFlagged) {
    firewallCount--;
    $("#firewall-count").textContent = firewallCount;
    return;
  }
  firewallCount++;
  $("#firewall-count").textContent = firewallCount;
  checkWin();
}

function revealCell(cellData) {
  if (
    cellData.element.classList.contains("flagged") &&
    cellData.element.classList.contains("non-virus")
  ) {
    cellData.element.classList.remove("revealed");
    return;
  }

  cellData.element.classList.add("revealed");

  if (cellData.proximity === 0) {
    cellData.isRevealed = true;
    cellData.element.innerHTML = "";
    const neighbors = getNeighbors(cellData.x, cellData.y);
    for (const neighbor of neighbors) {
      if (!neighbor.isRevealed && !neighbor.isVirus) {
        neighbor.isRevealed = true;
        revealCell(neighbor);
      }
    }
    return;
  }
  if (cellData.isVirus) {
    cellData.element.innerHTML = "✹";
    cellData.isRevealed = true;
    return;
  }

  cellData.element.innerHTML = cellData.proximity;
  cellData.isRevealed = true;
}

function checkWin() {
  $gameGrid.querySelectorAll(".cell").forEach((cell) => {
    const cellData = board[cell.dataset.y][cell.dataset.x];

    if (!cellData.isRevealed) {
      return;
    }
  });

  if (virusCount === 0) {
    endGame();
    return;
  }
}

function gameOver() {
  playSound(gameOverSound);
  $gameGrid.querySelectorAll(".cell").forEach((cell) => {
    const cellData = board[cell.dataset.y][cell.dataset.x];
    console.log(cellData.isVirus, cellData.isFlagged);

    if (!cellData.isRevealed && !cellData.isFlagged) {
      revealCell(cellData);
    }
  });

  clearInterval(timer);

  $gameScreen.style.opacity = ".36";

  gameStarted = false;
  $gameOverScreen.style.display = "flex";
}

function endGame() {
  playSound(winSound);
  $gameGrid.querySelectorAll(".cell").forEach((cell) => {
    const cellData = board[cell.dataset.y][cell.dataset.x];

    if (!cellData.isRevealed) {
      revealCell(cellData);
    }
  });

  clearInterval(timer);
  $winTime.textContent = time;
  $gameScreen.style.opacity = ".45";
  gameStarted = false;
  $gameWinScreen.style.display = "flex";
}
