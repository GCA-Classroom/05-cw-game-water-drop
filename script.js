// Game state variables
let gameActive = false;  // Tracks if game is currently running
let gameInterval;        // Stores the interval that creates drops
let score = 0;           // Initialize score
let timerInterval;       // Stores the interval for the countdown timer
let timeLeft = 30;       // Initialize timer to 30 seconds
let level = 1;           // Initialize level
let badges = [];         // Track earned badges
let totalScore = 0;      // Track total score for level progression

// Event listener for the start button
document.getElementById('start-btn').addEventListener('click', startGame);

// Open and close the store modal
const storeBtn = document.getElementById('store-btn');
const storeModal = document.getElementById('store-modal');
const closeStore = document.getElementById('close-store');

storeBtn.addEventListener('click', () => {
    document.getElementById('total-currency').textContent = score; // Update total currency
    storeModal.style.display = 'flex'; // Show the modal
});

closeStore.addEventListener('click', () => {
    storeModal.style.display = 'none'; // Hide the modal
});

// Close the store modal when clicking outside the modal content
storeModal.addEventListener('click', (event) => {
    if (event.target === storeModal) {
        storeModal.style.display = 'none'; // Hide the modal
    }
});

// Game initialization function
function startGame() {
    if (gameActive) return; // Prevent multiple game instances

    // Set up initial game state
    gameActive = true;
    document.getElementById('start-btn').disabled = true;

    // Reset game variables
    score = 0;
    level = 1;
    badges = [];
    totalScore = 0;
    updateLevelDisplay();
    updateBadgeDisplay();

    // Ensure the timer does not reset to 30 seconds if "+5 Seconds" was used
    if (timeLeft <= 0) {
        timeLeft = 30; // Reset only if the timer has expired
    }

    // Start creating drops every 1000ms (1 second)
    startDropInterval(1000);

    // Reset timer bar to full width
    const timerBar = document.querySelector('.timer-bar');
    timerBar.style.width = '100%';

    // Start countdown timer
    timerInterval = setInterval(updateTimer, 1000);
}

function startDropInterval(interval) {
    clearInterval(gameInterval); // Clear any existing interval
    gameInterval = setInterval(createDrop, interval);
}

function updateTimer() {
    timeLeft--;
    document.getElementById('time-left').textContent = timeLeft;

    // Update timer bar width
    const timerBar = document.querySelector('.timer-bar');
    const percentage = (timeLeft / 30) * 100; // Calculate remaining percentage
    timerBar.style.width = `${percentage}%`;

    if (timeLeft <= 0) {
        endGame(); // End the game when the timer reaches 0
    }
}

function endGame() {
    gameActive = false; // Stop the game
    clearInterval(gameInterval); // Stop creating drops
    clearInterval(timerInterval); // Stop the timer
    document.getElementById('start-btn').disabled = false; // Re-enable start button

    // Remove all remaining drops
    const drops = document.querySelectorAll('.water-drop');
    drops.forEach(drop => drop.remove());

    // Show all earned badges as a popup
    if (badges.length > 0) {
        alert(`🎉 Game Over! You earned the following badges:\n\n${badges.join('\n')}`);
    }
}

function updateScore(isBadDrop) {
    if (!gameActive) return; // Prevent score updates after the game ends
    const feedbackMessage = document.getElementById('feedback-message');

    if (isBadDrop) {
        score -= 5; // Deduct points for bad drops
        feedbackMessage.textContent = '😢 Bad Drop! -5';
        feedbackMessage.style.color = '#F5402C'; // Red for bad drops
    } else {
        score += 10; // Add points for good drops
        totalScore += 10; // Track total score for level progression
        feedbackMessage.textContent = '😊 Good Drop! +10';
        feedbackMessage.style.color = '#4FCB53'; // Green for good drops
    }

    // Update score display
    document.getElementById('score').textContent = score;

    // Check for level up
    checkLevelUp();

    // Show feedback message briefly
    feedbackMessage.classList.add('show');
    setTimeout(() => feedbackMessage.classList.remove('show'), 1000);
}

function checkLevelUp() {
    const levelUpScore = level * 100; // Level up every 100 points
    if (score >= levelUpScore) {
        level++;
        updateLevelDisplay();
        const badgeName = `Level ${level} Achieved!`;
        if (!badges.includes(badgeName)) {
            badges.push(badgeName); // Add the badge to the array
        }
        updateBadgeDisplay(); // Update the badge display
        startDropInterval(Math.max(500, 1000 - level * 100)); // Increase drop speed
    }
}

function updateLevelDisplay() {
    const levelDisplay = document.getElementById('level-display');
    if (levelDisplay) {
        levelDisplay.textContent = level; // Update only the number
    }
}

function awardBadge(badgeName) {
    if (!badges.includes(badgeName)) {
        badges.push(badgeName);
        alert(`🎉 You earned a badge: ${badgeName}!`);
        updateBadgeDisplay();
    }
}

function updateBadgeDisplay() {
    const badgeContainer = document.getElementById('badge-list'); // Use the correct badge list container
    if (!badgeContainer) return; // Ensure the badge container exists

    // Clear the badge container and repopulate it with the current badges
    badgeContainer.innerHTML = badges
        .map(badge => `<span>${badge}</span>`)
        .join('');
    console.log('Badges:', badges);
}

function createDrop() {
    const drop = document.createElement('div');

    // Randomly determine if this drop is good or bad (20% chance of bad)
    const isBadDrop = Math.random() < 0.2;
    drop.className = isBadDrop ? 'water-drop bad-drop' : 'water-drop';

    // Create random size variation for visual interest
    const scale = 0.8 + Math.random() * 0.7; // Results in 80% to 150% of original size
    drop.style.transform = `scale(${scale})`;

    // Position drop randomly along the width of the game container
    const gameWidth = document.getElementById('game-container').offsetWidth;
    const randomX = Math.random() * (gameWidth - 40);
    drop.style.left = `${randomX}px`;

    // Set drop animation speed
    drop.style.animationDuration = '4s';

    // Simple click handler to remove drops and update score
    drop.addEventListener('click', () => {
        const isBadDrop = drop.classList.contains('bad-drop');
        updateScore(isBadDrop); // Update score based on drop type
        drop.remove();
    });

    // Add drop to game container
    document.getElementById('game-container').appendChild(drop);

    // Remove drop if it reaches bottom without being clicked
    drop.addEventListener('animationend', () => {
        drop.remove();
    });
}

// Purchase power-ups with quantities
function purchasePowerUp(powerUp) {
    if (!gameActive) return; // Prevent purchases when the game is not active

    const powerUpCosts = {
        addTime: 50,
        noReds: 100,
        doublePoints: 150,
        clearDrops: 200,
        slowDrops: 250,
    };

    const quantity = parseInt(document.getElementById(`${powerUp}-qty`).value, 10);
    const totalCost = powerUpCosts[powerUp] * quantity;

    if (score < totalCost) {
        alert('Not enough score to purchase this power-up!');
        return;
    }

    // Deduct the cost from the score
    score -= totalCost;
    document.getElementById('score').textContent = score;
    document.getElementById('total-currency').textContent = score; // Update total currency

    // Activate the power-up for the specified quantity
    for (let i = 0; i < quantity; i++) {
        switch (powerUp) {
            case 'addTime':
                timeLeft += 5; // Add 5 seconds to the timer
                document.getElementById('time-left').textContent = timeLeft;
                break;
            case 'noReds':
                activateNoReds(7); // Disable bad drops for 7 seconds
                break;
            case 'doublePoints':
                activateDoublePoints(10); // Double points for 10 seconds
                break;
            case 'clearDrops':
                clearAllDrops(); // Remove all drops from the screen
                break;
            case 'slowDrops':
                activateSlowDrops(10); // Slow down drops for 10 seconds
                break;
        }
    }
}

function activateNoReds(duration) {
    const originalCreateDrop = createDrop;
    createDrop = function () {
        const drop = document.createElement('div');
        drop.className = 'water-drop'; // Only good drops
        // ...existing code for creating drops...
    };
    setTimeout(() => {
        createDrop = originalCreateDrop; // Restore original behavior
    }, duration * 1000);
}

function activateDoublePoints(duration) {
    const originalUpdateScore = updateScore;
    updateScore = function (isBadDrop) {
        if (!gameActive) return;
        if (!isBadDrop) {
            score += 20; // Double points for good drops
            totalScore += 20; // Track total score
        } else {
            score -= 5; // Deduct points for bad drops
        }
        document.getElementById('score').textContent = score;
    };
    setTimeout(() => {
        updateScore = originalUpdateScore; // Restore original behavior
    }, duration * 1000);
}

function clearAllDrops() {
    const drops = document.querySelectorAll('.water-drop');
    drops.forEach(drop => drop.remove());
}

function activateSlowDrops(duration) {
    const originalInterval = gameInterval;
    startDropInterval(2000); // Slow down drops
    setTimeout(() => {
        startDropInterval(originalInterval); // Restore original speed
    }, duration * 1000);
}

// Update the total cost dynamically
function updateTotalCost() {
    const powerUpCosts = {
        addTime: 50,
        noReds: 100,
        doublePoints: 150,
        clearDrops: 200,
        slowDrops: 250,
    };

    // Get quantities for each power-up
    const quantities = {
        addTime: parseInt(document.getElementById('addTime-qty').value, 10) || 0,
        noReds: parseInt(document.getElementById('noReds-qty').value, 10) || 0,
        doublePoints: parseInt(document.getElementById('doublePoints-qty').value, 10) || 0,
        clearDrops: parseInt(document.getElementById('clearDrops-qty').value, 10) || 0,
        slowDrops: parseInt(document.getElementById('slowDrops-qty').value, 10) || 0,
    };

    // Calculate total cost
    let totalCost = 0;
    for (const powerUp in quantities) {
        totalCost += quantities[powerUp] * powerUpCosts[powerUp];
    }

    // Update the total cost display
    document.getElementById('total-cost').textContent = totalCost;
}

// Handle "Buy" button click
document.getElementById('buy-btn').addEventListener('click', () => {
    const powerUpCosts = {
        addTime: 50,
        noReds: 100,
        doublePoints: 150,
        clearDrops: 200,
        slowDrops: 250,
    };

    // Get quantities for each power-up
    const quantities = {
        addTime: parseInt(document.getElementById('addTime-qty').value, 10) || 0,
        noReds: parseInt(document.getElementById('noReds-qty').value, 10) || 0,
        doublePoints: parseInt(document.getElementById('doublePoints-qty').value, 10) || 0,
        clearDrops: parseInt(document.getElementById('clearDrops-qty').value, 10) || 0,
        slowDrops: parseInt(document.getElementById('slowDrops-qty').value, 10) || 0,
    };

    let totalCost = 0;
    for (const powerUp in quantities) {
        totalCost += quantities[powerUp] * powerUpCosts[powerUp];
    }

    if (score < totalCost) {
        alert('Not enough score to purchase these power-ups!');
        return;
    }

    score -= totalCost;
    document.getElementById('score').textContent = score;
    document.getElementById('total-currency').textContent = score;

    for (const powerUp in quantities) {
        for (let i = 0; i < quantities[powerUp]; i++) {
            switch (powerUp) {
                case 'addTime':
                    addToInventory('+5 Seconds', 0); // Add to inventory
                    break;
                case 'noReds':
                    addToInventory('No Reds for 7s', 7); // Add to inventory
                    break;
                case 'doublePoints':
                    addToInventory('Double Points for 10s', 10); // Add to inventory
                    break;
                case 'clearDrops':
                    addToInventory('Clear All Drops', 0); // Add to inventory
                    break;
                case 'slowDrops':
                    addToInventory('Slow Drops for 10s', 10); // Add to inventory
                    break;
            }
        }
    }

    document.getElementById('addTime-qty').value = 0;
    document.getElementById('noReds-qty').value = 0;
    document.getElementById('doublePoints-qty').value = 0;
    document.getElementById('clearDrops-qty').value = 0;
    document.getElementById('slowDrops-qty').value = 0;

    updateTotalCost();
    storeModal.style.display = 'none';
});

// Inventory system
const inventoryItems = []; // Track purchased items

// Add purchased items to the inventory
function addToInventory(itemName, duration) {
    const inventoryContainer = document.getElementById('inventory-items');
    let itemElement = document.querySelector(`.inventory-item[data-item="${itemName}"]`);

    if (itemElement) {
        // If the item already exists, increment its quantity
        const quantityElement = itemElement.querySelector('.quantity');
        quantityElement.textContent = parseInt(quantityElement.textContent, 10) + 1;
    } else {
        // Create a new inventory item element
        itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.dataset.item = itemName;

        // Add an icon or image based on the item name
        const icon = document.createElement('i');
        switch (itemName) {
            case '+5 Seconds':
                icon.className = 'fas fa-clock'; // Clock icon
                break;
            case 'No Reds for 7s':
                icon.className = 'fas fa-shield-alt'; // Shield icon
                break;
            case 'Double Points for 10s':
                icon.className = 'fas fa-star'; // Star icon
                break;
            case 'Clear All Drops':
                icon.className = 'fas fa-broom'; // Broom icon
                break;
            case 'Slow Drops for 10s':
                icon.className = 'fas fa-snail'; // Snail icon
                break;
        }

        // Add the icon and item name to the inventory item
        itemElement.appendChild(icon);
        const label = document.createElement('span');
        label.textContent = itemName;
        itemElement.appendChild(label);

        // Add a quantity display
        const quantity = document.createElement('span');
        quantity.className = 'quantity';
        quantity.textContent = '1';
        itemElement.appendChild(quantity);

        // Add click event to activate the item's effect
        itemElement.addEventListener('click', () => {
            activateItemEffect(itemName, duration, itemElement);
        });

        // Append the item to the inventory
        inventoryContainer.appendChild(itemElement);
    }
}

// Activate the item's effect
function activateItemEffect(itemName, duration, itemElement) {
    if (itemElement.classList.contains('active')) return; // Prevent reactivation

    // Apply the item's effect
    switch (itemName) {
        case '+5 Seconds':
            timeLeft += 5; // Add 5 seconds to the timer
            document.getElementById('time-left').textContent = timeLeft;
            break;
        case 'No Reds for 7s':
            activateNoReds(duration); // Disable bad drops for the duration
            break;
        case 'Double Points for 10s':
            activateDoublePoints(duration); // Double points for the duration
            break;
        case 'Clear All Drops':
            clearAllDrops(); // Clear all drops immediately
            break;
        case 'Slow Drops for 10s':
            activateSlowDrops(duration); // Slow down drops for the duration
            break;
    }

    // Decrease the quantity or remove the item if quantity reaches 0
    const quantityElement = itemElement.querySelector('.quantity');
    const currentQuantity = parseInt(quantityElement.textContent, 10);
    if (currentQuantity > 1) {
        quantityElement.textContent = currentQuantity - 1;
    } else {
        itemElement.remove();
    }
}

// Update the inventory when purchasing items
document.getElementById('buy-btn').addEventListener('click', () => {
    const powerUpCosts = {
        addTime: 50,
        noReds: 100,
        doublePoints: 150,
        clearDrops: 200,
        slowDrops: 250,
    };

    const quantities = {
        addTime: parseInt(document.getElementById('addTime-qty').value, 10) || 0,
        noReds: parseInt(document.getElementById('noReds-qty').value, 10) || 0,
        doublePoints: parseInt(document.getElementById('doublePoints-qty').value, 10) || 0,
        clearDrops: parseInt(document.getElementById('clearDrops-qty').value, 10) || 0,
        slowDrops: parseInt(document.getElementById('slowDrops-qty').value, 10) || 0,
    };

    let totalCost = 0;
    for (const powerUp in quantities) {
        totalCost += quantities[powerUp] * powerUpCosts[powerUp];
    }

    if (score < totalCost) {
        alert('Not enough score to purchase these power-ups!');
        return;
    }

    score -= totalCost;
    document.getElementById('score').textContent = score;
    document.getElementById('total-currency').textContent = score;

    for (const powerUp in quantities) {
        for (let i = 0; i < quantities[powerUp]; i++) {
            switch (powerUp) {
                case 'addTime':
                    addToInventory('+5 Seconds', 0); // Add to inventory
                    break;
                case 'noReds':
                    addToInventory('No Reds for 7s', 7); // Add to inventory
                    break;
                case 'doublePoints':
                    addToInventory('Double Points for 10s', 10); // Add to inventory
                    break;
                case 'clearDrops':
                    addToInventory('Clear All Drops', 0); // Add to inventory
                    break;
                case 'slowDrops':
                    addToInventory('Slow Drops for 10s', 10); // Add to inventory
                    break;
            }
        }
    }

    document.getElementById('addTime-qty').value = 0;
    document.getElementById('noReds-qty').value = 0;
    document.getElementById('doublePoints-qty').value = 0;
    document.getElementById('clearDrops-qty').value = 0;
    document.getElementById('slowDrops-qty').value = 0;

    updateTotalCost();
    storeModal.style.display = 'none';
});
