// Variables to control game state
let gameRunning = false;
let dropMaker;
let timerInterval;
let score = 0;
let timeLeft = 30;
let winScore = 20;
let dropInterval = 1000;
let dropSpeed = 4;
let difficulty = "normal";

const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const messageEl = document.getElementById("message");
const startBtn = document.getElementById("start-btn");
const resetBtn = document.getElementById("reset-btn");
const gameContainer = document.getElementById("game-container");
const confettiCanvas = document.getElementById("confetti-canvas");
const difficultySelect = document.getElementById("difficulty-select");

// Sound effects
const soundStart = new Audio("sounds/foxboytails-game-start-317318.mp3");
const soundWin = new Audio("sounds/superpuyofans1234-winner-game-sound-404167.mp3");
const soundLose = new Audio("sounds/freesound_community-game-over-arcade-6435.mp3");

// Difficulty settings
const difficultySettings = {
  easy: { time: 45, winScore: 15, dropInterval: 1200, dropSpeed: 5 },
  normal: { time: 30, winScore: 20, dropInterval: 1000, dropSpeed: 4 },
  hard: { time: 30, winScore: 25, dropInterval: 700, dropSpeed: 3.5 }
};

// Milestone messages
const milestones = [
  { score: 5, message: "Great start! Keep going! 🌊" },
  { score: 10, message: "Halfway there! 💪" },
  { score: 15, message: "You're doing amazing! Almost there! 🎯" },
  { score: 25, message: "Wow! You're a water champion! 🏆" }
];
let lastMilestone = 0;

const winMessages = [
  "Amazing! You brought clean water! 💧",
  "You’re a Water Hero!",
  "Incredible! You made a difference!",
  "Victory! Every drop counts!"
];
const loseMessages = [
  "Try again! Every drop matters.",
  "Keep going! Clean water needs you!",
  "Almost there! Give it another shot.",
  "Don’t give up! Water is life."
];

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

function startGame() {
  if (gameRunning) return;
  
  // Get difficulty settings
  difficulty = difficultySelect.value;
  const settings = difficultySettings[difficulty];
  timeLeft = settings.time;
  winScore = settings.winScore;
  dropInterval = settings.dropInterval;
  dropSpeed = settings.dropSpeed;
  
  gameRunning = true;
  score = 0;
  lastMilestone = 0;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  messageEl.textContent = "";
  startBtn.style.display = "none";
  resetBtn.classList.remove("visually-hidden");
  difficultySelect.disabled = true;
  clearDrops();
  
  // Play start sound
  soundStart.currentTime = 0;
  soundStart.play();
  
  dropMaker = setInterval(createDrop, dropInterval);
  timerInterval = setInterval(updateTimer, 1000);
}

function resetGame() {
  stopGame();
  score = 0;
  lastMilestone = 0;
  const settings = difficultySettings[difficultySelect.value];
  timeLeft = settings.time;
  winScore = settings.winScore;
  scoreEl.textContent = score;
  timeEl.textContent = timeLeft;
  messageEl.textContent = "";
  clearDrops();
  confettiCanvas.style.display = "none";
  startBtn.style.display = "inline-block";
  resetBtn.classList.add("visually-hidden");
  difficultySelect.disabled = false;
}

function stopGame() {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(timerInterval);
}

function updateTimer() {
  timeLeft--;
  timeEl.textContent = timeLeft;
  if (timeLeft <= 0) {
    endGame();
  }
}

function endGame() {
  stopGame();
  clearDrops();
  difficultySelect.disabled = false;
  let msgArr = score >= winScore ? winMessages : loseMessages;
  let msg = msgArr[Math.floor(Math.random() * msgArr.length)];
  messageEl.textContent = msg;
  if (score >= winScore) {
    showConfetti();
    soundWin.currentTime = 0;
    soundWin.play();
  } else {
    soundLose.currentTime = 0;
    soundLose.play();
  }
}

function clearDrops() {
  while (gameContainer.firstChild) {
    gameContainer.removeChild(gameContainer.firstChild);
  }
}

function createDrop() {
  const drop = document.createElement("div");
  // 20% chance to be a bad drop
  const isBad = Math.random() < 0.2;
  drop.className = isBad ? "water-drop bad-drop" : "water-drop";
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;
  const gameWidth = gameContainer.offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";
  drop.style.animationDuration = `${dropSpeed}s`;
  drop.addEventListener("animationend", () => {
    drop.remove(); // Remove drop from DOM when it reaches bottom
  });
  let clicked = false;
  drop.style.pointerEvents = "auto";
  drop.addEventListener("mousedown", function (e) {
    if (!gameRunning || clicked) return;
    clicked = true;
    drop.style.pointerEvents = "none";
    if (isBad) {
      score = Math.max(0, score - 2);
      drop.style.background = "var(--cw-earth-brown)";
      drop.classList.add("shake");
      setTimeout(() => drop.remove(), 400); // Remove bad drop from DOM
    } else {
      score++;
      drop.style.background = "var(--cw-yellow)";
      drop.classList.add("pop");
      setTimeout(() => drop.remove(), 500); // Remove good drop from DOM
      
      // Check for milestones
      checkMilestone();
    }
    scoreEl.textContent = score;
    e.preventDefault();
  });
  gameContainer.appendChild(drop);
}

// Confetti effect (simple canvas burst)
function showConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiCanvas.style.display = "block";
  const ctx = confettiCanvas.getContext("2d");
  const confettiCount = 120;
  const confetti = [];
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * confettiCanvas.width,
      y: Math.random() * confettiCanvas.height / 2,
      r: Math.random() * 6 + 4,
      d: Math.random() * confettiCount,
      color: randomConfettiColor(),
      tilt: Math.random() * 10 - 10
    });
  }
  let angle = 0;
  let tiltAngle = 0;
  function draw() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    for (let i = 0; i < confettiCount; i++) {
      let c = confetti[i];
      ctx.beginPath();
      ctx.lineWidth = c.r;
      ctx.strokeStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
      ctx.lineTo(c.x + c.tilt, c.y + c.tilt + c.r / 3);
      ctx.stroke();
    }
    update();
  }
  function update() {
    angle += 0.01;
    tiltAngle += 0.1;
    for (let i = 0; i < confettiCount; i++) {
      let c = confetti[i];
      c.y += (Math.cos(angle + c.d) + 3 + c.r / 2) / 2;
      c.x += Math.sin(angle);
      c.tilt = Math.sin(tiltAngle - i / 3) * 15;
      if (c.y > confettiCanvas.height) {
        c.x = Math.random() * confettiCanvas.width;
        c.y = -10;
      }
    }
  }
  let confettiAnim = setInterval(draw, 16);
  setTimeout(() => {
    clearInterval(confettiAnim);
    confettiCanvas.style.display = "none";
  }, 2500);
}
function randomConfettiColor() {
  const colors = ["#FFC907", "#2E9DF7", "#8BD1CB", "#4FCB53", "#FF902A", "#F5402C", "#159A48", "#F16061"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Check and display milestone messages
function checkMilestone() {
  for (let milestone of milestones) {
    if (score === milestone.score && score > lastMilestone) {
      lastMilestone = score;
      showMilestoneMessage(milestone.message);
      break;
    }
  }
}

function showMilestoneMessage(msg) {
  const milestoneEl = document.createElement("div");
  milestoneEl.className = "milestone-message";
  milestoneEl.textContent = msg;
  document.querySelector(".main-menu").appendChild(milestoneEl);
  
  setTimeout(() => {
    milestoneEl.classList.add("fade-out");
    setTimeout(() => milestoneEl.remove(), 500); // Remove milestone from DOM
  }, 2000);
}
