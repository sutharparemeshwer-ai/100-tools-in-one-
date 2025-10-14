// js/tools/color-game.js

// --- State Variables ---
let numSquares = 6;
let colors = [];
let pickedColor;
let gameOver = false; // Add a flag to track game state

// --- DOM Elements ---
let colorBoxesContainer, colorDisplay, messageDisplay, newColorsBtn;

/**
 * Generates a random RGB color string.
 * e.g., "rgb(255, 0, 120)"
 */
function randomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Creates an array of random RGB color strings.
 * @param {number} num The number of colors to generate.
 */
function generateRandomColors(num) {
    let arr = [];
    for (let i = 0; i < num; i++) {
        arr.push(randomColor());
    }
    return arr;
}

/**
 * Selects a random color from the `colors` array to be the correct answer.
 */
function pickColor() {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
}

/**
 * Changes all squares to the correct color when the user guesses correctly.
 * @param {string} color The color to apply to all squares.
 */
function changeColors(color) {
    const squares = colorBoxesContainer.querySelectorAll('.color-box');
    squares.forEach(square => {
        square.style.backgroundColor = color;
    });
}

/**
 * Resets the game to a new state.
 */
function resetGame() {
    gameOver = false; // Reset the game state
    colors = generateRandomColors(numSquares);
    pickedColor = pickColor();
    colorDisplay.textContent = pickedColor.toUpperCase();
    messageDisplay.textContent = "Pick a color!";
    newColorsBtn.textContent = "New Colors";

    // Clear existing boxes and create new ones
    colorBoxesContainer.innerHTML = '';
    for (let i = 0; i < colors.length; i++) {
        const square = document.createElement('div');
        square.className = 'color-box';
        square.style.backgroundColor = colors[i];
        square.addEventListener('click', handleColorClick);
        colorBoxesContainer.appendChild(square);
    }
}

/**
 * Handles the click event on a color square.
 */
function handleColorClick(event) {
    // If the game is over, do nothing
    if (gameOver) return;

    const clickedColor = event.target.style.backgroundColor;

    if (clickedColor === pickedColor) {
        messageDisplay.textContent = "Correct! 🎉"; // Corrected typo
        newColorsBtn.textContent = "Play Again?";
        changeColors(pickedColor);
    } else {
        event.target.style.backgroundColor = 'transparent'; // Hide wrong guess
        messageDisplay.textContent = "Try Again";
    }
}

// --- Router Hooks ---

export function init() {
    // Get DOM elements
    colorBoxesContainer = document.getElementById('color-boxes');
    colorDisplay = document.getElementById('color-display');
    messageDisplay = document.getElementById('message');
    newColorsBtn = document.getElementById('new-colors-btn');

    // Attach event listeners
    if (newColorsBtn) {
        newColorsBtn.addEventListener('click', resetGame);
    }

    // Start the game
    resetGame();
}

export function cleanup() {
    // Remove event listeners to prevent memory leaks
    if (newColorsBtn) {
        newColorsBtn.removeEventListener('click', resetGame);
    }
    // The listeners on the color boxes are removed automatically
    // when `innerHTML` is cleared in `resetGame`.
}