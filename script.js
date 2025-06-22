// Variables to control game state
let gameRunning = false;
let dropMaker;
let timerInterval;
let score = 0;
let highScore = 0;
let misses = 0;
let timeLeft = 30; // seconds, can be changed for game length
const maxMisses = 5; // Optional: end game after too many misses

const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const gameContainer = document.getElementById("game-container");
const startBtn = document.getElementById("start-btn");
const titleScreen = document.getElementById("title-screen");
const gameUI = document.getElementById("game-ui");
const gameOverScreen = document.getElementById("game-over-screen");
const highScoreDisplay = document.getElementById("high-score");
const highScoreGameDisplay = document.getElementById("high-score-game");
const finalScoreDisplay = document.getElementById("final-score");
const finalHighScoreDisplay = document.getElementById("final-high-score");
const playAgainBtn = document.getElementById("play-again-btn");

// Show high score on title screen and in-game
function updateHighScore() {
  if (score > highScore) highScore = score;
  highScoreDisplay.textContent = highScore;
  highScoreGameDisplay.textContent = highScore;
  finalHighScoreDisplay.textContent = highScore;
}

function updateScore(amount) {
  score += amount;
  if (score < 0) score = 0;
  scoreDisplay.textContent = score;
}

function updateTime() {
  timeDisplay.textContent = timeLeft;
}

function showScreen(screen) {
  titleScreen.style.display = "none";
  gameUI.style.display = "none";
  gameOverScreen.style.display = "none";
  screen.style.display = "";
}

function startGame() {
  if (gameRunning) return;
  gameRunning = true;
  score = 0;
  misses = 0;
  timeLeft = 30;
  updateScore(0);
  updateTime();
  showScreen(gameUI);
  clearDrops();

  // Increase drop quantity: create a drop every 400ms
  dropMaker = setInterval(createDrop, 400);
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTime();
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function showConfetti() {
  const colors = ["#FFC907", "#2E9DF7", "#4FCB53", "#F5402C", "#FF902A", "#8BD1CB", "#F16061"];
  for (let i = 0; i < 60; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.width = "12px";
    confetti.style.height = "12px";
    confetti.style.borderRadius = "50%";
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.top = (window.innerHeight / 2) + "px";
    confetti.style.opacity = 0.8;
    confetti.style.pointerEvents = "none";
    confetti.style.zIndex = 2000;
    confetti.style.transition = "transform 1.2s cubic-bezier(.17,.67,.83,.67), opacity 1.2s";
    document.body.appendChild(confetti);

    // Animate confetti
    setTimeout(() => {
      confetti.style.transform = `translateY(${150 + Math.random() * 400}px) rotate(${Math.random() * 360}deg)`;
      confetti.style.opacity = 0;
    }, 10);

    // Remove after animation
    setTimeout(() => confetti.remove(), 1400);
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  updateHighScore();
  finalScoreDisplay.textContent = score;
  showScreen(gameOverScreen);
  showConfetti();
}

function clearDrops() {
  while (gameContainer.firstChild) {
    gameContainer.removeChild(gameContainer.firstChild);
  }
}

function createDrop() {
  if (!gameRunning) return;

  const drop = document.createElement("div");
  // 25% chance to be a polluted drop
  const isBad = Math.random() < 0.25;
  drop.className = "water-drop" + (isBad ? " bad-drop" : "");

  // Drop size
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Drop speed increases as time passes or score increases
  let speed = 4 - Math.min(2.5, score * 0.05 + (30 - timeLeft) * 0.03); // min 1.5s
  drop.style.animationDuration = `${speed}s`;

  // Click handler
  drop.addEventListener("click", (e) => {
    if (!gameRunning) return;
    if (isBad) {
      updateScore(-2);
      // drop.style.backgroundColor = "#F5402C"; // REMOVE or COMMENT OUT this line
      showSplash(e, "#F5402C");
      // Optionally: play negative sound
    } else {
      updateScore(1);
      drop.style.backgroundColor = "#4FCB53";
      showSplash(e, "#4FCB53");
      // Optionally: play positive sound
    }
    setTimeout(() => drop.remove(), 100);
  });

  gameContainer.appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    if (!drop.isConnected) return; // Already removed by click
    drop.remove();
    if (!isBad && gameRunning) {
      misses++;
      
    }
  });
}

function showSplash(e, color) {
  const splash = document.createElement("div");
  splash.className = "splash";
  splash.style.background = color;
  splash.style.width = splash.style.height = "40px";
  // Position splash at click
  const rect = gameContainer.getBoundingClientRect();
  splash.style.left = (e.clientX - rect.left - 20) + "px";
  splash.style.top = (e.clientY - rect.top - 20) + "px";
  gameContainer.appendChild(splash);
  setTimeout(() => splash.remove(), 300);
}

// UI event listeners
startBtn.addEventListener("click", () => {
  updateHighScore();
  showScreen(gameUI);
  startGame();
});
if (playAgainBtn) {
  playAgainBtn.addEventListener("click", () => {
    showScreen(gameUI);
    startGame();
  });
}

// CSS styles
const style = document.createElement('style');
style.textContent = `
body, html {
    font-family: 'Courier New', Courier, monospace;
}
`;
document.head.appendChild(style);
