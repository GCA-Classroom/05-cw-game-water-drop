// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let score = 0; // Track player score
let waterCan; // Reference to the water can element
let gameTimer; // Timer for game duration
let timeLeft = 30; // Game duration in seconds
let winTarget = 100; // Points needed to win
let currentDifficulty = 'normal'; // Current difficulty setting
let halfwayMessageShown = false; // Track if halfway message has been shown

// Difficulty settings
const difficulties = {
    easy: { time: 40, target: 100 },
    normal: { time: 35, target: 150 },
    hard: { time: 30, target: 200 }
};

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

// Wait for button click to reset the game
document.getElementById("reset-btn").addEventListener("click", resetGame);

// Wait for difficulty change
document.getElementById("difficulty").addEventListener("change", handleDifficultyChange);

// Get water can element and set up mouse tracking
waterCan = document.getElementById("water-can");
document.addEventListener("mousemove", moveWaterCan);

function handleDifficultyChange(event) {
    if (gameRunning) return; // Don't change during game
    
    currentDifficulty = event.target.value;
    const settings = difficulties[currentDifficulty];
    timeLeft = settings.time;
    winTarget = settings.target;
    
    // Update display
    document.getElementById("time").textContent = timeLeft;
}

// Function to play celebratory sound
function playCelebrationSound() {
    // Create audio context for generating a celebratory tune
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Play a sequence of notes for celebration
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        let noteIndex = 0;
        
        function playNote() {
            if (noteIndex < notes.length) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(notes[noteIndex], audioContext.currentTime);
                oscillator.type = 'triangle';
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                
                noteIndex++;
                setTimeout(playNote, 150);
            }
        }
        
        playNote();
    } catch (error) {
        console.log('Audio not supported in this browser');
    }
}

// Function to show halfway message
function showHalfwayMessage() {
    console.log('🎉 showHalfwayMessage function called!');
    const halfwayMessage = document.createElement('div');
    halfwayMessage.className = 'halfway-message';
    halfwayMessage.innerHTML = '🌟 Great job - halfway there! 🌟';
    document.body.appendChild(halfwayMessage);
    console.log('📧 Halfway message element added to DOM:', halfwayMessage);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        halfwayMessage.remove();
        console.log('🗑️ Halfway message removed from DOM');
    }, 3000);
}

// Function to check progress and show appropriate messages
function checkProgress() {
    // Check halfway point - exactly half of the win target
    const halfwayPoint = winTarget / 2;
    
    // Enhanced debug logging
    console.log(`checkProgress called: Score=${score}, Halfway=${halfwayPoint}, Target=${winTarget}, MessageShown=${halfwayMessageShown}`);
    
    if (!halfwayMessageShown && score >= halfwayPoint && score < winTarget) {
        console.log(`🌟 TRIGGERING HALFWAY MESSAGE! Score: ${score}, Halfway: ${halfwayPoint}`);
        showHalfwayMessage();
        halfwayMessageShown = true;
    }
    
    // Check win condition
    if (score >= winTarget) {
        // Player wins!
        playCelebrationSound();
        createConfetti();
        showWinMessage();
        endGame(true);
        return true;
    }
    return false;
}

function moveWaterCan(event) {
  if (!gameRunning) return;
  
  const gameContainer = document.getElementById("game-container");
  const rect = gameContainer.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  
  // Keep water can within game boundaries
  const canWidth = waterCan.offsetWidth;
  const gameWidth = gameContainer.offsetWidth;
  const minX = canWidth / 2;
  const maxX = gameWidth - canWidth / 2;
  
  const clampedX = Math.max(minX, Math.min(maxX, mouseX));
  waterCan.style.left = `${clampedX - canWidth / 2}px`;
  waterCan.style.transform = 'translateX(0)';
}

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  score = 0;
  
  // Set time and target based on difficulty
  const settings = difficulties[currentDifficulty];
  timeLeft = settings.time;
  winTarget = settings.target;
  
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);

  // Update the timer every second
  gameTimer = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  
  // 25% chance to create a green drop that costs points
  const isGreenDrop = Math.random() < 0.25;
  drop.className = isGreenDrop ? "water-drop green-drop" : "water-drop";

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
  document.getElementById("game-container").appendChild(drop);

  // Check for collision with water can during fall
  const collisionCheck = setInterval(() => {
    if (checkCollision(drop, waterCan)) {
      // Drop caught!
      if (isGreenDrop) {
        // Green drops cost 10 points (with score protection)
        score = Math.max(0, score - 10);
      } else {
        // Regular drops give 10 points
        score += 10;
      }
      document.getElementById("score").textContent = score;
      
      // Check progress and win condition
      if (checkProgress()) {
        clearInterval(collisionCheck);
        return;
      }
      
      drop.remove();
      clearInterval(collisionCheck);
    }
  }, 50);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
    clearInterval(collisionCheck);
  });
}

function checkCollision(drop, waterCan) {
  const dropRect = drop.getBoundingClientRect();
  const canRect = waterCan.getBoundingClientRect();
  
  return !(dropRect.right < canRect.left || 
           dropRect.left > canRect.right || 
           dropRect.bottom < canRect.top || 
           dropRect.top > canRect.bottom);
}

function endGame(isWin = false) {
  gameRunning = false;
  clearInterval(dropMaker);
  clearInterval(gameTimer);
  
  // Remove any remaining drops
  const drops = document.querySelectorAll('.water-drop');
  drops.forEach(drop => drop.remove());
  
  // Only show alert if it's not a win (win has its own message)
  if (!isWin) {
    alert(`Game Over! Your final score: ${score}`);
  }
}

function createConfetti() {
  // Create 15 confetti pieces
  for (let i = 0; i < 15; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.animationDelay = Math.random() * 2 + 's';
    document.body.appendChild(confetti);
    
    // Remove confetti after animation
    setTimeout(() => {
      confetti.remove();
    }, 3000);
  }
}

function showWinMessage() {
  const winMessage = document.createElement('div');
  winMessage.className = 'win-message';
  winMessage.innerHTML = `🎉 WINNER! 🎉<br>You reached ${winTarget} points on ${currentDifficulty.toUpperCase()} mode!`;
  document.body.appendChild(winMessage);
  
  // Remove win message after 4 seconds
  setTimeout(() => {
    winMessage.remove();
  }, 4000);
}

function resetGame() {
  // Stop the current game if running
  if (gameRunning) {
    gameRunning = false;
    clearInterval(dropMaker);
    clearInterval(gameTimer);
  }
  
  // Reset game state
  score = 0;
  halfwayMessageShown = false; // Reset halfway message flag
  const settings = difficulties[currentDifficulty];
  timeLeft = settings.time;
  winTarget = settings.target;
  
  // Update display
  document.getElementById("score").textContent = score;
  document.getElementById("time").textContent = timeLeft;
  
  // Remove any remaining drops
  const drops = document.querySelectorAll('.water-drop');
  drops.forEach(drop => drop.remove());
  
  // Remove any confetti or win messages
  const confetti = document.querySelectorAll('.confetti');
  confetti.forEach(piece => piece.remove());
  const winMessages = document.querySelectorAll('.win-message');
  winMessages.forEach(msg => msg.remove());
  const halfwayMessages = document.querySelectorAll('.halfway-message');
  halfwayMessages.forEach(msg => msg.remove());
  
  // Reset water can position to center
  const gameContainer = document.getElementById("game-container");
  const canWidth = waterCan.offsetWidth;
  const gameWidth = gameContainer.offsetWidth;
  waterCan.style.left = `${(gameWidth - canWidth) / 2}px`;
  waterCan.style.transform = 'translateX(0)';
}

// Initialize game on page load
window.addEventListener('DOMContentLoaded', () => {
  // Set initial difficulty
  currentDifficulty = document.getElementById('difficulty').value;
  const settings = difficulties[currentDifficulty];
  timeLeft = settings.time;
  winTarget = settings.target;
  halfwayMessageShown = false; // Initialize halfway message flag
  document.getElementById("time").textContent = timeLeft;
  console.log(`Game initialized: Difficulty=${currentDifficulty}, Target=${winTarget}, Halfway=${winTarget/2}`);
});
