// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let isPaused = false;
let dropMaker; // Will store our timer that creates drops regularly
let timerMaker;
let score = 0;
let timeLeft = 30;
let selectedMode = null;
let pointsPerClick = 1;

const modePoints = {
  easy: 5,
  medium: 3,
  hard: 1
};

const winningMessages = [
  "Great job! You kept the water flowing.",
  "You won! That was a strong save.",
  "Excellent work! The drops didn't stand a chance."
];

const losingMessages = [
  "Try again! You can catch more drops next time.",
  "Good effort! Keep practicing your splash skills.",
  "Almost there! Give it another shot."
];

const startButton = document.getElementById("start-btn");
const pauseButton = document.getElementById("pause-btn");
const resetButton = document.getElementById("reset-btn");
const gameContainer = document.getElementById("game-container");
const gameMessage = document.getElementById("game-message");
const modeLabel = document.getElementById("mode-label");
const startScreen = document.getElementById("start-screen");
const startScreenButton = document.getElementById("start-screen-btn");
const modeButtons = document.querySelectorAll(".mode-btn");

startButton.disabled = true;

function updateTime() {
  document.getElementById("time").textContent = timeLeft;
}

function updateScore() {
  document.getElementById("score").textContent = score;
}

function showScoreEffect(drop, points) {
  const gameContainer = document.getElementById("game-container");
  const effect = document.createElement("div");
  const dropRect = drop.getBoundingClientRect();
  const containerRect = gameContainer.getBoundingClientRect();

  effect.className = "score-fx";
  effect.textContent = `+${points}`;
  effect.style.left = `${dropRect.left - containerRect.left + dropRect.width / 2}px`;
  effect.style.top = `${dropRect.top - containerRect.top + dropRect.height / 2}px`;

  gameContainer.appendChild(effect);

  effect.addEventListener("animationend", () => {
    effect.remove();
  });
}

// Wait for button click to start the game
startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
resetButton.addEventListener("click", resetGame);
startScreenButton.addEventListener("click", startGame);

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const chosenMode = button.dataset.mode;
    const modeScoreValue = Number(button.dataset.points);

    selectedMode = chosenMode;
    pointsPerClick = modeScoreValue;
    modeLabel.textContent = `${capitalizeMode(selectedMode)} (+${pointsPerClick})`;
    startScreenButton.disabled = false;
    startButton.disabled = false;

    modeButtons.forEach((modeButton) => {
      const isSelected = modeButton.dataset.mode === selectedMode;
      modeButton.classList.toggle("selected", isSelected);
      modeButton.setAttribute("aria-checked", String(isSelected));
    });
  });
});

function capitalizeMode(mode) {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

function getRandomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

function showGameMessage(finalScore) {
  const isWinner = finalScore >= 20;
  const message = getRandomMessage(isWinner ? winningMessages : losingMessages);

  gameMessage.textContent = `${isWinner ? "You win!" : "Try again!"} ${message}`;
  gameMessage.className = isWinner ? "game-message win" : "game-message lose";
}

function clearGameMessage() {
  gameMessage.textContent = "";
  gameMessage.className = "";
}

function clearActiveDrops() {
  document.querySelectorAll(".water-drop, .score-fx").forEach((element) => element.remove());
}

function resetGame() {
  clearInterval(dropMaker);
  clearInterval(timerMaker);
  gameRunning = false;
  isPaused = false;
  score = 0;
  timeLeft = 30;

  updateScore();
  updateTime();
  clearGameMessage();
  clearActiveDrops();
  gameContainer.classList.remove("paused");
  startScreen.classList.remove("hidden");
  pauseButton.disabled = true;
  pauseButton.textContent = "Pause";
}

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;
  if (!selectedMode) return;

  gameRunning = true;
  isPaused = false;
  score = 0;
  timeLeft = 30;
  startScreen.classList.add("hidden");
  updateScore();
  updateTime();
  clearGameMessage();
  pauseButton.disabled = false;
  pauseButton.textContent = "Pause";

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);
  timerMaker = setInterval(() => {
    if (isPaused) return;

    timeLeft -= 1;
    updateTime();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  gameRunning = false;
  isPaused = false;
  clearInterval(dropMaker);
  clearInterval(timerMaker);
  pauseButton.disabled = true;
  pauseButton.textContent = "Pause";
  gameContainer.classList.remove("paused");
  clearActiveDrops();
  startScreen.classList.remove("hidden");
  showGameMessage(score);
}

function togglePause() {
  if (!gameRunning) return;

  isPaused = !isPaused;

  if (isPaused) {
    clearInterval(dropMaker);
    clearInterval(timerMaker);
    pauseButton.textContent = "Resume";
    gameContainer.classList.add("paused");
    return;
  }

  pauseButton.textContent = "Pause";
  gameContainer.classList.remove("paused");
  dropMaker = setInterval(createDrop, 1000);
  timerMaker = setInterval(() => {
    if (isPaused) return;

    timeLeft -= 1;
    updateTime();

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  gameContainer.appendChild(drop);

  drop.addEventListener("click", () => {
    if (!gameRunning || isPaused) return;
    score += pointsPerClick;
    updateScore();
    showScoreEffect(drop, pointsPerClick);
    drop.remove();
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    if (drop.isConnected) {
      drop.remove(); // Clean up drops that weren't caught
    }
  });
}
