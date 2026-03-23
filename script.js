// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timerInterval;
let score = 0;
let timeLeft = 30;

const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const gameContainer = document.getElementById("game-container");
const startButton = document.getElementById("start-btn");
const resultModal = document.getElementById("result-modal");
const resultMessage = document.getElementById("result-message");
const playAgainButton = document.getElementById("play-again-btn");
const confettiContainer = document.getElementById("confetti-container");
const difficultySelect = document.getElementById("difficulty");
const resultDifficultySelect = document.getElementById("result-difficulty");

const difficultyPollutionChance = {
  easy: 0,
  medium: 0.5,
  hard: 0.65,
};

const confettiColors = ["#FFC907", "#2E9DF7", "#4FCB53", "#FF902A", "#F5402C"];
let audioContext;

// Wait for button click to start the game
startButton.addEventListener("click", startGame);
playAgainButton.addEventListener("click", () => {
  difficultySelect.value = resultDifficultySelect.value;
  hideModal();
  startGame();
});

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  resetGameState();

  gameRunning = true;
  startButton.disabled = true;
  difficultySelect.disabled = true;

  hideModal();

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);

  timerInterval = setInterval(() => {
    timeLeft -= 1;
    timeDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function createDrop() {
  if (!gameRunning) return;

  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // Determine good/pollution split based on selected difficulty.
  const selectedDifficulty = difficultySelect.value;
  const pollutionChance =
    difficultyPollutionChance[selectedDifficulty] ?? difficultyPollutionChance.medium;
  const isPollutionDrop = Math.random() < pollutionChance;
  if (isPollutionDrop) {
    drop.classList.add("pollution-drop");
  } else {
    drop.classList.add("good-drop");
  }

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  // Subtract 60 pixels to keep drops fully inside the container
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add the new drop to the game screen
  gameContainer.appendChild(drop);

  drop.addEventListener("click", () => {
    if (!gameRunning) return;

    score += isPollutionDrop ? -1 : 2;
    scoreDisplay.textContent = score;
    playPopSound();
    drop.remove();
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}

function endGame() {
  gameRunning = false;
  startButton.disabled = false;
  difficultySelect.disabled = false;

  clearInterval(dropMaker);
  clearInterval(timerInterval);

  removeAllDrops();
  showResult();
}

function resetGameState() {
  score = 0;
  timeLeft = 30;

  scoreDisplay.textContent = score;
  timeDisplay.textContent = timeLeft;

  removeAllDrops();
  clearConfetti();
}

function removeAllDrops() {
  gameContainer.querySelectorAll(".water-drop").forEach((drop) => {
    drop.remove();
  });
}

function showResult() {
  resultDifficultySelect.value = difficultySelect.value;

  const didWin = score > 20;

  if (didWin) {
    resultMessage.textContent = `Congratulations! You scored ${score} points and saved the water supply!`;
    launchConfetti();
  } else {
    resultMessage.textContent = `Nice try! You scored ${score} points. Keep practicing and try again!`;
  }

  resultModal.classList.remove("hidden");
}

function hideModal() {
  resultModal.classList.add("hidden");
}

function launchConfetti() {
  clearConfetti();

  const burstCount = 70;
  for (let i = 0; i < burstCount; i += 1) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    piece.style.animationDuration = `${1.4 + Math.random() * 1.1}s`;
    confettiContainer.appendChild(piece);

    piece.addEventListener("animationend", () => {
      piece.remove();
    });
  }
}

function clearConfetti() {
  confettiContainer.innerHTML = "";
}

function playPopSound() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(420, now);
  oscillator.frequency.exponentialRampToValueAtTime(120, now + 0.08);

  gainNode.gain.setValueAtTime(0.0001, now);
  gainNode.gain.exponentialRampToValueAtTime(0.16, now + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.start(now);
  oscillator.stop(now + 0.1);
}
