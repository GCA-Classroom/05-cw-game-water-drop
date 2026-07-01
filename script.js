const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");
const gameContainer = document.getElementById("game-container");
const resultMessageSlot = document.getElementById("result-message-slot");
const difficultySelect = document.getElementById("difficulty-select");
const difficultyFeedback = document.getElementById("difficulty-feedback");

let gameRunning = false;
let dropMaker;
let timerInterval;
let score = 0;
let timeLeft = 30;
let selectedDifficulty = "normal";
let audioContext;

const difficultySettings = {
  easy: {
    dropInterval: 1200,
    minDropSpeed: 4.8,
    maxDropSpeed: 6,
    badDropChance: 0
  },
  normal: {
    dropInterval: 900,
    minDropSpeed: 3.5,
    maxDropSpeed: 4.7,
    badDropChance: 0
  },
  hard: {
    dropInterval: 650,
    minDropSpeed: 2.1,
    maxDropSpeed: 3,
    badDropChance: 0.3
  }
};

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
difficultySelect.addEventListener("change", changeDifficulty);

showDifficultyFeedback(selectedDifficulty);

function startGame() {
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timeLeft = 30;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  clearResultMessage();
  startBtn.textContent = "Playing...";
  startBtn.disabled = true;
  restartBtn.disabled = false;
  difficultySelect.disabled = true;
  gameContainer.classList.remove("game-over");

  document.querySelectorAll(".water-drop").forEach((drop) => drop.remove());

  const modeSettings = difficultySettings[selectedDifficulty];
  dropMaker = setInterval(createDrop, modeSettings.dropInterval);
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
  const modeSettings = difficultySettings[selectedDifficulty];
  const isBadDrop = Math.random() < modeSettings.badDropChance;
  drop.className = isBadDrop ? "water-drop bad-drop" : "water-drop";

  const initialSize = 48;
  const sizeMultiplier = Math.random() * 0.8 + 0.6;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * Math.max(gameWidth - size, 0);
  drop.style.left = `${xPosition}px`;

  const dropSpeedRange = modeSettings.maxDropSpeed - modeSettings.minDropSpeed;
  drop.style.animationDuration = `${modeSettings.minDropSpeed + Math.random() * dropSpeedRange}s`;

  // Use one capture handler so score updates exactly once per drop.
  function captureDrop(event) {
    if (!gameRunning || drop.dataset.captured === "true") return;

    event.preventDefault();
    drop.dataset.captured = "true";

    if (isBadDrop) {
      score = Math.max(0, score - 1);
    } else {
      score += 1;
    }

    scoreEl.textContent = score;
    playDropSound(isBadDrop);
    drop.remove();
  }

  // pointerdown fires earlier than click, so drops feel instant to tap/click.
  drop.addEventListener("pointerdown", captureDrop);
  // Keep click as a fallback for devices/browsers that do not fire pointer events.
  drop.addEventListener("click", captureDrop);

  drop.addEventListener("animationend", () => {
    drop.remove();
  });

  gameContainer.appendChild(drop);
}

function playDropSound(isBadDrop) {
  try {
    if (!audioContext) {
      audioContext = new window.AudioContext();
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(isBadDrop ? 240 : 760, now);
    oscillator.frequency.exponentialRampToValueAtTime(isBadDrop ? 180 : 540, now + 0.12);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.18, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.12);
  } catch (error) {
    // Keep gameplay running even if audio cannot be played.
  }
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  startBtn.textContent = "Play Again";
  startBtn.disabled = false;
  restartBtn.disabled = false;
  difficultySelect.disabled = false;
  timeEl.textContent = 0;

  document.querySelectorAll(".water-drop").forEach((drop) => drop.remove());

  const messages = score >= 20 ? winMessages : loseMessages;
  const chosenMessage = messages[Math.floor(Math.random() * messages.length)];
  const resultText = score >= 20
    ? `You scored ${score} drops! ${chosenMessage}`
    : `You scored ${score} drops. ${chosenMessage}`;

  showResultMessage(resultText);
  gameContainer.classList.add("game-over");
}

function clearResultMessage() {
  const existingMessage = document.getElementById("result-message");

  if (existingMessage) {
    existingMessage.remove();
  }
}

function showResultMessage(messageText) {
  clearResultMessage();

  // Build the dialog with DOM so it only appears after the game ends.
  const message = document.createElement("div");
  message.id = "result-message";
  message.className = "result-message";
  message.setAttribute("aria-live", "polite");
  message.textContent = messageText;
  resultMessageSlot.appendChild(message);
}

function changeDifficulty() {
  if (gameRunning) return;

  selectedDifficulty = difficultySelect.value;
  showDifficultyFeedback(selectedDifficulty);
}

function showDifficultyFeedback(difficulty) {
  const message = document.createElement("p");
  message.className = "difficulty-note";

  if (difficulty === "easy") {
    message.textContent = "Difficulty: Easy. Drops fall slower.";
  } else if (difficulty === "hard") {
    message.textContent = "Difficulty: Hard. Drops fall faster and black drops remove points.";
  } else {
    message.textContent = "Difficulty: Normal. Standard speed with regular drops.";
  }

  difficultyFeedback.innerHTML = "";
  difficultyFeedback.appendChild(message);
}
