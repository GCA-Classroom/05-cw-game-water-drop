// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);
}

function createDrop() {
  const drop = document.createElement("div");
  drop.className = "water-drop";

  // 40% chance to make the drop green
  if (Math.random() < 0.4) {
    drop.classList.add("green-drop");
    drop.dataset.type = "green";
  } else {
    drop.dataset.type = "normal";
  }

  // ...rest of your positioning and sizing code...

  document.getElementById("game-container").appendChild(drop);

  drop.addEventListener("click", function() {
    if (drop.dataset.type === "green") {
      score -= 10; // Subtract 10 for green drops
    } else {
      score += 1; // Add 1 for normal drops
    }
    updateScoreDisplay(); // Make sure you have this function or similar
    drop.remove();
  });

  drop.addEventListener("animationend", () => {
    drop.remove();
  });
}
