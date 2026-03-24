// Variables to control game state
let gameRunning = false;
let dropMaker;
let score = 0;
let timeLeft = 30;
let timerInterval;

const winMessages = [
  "Amazing! You're a water hero!",
  "Incredible! You caught enough drops to change lives!",
  "You're a champion for clean water!",
  "Fantastic work! Keep making a splash!"
];

const loseMessages = [
  "So close! Give it another try!",
  "Don't give up — every drop counts. Try again!",
  "Keep practicing — clean water needs you!",
  "Almost there! One more round?"
];

// Confetti colors using charity: water brand palette
const confettiColors = ["#FFC907", "#2E9DF7", "#4FCB53", "#FF902A", "#8BD1CB", "#F16061"];

document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);

function startGame() {
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  timeLeft = 30;

  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("end-message").classList.add("hidden");
  document.getElementById("end-message").textContent = "";
  document.getElementById("start-btn").disabled = true;

  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent = timeLeft;
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);

  dropMaker = setInterval(createDrop, 1000);
}

function resetGame() {
  // Stop everything and clear state
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  score = 0;
  timeLeft = 30;

  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
  document.getElementById("start-btn").textContent = "Start Game";
  document.getElementById("start-btn").disabled = false;

  document.querySelectorAll(".water-drop").forEach(d => d.remove());
  document.querySelectorAll(".confetti-piece").forEach(c => c.remove());

  const endEl = document.getElementById("end-message");
  endEl.classList.add("hidden");
  endEl.textContent = "";
  endEl.classList.remove("win", "lose");
}

function endGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);

  document.querySelectorAll(".water-drop").forEach(d => d.remove());

  const won = score >= 20;
  let messagePool = won ? winMessages : loseMessages;
  let message = messagePool[Math.floor(Math.random() * messagePool.length)];

  const endEl = document.getElementById("end-message");
  endEl.textContent = `${won ? "You win! 🎉" : "Try again! 💧"} ${message} Final score: ${score}`;
  endEl.classList.remove("hidden");
  endEl.classList.toggle("win", won);
  endEl.classList.toggle("lose", !won);

  document.getElementById("start-btn").disabled = false;
  document.getElementById("start-btn").textContent = "Play Again";

  if (won) launchConfetti();
}

function createDrop() {
  const drop = document.createElement("div");

  // 30% chance of being a bad drop
  const isBad = Math.random() < 0.3;
  drop.className = "water-drop" + (isBad ? " bad-drop" : "");

  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  drop.style.animationDuration = "4s";

  document.getElementById("game-container").appendChild(drop);

  drop.addEventListener("click", () => {
    if (isBad) {
      score = Math.max(0, score - 1); // Don't go below 0
    } else {
      score++;
    }
    document.getElementById("score").textContent = score;
    drop.remove();
  });

  drop.addEventListener("animationend", () => {
    drop.remove();
  });
}

function launchConfetti() {
  const container = document.getElementById("game-container");
  const count = 80;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";

    // Random color, size, position, spin, and delay
    const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    const size = Math.random() * 10 + 6;
    const left = Math.random() * 100;
    const delay = Math.random() * 1.5;
    const duration = Math.random() * 2 + 2;
    const rotation = Math.random() * 360;

    piece.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      animation-delay: ${delay}s;
      animation-duration: ${duration}s;
      transform: rotate(${rotation}deg);
    `;

    container.appendChild(piece);

    // Remove each piece after its animation finishes
    piece.addEventListener("animationend", () => piece.remove());
  }
}
