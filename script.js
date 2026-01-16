const $ = document.querySelector.bind(document);

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
let gameWin = false; // Indica si el jugador ha ganado

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
  if (timer) clearInterval(timer);

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

  // Difficulty Selectors
  $selectors.querySelectorAll(".selector").forEach((selector) => {
    selector.addEventListener("click", (event) => {
      // Find the closest selector element (in case click hits a child)
      const target = event.currentTarget;
      switch (target.id) {
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

  document.addEventListener("keydown", (e) => {
    playSound(keyboardKeySound);
    if (e.key !== "Enter") return;

    // Initial Start -> Go to Difficulty
    if (e.key === "Enter" && !gameStarted && !currentDifficulty) {
      getDifficulty();
      return;
    }

    // Win/Lose Screen -> Restart
    if (e.key === "Enter" && (!gameStarted || gameWin) && currentDifficulty) {
      $gameWinScreen.style.display = "none";
      $gameOverScreen.style.display = "none";
      $gameScreen.style.display = "none";
      $initialScreen.style.display = "flex";

      currentDifficulty = null;
      gameStarted = false;
      gameWin = false;
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
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
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
  // Ignore clicks if game ended
  if (!gameStarted || gameWin) return;

  const cellData = board[event.target.dataset.y][event.target.dataset.x];
  if (cellData.element.classList.contains
    // You must unflag first to reveal a flagged non-virus cell
    ("flagged") && !cellData.isVirus) {

    firewallCount++;
    cellData.element.classList.remove("flagged");
    cellData.isFlagged = false;
    revealCell(cellData);
    $("#firewall-count").textContent = firewallCount;
    checkWin();
    return;
  }

  if (cellData.isFlagged) return; // Protect flagged cells from accidental clicks 

  if (cellData.isVirus) {
    gameOver();
    return;
  }
  revealCell(cellData);

  checkWin();
}

function handleCellRightClick(event) {
  event.preventDefault();
  if (!gameStarted || gameWin) return;

  playSound(clickSound);
  if (event.target.classList.contains("revealed")) {
    return;
  }
  const cellData = board[event.target.dataset.y][event.target.dataset.x];

  // Toggle Flag
  if (!cellData.isFlagged) {
    if (firewallCount === 0) return; // Cannot flag if no flags left
    cellData.isFlagged = true;
    cellData.element.classList.add("flagged");
    cellData.element.innerHTML = "⛨";
    firewallCount--;
  } else {
    cellData.isFlagged = false;
    cellData.element.classList.remove("flagged");
    cellData.element.innerHTML = "";
    firewallCount++;
  }

  $("#firewall-count").textContent = firewallCount;

  checkWin();
}

function revealCell(cellData) {
  if (cellData.isRevealed || cellData.isFlagged) return;

  cellData.element.classList.add("revealed");
  cellData.isRevealed = true;

  if (cellData.isVirus) {
    cellData.element.innerHTML = "✹";
    return;
  }

  if (cellData.proximity === 0) {
    cellData.element.innerHTML = "";
    const neighbors = getNeighbors(cellData.x, cellData.y);
    for (const neighbor of neighbors) {
      if (!neighbor.isRevealed) {
        revealCell(neighbor);
      }
    }
  } else {
    cellData.element.innerHTML = cellData.proximity;
  }
}

function checkWin() {
  // Win Condition: All non-virus cells are revealed.
  let allSafeCellsRevealed = true;
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      const cell = board[y][x];
      if (!cell.isVirus && !cell.isRevealed) {
        allSafeCellsRevealed = false;
        break;
      }
    }
    if (!allSafeCellsRevealed) break;
  }

  if (allSafeCellsRevealed) {
    endGame();
  }
}

function gameOver() {
  playSound(gameOverSound);
  $gameGrid.querySelectorAll(".cell").forEach((cell) => {
    const cellData = board[cell.dataset.y][cell.dataset.x];
    if (cellData.isVirus && !cellData.isFlagged) {
      cellData.element.classList.add("revealed");
      cellData.element.innerHTML = "✹";
    }
  });

  if (timer) clearInterval(timer);

  $gameScreen.style.opacity = ".36";
  gameStarted = false; // Stop interactions
  $gameOverScreen.style.display = "flex";
  // Wait for Enter key (handled in initEvents)
}

function endGame() {
  playSound(winSound);
  gameWin = true; // Set win state

  // Reveal all viruses
  if (timer) clearInterval(timer);
  $winTime.textContent = time;
  $gameScreen.style.opacity = ".36";
  $gameWinScreen.style.display = "flex";
}
