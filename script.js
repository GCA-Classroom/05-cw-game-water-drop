let score = 0;
let timeLeft = 30;
let gameRunning = false;

let dropMaker;
let countdown;

let winScore = 15;
let dropSpeed = 700;

const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const gameContainer = document.getElementById("game-container");
const message = document.getElementById("message");
const difficultySelect = document.getElementById("difficulty");

document
    .getElementById("start-btn")
    .addEventListener("click", startGame);

document
    .getElementById("reset-btn")
    .addEventListener("click", resetGame);

function startGame() {
    if (gameRunning) return;

    const difficulty = difficultySelect.value;

    switch (difficulty) {
        case "easy":
            winScore = 10;
            timeLeft = 40;
            dropSpeed = 900;
            break;

        case "hard":
            winScore = 20;
            timeLeft = 20;
            dropSpeed = 500;
            break;

        default:
            winScore = 15;
            timeLeft = 30;
            dropSpeed = 700;
    }

    score = 0;
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;

    message.textContent = "";
    gameRunning = true;

    dropMaker = setInterval(createDrop, dropSpeed);

    countdown = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function createDrop() {
    const drop = document.createElement("div");

    const isBad = Math.random() < 0.3;

    drop.classList.add("water-drop");
    drop.classList.add(isBad ? "bad-drop" : "good-drop");

    const size = 40 + Math.random() * 30;

    drop.style.width = `${size}px`;
    drop.style.height = `${size}px`;

    const xPosition =
        Math.random() *
        (gameContainer.offsetWidth - size);

    drop.style.left = `${xPosition}px`;

    drop.style.animationDuration =
        `${3 + Math.random() * 2}s`;

    drop.addEventListener("click", () => {
        if (!gameRunning) return;

        score += isBad ? -1 : 1;

        scoreDisplay.textContent = score;

        drop.remove(); // Requirement: remove DOM element

        checkWin();
    });

    drop.addEventListener("animationend", () => {
        drop.remove();
    });

    gameContainer.appendChild(drop);
}

function checkWin() {
    if (score >= winScore) {
        message.textContent =
            "🎉 You brought clean water to a community!";

        gameContainer.style.backgroundColor =
            "#8BD1CB";

        endGame(true);
    }
}

function endGame(won = false) {
    clearInterval(dropMaker);
    clearInterval(countdown);

    gameRunning = false;

    if (!won) {
        message.textContent =
            `Game Over! Final Score: ${score}`;
    }
}

function resetGame() {
    clearInterval(dropMaker);
    clearInterval(countdown);

    gameRunning = false;
    score = 0;
    timeLeft = 30;

    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;

    message.textContent = "";

    gameContainer.style.backgroundColor =
        "#e6f7ff";

    gameContainer.innerHTML = "";
}
