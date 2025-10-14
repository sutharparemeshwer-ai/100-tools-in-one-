// js/tools/hangman-app.js

// DOM Elements
let wordDisplayEl, wrongGuessesCountEl, keyboardContainerEl, resetBtnEl, gameMessageEl, hangmanDrawingEl;

// Game Configuration
const MAX_WRONG_GUESSES = 6;
const WORDS = [
    "JAVASCRIPT", "PYTHON", "HTML", "CSS", "CODE", "PROGRAMMING", 
    "ALGORITHM", "FUNCTION", "VARIABLE", "DATABASE", "FRONTEND", "BACKEND"
];

// Game State
let secretWord = '';
let guessedLetters = [];
let wrongGuesses = 0;
let isGameOver = false;

// SVG Parts to draw on wrong guesses (6 parts total)
const HANGMAN_PARTS = [
    // 1: Head (circle)
    '<circle id="head" cx="100" cy="50" r="20" stroke="#000" stroke-width="4" fill="none" />',
    // 2: Body (line)
    '<line id="body" x1="100" y1="70" x2="100" y2="130" stroke="#000" stroke-width="4" />',
    // 3: Left Arm (line)
    '<line id="left-arm" x1="100" y1="80" x2="80" y2="100" stroke="#000" stroke-width="4" />',
    // 4: Right Arm (line)
    '<line id="right-arm" x1="100" y1="80" x2="120" y2="100" stroke="#000" stroke-width="4" />',
    // 5: Left Leg (line)
    '<line id="left-leg" x1="100" y1="130" x2="80" y2="150" stroke="#000" stroke-width="4" />',
    // 6: Right Leg (line)
    '<line id="right-leg" x1="100" y1="130" x2="120" y2="150" stroke="#000" stroke-width="4" />'
];

// --- Core Game Functions ---

/**
 * Initializes or resets the game state.
 */
function initializeGame() {
    // 1. Reset State
    secretWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    guessedLetters = [];
    wrongGuesses = 0;
    isGameOver = false;

    // 2. Reset DOM
    renderWordDisplay();
    renderKeyboard();
    updateDrawing();
    wrongGuessesCountEl.textContent = wrongGuesses;
    gameMessageEl.textContent = "Guess a letter!";
    gameMessageEl.classList.remove('text-success', 'text-danger');
    gameMessageEl.classList.add('text-info');
}

/**
 * Renders the hidden word with correctly guessed letters.
 */
function renderWordDisplay() {
    let display = '';
    let wordGuessed = true;
    for (const letter of secretWord) {
        if (guessedLetters.includes(letter)) {
            display += letter;
        } else {
            display += '_';
            wordGuessed = false;
        }
    }
    wordDisplayEl.textContent = display.split('').join(' '); // Add spaces for visual separation

    if (wordGuessed && !isGameOver) {
        endGame(true);
    }
}

/**
 * Creates and renders the A-Z keyboard buttons.
 */
function renderKeyboard() {
    keyboardContainerEl.innerHTML = '';
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (const letter of alphabet) {
        const button = document.createElement('button');
        button.className = 'btn letter-btn';
        button.textContent = letter;
        button.disabled = false;
        button.addEventListener('click', () => handleGuess(letter, button));
        keyboardContainerEl.appendChild(button);
    }
}

/**
 * Adds the appropriate SVG parts to the drawing based on wrong guesses.
 */
function updateDrawing() {
    // Clear previous dynamic parts (from previous wrong guesses)
    const existingParts = hangmanDrawingEl.querySelectorAll('.hangman-part');
    existingParts.forEach(part => part.remove());

    const gallowElements = hangmanDrawingEl.querySelectorAll('line');

    // Add only the parts corresponding to the number of wrong guesses
    for (let i = 0; i < wrongGuesses; i++) {
        if (i < HANGMAN_PARTS.length) {
            const part = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            part.innerHTML = HANGMAN_PARTS[i];
            part.classList.add('hangman-part');
            hangmanDrawingEl.appendChild(part);
        }
    }
}

// --- Game Logic ---

/**
 * Handles a user's letter guess.
 */
function handleGuess(letter, button) {
    if (isGameOver || guessedLetters.includes(letter)) return;

    guessedLetters.push(letter);
    button.disabled = true;

    if (secretWord.includes(letter)) {
        // Correct guess
        button.classList.add('correct');
        renderWordDisplay();
    } else {
        // Wrong guess
        wrongGuesses++;
        button.classList.add('wrong');
        wrongGuessesCountEl.textContent = wrongGuesses;
        updateDrawing();

        if (wrongGuesses >= MAX_WRONG_GUESSES) {
            endGame(false);
        }
    }
}

/**
 * Ends the game and updates the UI for win or loss.
 */
function endGame(win) {
    isGameOver = true;
    
    // Disable all keyboard buttons
    keyboardContainerEl.querySelectorAll('.letter-btn').forEach(btn => btn.disabled = true);

    if (win) {
        gameMessageEl.textContent = "You Won! 🎉";
        gameMessageEl.classList.remove('text-info');
        gameMessageEl.classList.add('text-success');
    } else {
        gameMessageEl.textContent = `Game Over! The word was: ${secretWord}`;
        gameMessageEl.classList.remove('text-info');
        gameMessageEl.classList.add('text-danger');
        
        // Finalize the drawing if not all parts were drawn
        updateDrawing();
    }
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    wordDisplayEl = document.getElementById('word-display');
    wrongGuessesCountEl = document.getElementById('wrong-guesses-count');
    keyboardContainerEl = document.getElementById('keyboard-container');
    resetBtnEl = document.getElementById('reset-btn');
    gameMessageEl = document.getElementById('game-message');
    hangmanDrawingEl = document.getElementById('hangman-drawing');

    // 2. Attach listeners
    if (resetBtnEl) {
        resetBtnEl.addEventListener('click', initializeGame);
    }
    
    // 3. Start the game!
    initializeGame();
}

export function cleanup() {
    if (resetBtnEl) {
        resetBtnEl.removeEventListener('click', initializeGame);
    }
    // No need to clear innerHTML as initializeGame resets it on load
}