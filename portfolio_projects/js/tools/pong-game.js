// js/tools/pong-game.js

// --- DOM Elements & Canvas ---
let canvas, ctx;
let player1ScoreEl, player2ScoreEl, startBtn, gameStatusEl;

// --- Game Constants ---
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 10;
const BALL_RADIUS = 10;
const PADDLE_SPEED = 8;

// --- Game State ---
let ballX, ballY, ballSpeedX, ballSpeedY;
let paddle1Y, paddle2Y;
let player1Score = 0;
let player2Score = 0;
let gameInterval = null;
const keysPressed = {};

// --- Drawing Functions ---
const drawRect = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
};

const drawCircle = (x, y, r, color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.fill();
};

const drawNet = () => {
    for (let i = 0; i < canvas.height; i += 40) {
        drawRect(canvas.width / 2 - 1, i, 2, 20, 'white');
    }
};

const drawGame = () => {
    // Background
    drawRect(0, 0, canvas.width, canvas.height, '#000');
    // Net
    drawNet();
    // Paddles
    drawRect(0, paddle1Y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    drawRect(canvas.width - PADDLE_WIDTH, paddle2Y, PADDLE_WIDTH, PADDLE_HEIGHT, 'white');
    // Ball
    drawCircle(ballX, ballY, BALL_RADIUS, 'white');
};

// --- Game Logic ---
const resetBall = () => {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    // Send ball towards the winner of the last point, or randomly at start
    ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * 5;
};

const movePaddles = () => {
    // Player 1 (W, S)
    if (keysPressed['w'] && paddle1Y > 0) {
        paddle1Y -= PADDLE_SPEED;
    }
    if (keysPressed['s'] && paddle1Y < canvas.height - PADDLE_HEIGHT) {
        paddle1Y += PADDLE_SPEED;
    }
    // Player 2 (ArrowUp, ArrowDown)
    if (keysPressed['ArrowUp'] && paddle2Y > 0) {
        paddle2Y -= PADDLE_SPEED;
    }
    if (keysPressed['ArrowDown'] && paddle2Y < canvas.height - PADDLE_HEIGHT) {
        paddle2Y += PADDLE_SPEED;
    }
};

const moveBall = () => {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Wall collision (top/bottom)
    if (ballY < BALL_RADIUS || ballY > canvas.height - BALL_RADIUS) {
        ballSpeedY = -ballSpeedY;
    }

    // Paddle collision
    // Player 1
    if (ballX < PADDLE_WIDTH + BALL_RADIUS && ballY > paddle1Y && ballY < paddle1Y + PADDLE_HEIGHT) {
        ballSpeedX = -ballSpeedX;
        // Increase speed slightly on hit
        ballSpeedX *= 1.05;
        ballSpeedY *= 1.05;
    }
    // Player 2
    if (ballX > canvas.width - PADDLE_WIDTH - BALL_RADIUS && ballY > paddle2Y && ballY < paddle2Y + PADDLE_HEIGHT) {
        ballSpeedX = -ballSpeedX;
        ballSpeedX *= 1.05;
        ballSpeedY *= 1.05;
    }

    // Score detection
    if (ballX < 0) {
        player2Score++;
        player2ScoreEl.textContent = player2Score;
        resetBall();
    }
    if (ballX > canvas.width) {
        player1Score++;
        player1ScoreEl.textContent = player1Score;
        resetBall();
    }
};

const gameLoop = () => {
    movePaddles();
    moveBall();
    drawGame();
};

// --- Game Control ---
const startGame = () => {
    if (gameInterval) return; // Game already running

    player1Score = 0;
    player2Score = 0;
    player1ScoreEl.textContent = '0';
    player2ScoreEl.textContent = '0';

    paddle1Y = (canvas.height - PADDLE_HEIGHT) / 2;
    paddle2Y = (canvas.height - PADDLE_HEIGHT) / 2;

    resetBall();
    gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS

    startBtn.textContent = 'Reset Game';
    gameStatusEl.textContent = 'Game On!';
};

// --- Event Handlers ---
const handleKeyDown = (e) => {
    keysPressed[e.key] = true;
};

const handleKeyUp = (e) => {
    keysPressed[e.key] = false;
};

// --- Router Hooks ---
export function init() {
    // Get DOM elements
    canvas = document.getElementById('pong-canvas');
    ctx = canvas.getContext('2d');
    player1ScoreEl = document.getElementById('player1-score');
    player2ScoreEl = document.getElementById('player2-score');
    startBtn = document.getElementById('pong-start-btn');
    gameStatusEl = document.getElementById('pong-game-status');

    // Initial draw
    drawGame();

    // Attach event listeners
    startBtn.addEventListener('click', startGame);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

export function cleanup() {
    // Stop game loop and remove listeners
    clearInterval(gameInterval);
    gameInterval = null;
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    startBtn.removeEventListener('click', startGame);
}