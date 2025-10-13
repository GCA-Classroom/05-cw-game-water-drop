// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let timeRemaining = 30; // Time remaining in seconds
let timerInterval; // Will store our timer that updates the time
let score = 0; // Player's score
const baseTargetScore = 20; // Base score needed for level 1
let currentLevel = 1; // Current game level
let levelThresholds = []; // Array to store score thresholds for each level
let scorePerDrop = 1; // Score added per good drop, increases by 2 per level
let lives = 3; // Player starts with 3 lives
let redDropRate = 0.10; // Fixed rate for red drops, starts at 10% and doubles per level, capped at 70%
let highScore = 0; // Player's highest score achieved

// Arrays of game-end messages
const winningMessages = [
  "Awesome job! You're a water-catching pro!",
  "Splash-tastic! You've mastered the game!",
  "Incredible! You're making waves with that score!",
  "Drip, drop, winner! Amazing performance!",
  "You're fluid with those drops! Great job!"
];

const losingMessages = [
  "Almost there! Try to catch a few more drops next time.",
  "Don't dry out! Keep practicing and you'll improve.",
  "Every drop counts! You'll do better next round.",
  "Stay hydrated and try again for a higher score!",
  "The water is still flowing! Give it another try."
];

// Load high score from localStorage when the script loads
document.addEventListener("DOMContentLoaded", () => {
  highScore = parseInt(localStorage.getItem("highScore")) || 0;
  document.getElementById("high-score").textContent = highScore;
});

// Calculate score thresholds for each level
function calculateLevelThresholds(maxLevels = 10) {
  levelThresholds = [0]; // Level 0 (doesn't exist) has threshold of 0
  
  let threshold = 0;
  for (let i = 1; i <= maxLevels; i++) {
    // Each level requires baseTargetScore + (level-1)*50 points more than the previous level
    threshold += baseTargetScore + ((i-1) * 50);
    levelThresholds.push(threshold);
  }
  
  return levelThresholds;
}

// Calculate initial thresholds
calculateLevelThresholds();

// Setup near-miss click detection for easier drop collection
setupNearMissDetection();

// Function to update the lives display
function updateLivesDisplay() {
  const livesDisplay = document.getElementById("lives-display");
  livesDisplay.textContent = "❤️".repeat(lives);
}

// Function to create a red flash effect when a life is lost
function flashScreenRed() {
  // Create a flash element
  const flash = document.createElement("div");
  flash.className = "screen-flash";
  document.body.appendChild(flash);
  
  // Remove the flash after animation completes
  setTimeout(() => {
    if (flash.parentNode) {
      flash.parentNode.removeChild(flash);
    }
  }, 300);
}

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

// Add event listener for the "Play Again" button
document.getElementById("play-again-btn").addEventListener("click", function() {
  // Hide the modal
  document.getElementById("end-game-modal").classList.remove("show");
  // Reset to level 1
  currentLevel = 1;
  // Start a new game
  startGame();
});

// Add event listener for the "Continue to Next Level" button
document.getElementById("next-level-btn").addEventListener("click", function() {
  // Hide the level complete modal
  document.getElementById("level-complete-modal").classList.remove("show");
  // Increment the level
  currentLevel++;
  // Keep track of the remaining time to add as a bonus to the base time
  const bonusTime = timeRemaining;
  // Add the bonus time to the base 30 seconds for the next level
  timeRemaining = 30 + bonusTime;
  // Start the next level
  startNextLevel();
});

// Add event listener for the "End Game" button
document.getElementById("end-level-btn").addEventListener("click", function() {
  // Hide the level complete modal
  document.getElementById("level-complete-modal").classList.remove("show");
  // End the game with current score
  endGame(true); // Pass true to indicate successful completion
});

// Add near-miss detection for easier collection
function setupNearMissDetection() {
  const gameContainer = document.getElementById("game-container");
  
  // Add click handler to the game container
  gameContainer.addEventListener("click", (event) => {
    if (!gameRunning) return;
    
    // Only process if the click wasn't directly on a drop (those are handled separately)
    if (event.target.classList.contains("water-drop")) return;
    
    // Get all drops in the game
    const drops = document.getElementsByClassName("water-drop");
    
    // Check if any drop is near the click location
    const nearMissThreshold = 40; // pixels
    const clickX = event.clientX;
    const clickY = event.clientY;
    
    for (const drop of drops) {
      if (drop.classList.contains("clicked")) continue;
      
      const rect = drop.getBoundingClientRect();
      const dropCenterX = rect.left + rect.width / 2;
      const dropCenterY = rect.top + rect.height / 2;
      
      // Calculate distance between click and drop center
      const distance = Math.sqrt(
        Math.pow(clickX - dropCenterX, 2) + Math.pow(clickY - dropCenterY, 2)
      );
      
      // If click is close enough, simulate clicking the drop
      if (distance <= nearMissThreshold) {
        drop.click();
        break; // Only trigger one near-miss at a time
      }
    }
  });
}

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  
  // Reset timer to 30 seconds for level 1
  timeRemaining = 30;
  document.getElementById("time").textContent = timeRemaining;
  
  // Reset score, level and scorePerDrop
  score = 0;
  currentLevel = 1;
  scorePerDrop = 1; // Reset score per drop to 1 for level 1
  lives = 3; // Reset lives to 3 at the start of a new game
  redDropRate = 0.10; // Reset red drop rate to 10%
  document.getElementById("score").textContent = score;
  document.getElementById("level").textContent = currentLevel;
  updateLivesDisplay(); // Update the lives display
  updateProgressBar(0);
  
  // Start the countdown timer
  timerInterval = setInterval(updateTimer, 1000);

  // Create new drops every second, adjusted for level
  // More aggressive decrease in interval for faster spawn rate
  const dropInterval = Math.max(200, 1000 - ((currentLevel - 1) * 150)); // Drops appear faster with higher levels
  dropMaker = setInterval(createDrop, dropInterval);
}

function startNextLevel() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  
  // Special handling for Sudden Death level (level 11)
  if (currentLevel === 11) {
    // Sudden Death level: 1 life, no timer, double score
    lives = 1;
    updateLivesDisplay();
    clearInterval(timerInterval); // No timer
    document.getElementById("time").textContent = "∞"; // Infinite time
    scorePerDrop = (1 + ((currentLevel - 1) * 2)) * 2; // Double score
  } else {
    // Regular level progression
    // The timeRemaining variable now contains the base 30 seconds plus the bonus time
    // from the previous level (set in the next-level-btn click handler)
    document.getElementById("time").textContent = timeRemaining;
    
    // Lives are carried over from the previous level, no changes needed here
    updateLivesDisplay(); // Update the lives display
    
    // Set the red drop rate based on the current level
    // 10% at level 1, increases by 10% per level until 70% at level 7
    if (currentLevel <= 7) {
      redDropRate = 0.10 * currentLevel; // 10%, 20%, 30%, 40%, 50%, 60%, 70%
    } else {
      redDropRate = 0.70; // Cap at 70% for level 8 and beyond
    }
    
    // Increase score per drop by 2 for each level
    scorePerDrop = 1 + ((currentLevel - 1) * 2);
  }
  
  // Update level display
  document.getElementById("level").textContent = currentLevel === 11 ? "Sudden Death" : currentLevel;
  
  // Keep the current score
  document.getElementById("score").textContent = score;
  
  // Show level announcement
  showLevelAnnouncement();
  
  // Update progress bar for this level
  updateProgressBar(score);
  
  // Start the countdown timer
  timerInterval = setInterval(updateTimer, 1000);

  // Create new drops with increasing frequency based on level
  // More aggressive decrease in interval for faster spawn rate
  const dropInterval = Math.max(200, 1000 - ((currentLevel - 1) * 150));
  dropMaker = setInterval(createDrop, dropInterval);
  
  // Show a level announcement
  showLevelAnnouncement();
}

function showLevelCompleteModal() {
  // Pause the game
  pauseGame();
  
  // Update the level score display
  document.getElementById("level-score").textContent = score;
  
  // Get the points needed for the next level
  const nextLevel = currentLevel + 1;
  const pointsForNextLevel = levelThresholds[nextLevel] - levelThresholds[nextLevel - 1];
  
  // Update the modal to show the next level's requirement, remaining time bonus, and score per drop
  const levelCompleteModal = document.getElementById("level-complete-modal");
  const messageElement = levelCompleteModal.querySelector("p:nth-child(3)");
  const nextLevelScorePerDrop = 1 + ((nextLevel - 1) * 2);
  
  // Calculate the next level's red drop rate based on the level
  // 10% at level 1, increases by 10% per level until 70% at level 7
  let nextRedDropRate;
  if (nextLevel <= 7) {
    nextRedDropRate = 0.10 * nextLevel; // 10%, 20%, 30%, 40%, 50%, 60%, 70%
  } else {
    nextRedDropRate = 0.70; // Cap at 70% for level 8 and beyond
  }
  const nextBadDropChance = Math.round(nextRedDropRate * 100);
  
  // Add a warning if red drop rate is increasing
  const redDropWarning = nextLevel <= 7 ? 
    `<span style="color: #F5402C;">Warning:</span> Red drop rate increases to <strong>${nextBadDropChance}%</strong>!<br>` : '';
  
  messageElement.innerHTML = `Next level will require <strong>${pointsForNextLevel}</strong> points to complete! <br>
    You'll get the base 30 seconds PLUS your remaining <strong>${timeRemaining}</strong> seconds as bonus time! <br>
    Each drop will now be worth <strong>${nextLevelScorePerDrop}</strong> points! <br>
    ${redDropWarning}
    You'll see red drops <strong>${nextBadDropChance}%</strong> of the time in the next level!`;
  
  // Show the modal
  levelCompleteModal.classList.add("show");
}

function showLevelAnnouncement() {
  // Update the level number in the announcement
  document.getElementById("announcement-level").textContent = currentLevel;
  
  // Show the announcement
  const announcement = document.getElementById("level-announcement");
  announcement.classList.add("show");
  
  // Remove the announcement after animation completes
  setTimeout(() => {
    announcement.classList.remove("show");
  }, 2000);
}

function updateTimer() {
  // Decrease the time remaining
  timeRemaining--;
  
  // Update the timer display
  document.getElementById("time").textContent = timeRemaining;
  
  // Check if time is up
  if (timeRemaining <= 0) {
    endGame();
  }
}

// Function to update the progress bar
function updateProgressBar(currentScore) {
  const progressBar = document.getElementById("score-progress");
  
  // Get current level threshold and next level threshold
  const currentLevelThreshold = levelThresholds[currentLevel - 1];
  const nextLevelThreshold = levelThresholds[currentLevel];
  
  // Calculate the points needed to complete this level
  const pointsForThisLevel = nextLevelThreshold - currentLevelThreshold;
  
  // Calculate progress within the current level
  const levelProgress = currentScore - currentLevelThreshold;
  const levelPercentage = (levelProgress / pointsForThisLevel) * 100;
  
  // Cap the percentage at 100%
  const percentage = Math.min(levelPercentage, 100);
  
  // Update the width of the progress bar
  progressBar.style.width = percentage + "%";
  
  // Change color when complete
  if (percentage >= 100) {
    progressBar.style.background = "linear-gradient(to right, #FFC907, #4FCB53)"; // Yellow to green
    
    // Show level complete modal if we just reached this level's target score
    // and we haven't already shown it for this level
    if (score >= nextLevelThreshold && gameRunning) {
      showLevelCompleteModal();
    }
  }
}

// Function to create splash effect when drops are clicked
function createSplash(drop, color) {
  const splash = document.createElement("div");
  splash.className = "splash";
  
  // Position splash at the drop's location
  const dropRect = drop.getBoundingClientRect();
  const containerRect = document.getElementById("game-container").getBoundingClientRect();
  
  splash.style.left = (dropRect.left - containerRect.left + dropRect.width / 2) + "px";
  splash.style.top = (dropRect.top - containerRect.top + dropRect.height / 2) + "px";
  splash.style.backgroundColor = color;
  
  // Add splash to the game container
  document.getElementById("game-container").appendChild(splash);
  
  // Remove splash after animation completes
  setTimeout(() => {
    if (splash.parentNode) {
      splash.parentNode.removeChild(splash);
    }
  }, 300);
}

function pauseGame() {
  // Just pause the game without ending it
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  gameRunning = false;
}

function endGame(levelCompleted = false, noLivesRemaining = false) {
  // Stop the game
  gameRunning = false;
  
  // Clear all intervals
  clearInterval(dropMaker);
  clearInterval(timerInterval);
  
  // Check if the current score is a new high score
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
    document.getElementById("high-score").textContent = highScore;
  }
  
  // Remove all drops
  const drops = document.getElementsByClassName("water-drop");
  while(drops.length > 0) {
    drops[0].remove();
  }
  
  // Get final score
  const finalScore = score;
  
  // Handle game ending
  if (levelCompleted) {
    // The player chose to end after completing a level
    const message = `Congratulations! You reached level ${currentLevel} with ${finalScore} points!`;
    
    // Update the modal content for a successful game completion
    document.getElementById("final-score").textContent = finalScore;
    document.getElementById("end-game-message").textContent = message;
    document.getElementById("end-game-message").style.color = "#4FCB53"; // Green for success
  } else {
    // The game ended because time ran out or player lost all lives
    
    // Custom message for no lives remaining
    if (noLivesRemaining) {
      const noLivesMessage = "You've run out of lives! Be careful with those red drops next time.";
      document.getElementById("final-score").textContent = finalScore;
      document.getElementById("end-game-message").textContent = noLivesMessage;
      document.getElementById("end-game-message").style.color = "#F5402C"; // Red for failure
    } else {
      // Regular time out ending
      // Determine if the player won based on score threshold (20 points)
      const isWinner = finalScore >= 20;
      
      // Select appropriate message array
      const messageArray = isWinner ? winningMessages : losingMessages;
      
      // Get a random message from the array
      const randomIndex = Math.floor(Math.random() * messageArray.length);
      const randomMessage = messageArray[randomIndex];
      
      // Update the modal content
      document.getElementById("final-score").textContent = finalScore;
      document.getElementById("end-game-message").textContent = randomMessage;
      
      // Change message color based on win/lose
      document.getElementById("end-game-message").style.color = isWinner ? "#4FCB53" : "#F5402C";
    }
  }
  
  // Show the game over modal
  document.getElementById("end-game-modal").classList.add("show");
  
  // Reset for a new game
  currentLevel = 1;
  document.getElementById("time").textContent = "30";
}

function createDrop() {
  // Create a new div element that will be our water drop
  const drop = document.createElement("div");
  drop.className = "water-drop";
  
  // Randomly determine if this will be a regular or bad drop
  // Using fixed rate that doubles with each level, capped at 70%
  // The rate is set in startGame() and startNextLevel() functions
  const isBadDrop = Math.random() < redDropRate;
  if (isBadDrop) {
    drop.classList.add("bad-drop");
  }

  // Make drops different sizes for visual variety
  const baseWidth = 30;  // Base width for raindrop shape
  const baseHeight = 50; // Base height for raindrop shape
  const sizeMultiplier = Math.random() * 0.4 + 0.8;  // 0.8 to 1.2 multiplier
  
  drop.style.width = `${baseWidth * sizeMultiplier}px`;
  drop.style.height = `${baseHeight * sizeMultiplier}px`;

  // Add slight rotation variation
  const rotationVariation = Math.random() * 20 - 10; // -10 to +10 degrees
  drop.style.transform = `rotate(${15 + rotationVariation}deg)`;

  // Position the drop randomly across the game width
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 30);
  drop.style.left = xPosition + "px";

  // Vary the fall speed based on level (faster drops as levels increase)
  // More aggressive decrease in duration per level for faster drops
  const baseDuration = Math.max(1.5, 4.5 - (currentLevel * 0.5)); // More aggressive scaling
  
  // Make bad drops fall faster than good drops
  let fallDuration;
  if (isBadDrop) {
    // Bad drops fall 20% faster than good drops
    fallDuration = (Math.random() * 0.8 + 0.8 * baseDuration);
  } else {
    fallDuration = (Math.random() * 1 + baseDuration);
  }
  
  drop.style.animationDuration = `${fallDuration}s`;

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);
  
  // Add click handler to collect drops
  drop.addEventListener("click", () => {
    // Flag as clicked to prevent double-clicks and show visual feedback
    if (drop.classList.contains("clicked")) return;
    drop.classList.add("clicked");
    
    // Make the drop visually indicate it's been clicked
    drop.style.opacity = "0.5";
    drop.style.transform = "rotate(15deg) scale(1.5)";
    
    if (drop.classList.contains("bad-drop")) {
      // Decrease lives when bad drop is clicked
      lives--;
      updateLivesDisplay();
      
      // Check if player has lost all lives
      if (lives <= 0) {
        // End the game due to no lives remaining
        endGame(false, true);
        return;
      }
      
      // Add splash effect for bad drops (larger and more dramatic)
      createSplash(drop, "rgba(245, 64, 44, 0.9)");
      
      // Add a screen flash effect to indicate life lost
      flashScreenRed();
    } else {
      // Increase score when good drop is clicked
      score += scorePerDrop;
      
      // Add splash effect for good drops
      createSplash(drop, "rgba(46, 157, 247, 0.7)");
    }
    
    // Update score display
    document.getElementById("score").textContent = score;
    
    // Update the progress bar based on current score
    updateProgressBar(score);
    
    // Remove the drop after a short delay, giving players visual feedback
    // and making it feel more responsive even with near-misses
    setTimeout(() => {
      if (drop.parentNode) {
        drop.remove();
      }
    }, 100);
  });

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}
