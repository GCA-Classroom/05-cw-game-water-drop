const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const gameContainer = document.getElementById("game-container");
const resultMessage = document.getElementById("result-message");

let gameRunning = false;
let dropMaker;
let timerInterval;
let score = 0;
let timeLeft = 30;

const winMessages = [
  "You made every drop count! Clean water wins!",
  "Amazing work! You caught enough drops to bring hope.",
  "Victory! Your water-saving skills are on brand."
];

const loseMessages = [
  "Almost there — try again to reach 20 drops!",
  "Nice attempt! Keep practicing to catch more water.",
  "The water needs you again. Go for a stronger round!"
];

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

function startGame() {
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timeLeft = 30;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  resultMessage.textContent = "";
  startBtn.textContent = "Playing...";
  startBtn.disabled = true;
  restartBtn.disabled = false;
  gameContainer.classList.remove("game-over");

  document.querySelectorAll(".water-drop").forEach((drop) => drop.remove());

  dropMaker = setInterval(createDrop, 900);
  timerInterval = setInterval(updateTimer, 1000);
}

function restartGame() {
  if (gameRunning) {
    clearInterval(dropMaker);
    clearInterval(timerInterval);
    gameRunning = false;
  }

  startGame();
}

function updateTimer() {
  timeLeft -= 1;
  timeEl.textContent = timeLeft;

  if (timeLeft <= 0) {
    endGame();
  }
}

function createDrop() {
  const drop = document.createElement("div");
  drop.className = "water-drop";

  const initialSize = 48;
  const sizeMultiplier = Math.random() * 0.8 + 0.6;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * Math.max(gameWidth - size, 0);
  drop.style.left = `${xPosition}px`;

  drop.style.animationDuration = `${3.5 + Math.random() * 1.2}s`;

  drop.addEventListener("click", () => {
    if (!gameRunning) return;

    score += 1;
    scoreEl.textContent = score;
    drop.classList.add("caught");
    drop.remove();
  });

  drop.addEventListener("animationend", () => {
    drop.remove();
  });

  gameContainer.appendChild(drop);
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  startBtn.textContent = "Play Again";
  startBtn.disabled = false;
  restartBtn.disabled = false;
  timeEl.textContent = 0;

  document.querySelectorAll(".water-drop").forEach((drop) => drop.remove());

  const messages = score >= 20 ? winMessages : loseMessages;
  const chosenMessage = messages[Math.floor(Math.random() * messages.length)];
  const resultText = score >= 20
    ? `You scored ${score} drops! ${chosenMessage}`
    : `You scored ${score} drops. ${chosenMessage}`;

  resultMessage.textContent = resultText;
  gameContainer.classList.add("game-over");
}
