// js/tools/minesweeper.js

// DOM Elements
let grid, flagsLeftDisplay, statusDisplay, resetBtn;

// Game Constants
const GRID_WIDTH = 10;
const MINE_COUNT = 10;

// Game State
let squares = [];
let isGameOver = false;
let flags = 0;

function createBoard() {
    flagsLeftDisplay.textContent = MINE_COUNT;
    isGameOver = false;
    flags = 0;
    statusDisplay.textContent = 'Good Luck!';

    const minesArray = Array(MINE_COUNT).fill('mine');
    const emptyArray = Array(GRID_WIDTH * GRID_WIDTH - MINE_COUNT).fill('valid');
    const gameArray = emptyArray.concat(minesArray).sort(() => Math.random() - 0.5);

    grid.innerHTML = '';
    squares = [];

    for (let i = 0; i < GRID_WIDTH * GRID_WIDTH; i++) {
        const square = document.createElement('div');
        square.setAttribute('id', i);
        square.classList.add(gameArray[i]);
        square.style.width = `${100 / GRID_WIDTH}%`;
        square.style.height = `${100 / GRID_WIDTH}%`;
        square.style.border = '1px solid #999';
        square.style.boxSizing = 'border-box';
        square.style.textAlign = 'center';
        square.style.lineHeight = '40px';
        square.style.fontWeight = 'bold';
        square.style.cursor = 'pointer';
        square.style.backgroundColor = '#ccc';
        grid.appendChild(square);
        squares.push(square);

        square.addEventListener('click', () => handleClick(square));
        square.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            addFlag(square);
        });
    }

    for (let i = 0; i < squares.length; i++) {
        let total = 0;
        const isLeftEdge = (i % GRID_WIDTH === 0);
        const isRightEdge = (i % GRID_WIDTH === GRID_WIDTH - 1);

        if (squares[i].classList.contains('valid')) {
            if (i > 0 && !isLeftEdge && squares[i - 1].classList.contains('mine')) total++;
            if (i > 9 && !isRightEdge && squares[i + 1 - GRID_WIDTH].classList.contains('mine')) total++;
            if (i > 10 && squares[i - GRID_WIDTH].classList.contains('mine')) total++;
            if (i > 11 && !isLeftEdge && squares[i - 1 - GRID_WIDTH].classList.contains('mine')) total++;
            if (i < 98 && !isRightEdge && squares[i + 1].classList.contains('mine')) total++;
            if (i < 90 && !isLeftEdge && squares[i - 1 + GRID_WIDTH].classList.contains('mine')) total++;
            if (i < 88 && !isRightEdge && squares[i + 1 + GRID_WIDTH].classList.contains('mine')) total++;
            if (i < 89 && squares[i + GRID_WIDTH].classList.contains('mine')) total++;
            squares[i].setAttribute('data', total);
        }
    }
}

function handleClick(square) {
    if (isGameOver || square.classList.contains('checked') || square.classList.contains('flag')) return;

    if (square.classList.contains('mine')) {
        gameOver(false);
    } else {
        let total = square.getAttribute('data');
        if (total != 0) {
            square.classList.add('checked');
            square.textContent = total;
            square.style.backgroundColor = '#ddd';
            return;
        }
        checkSquare(square);
    }
    square.classList.add('checked');
    square.style.backgroundColor = '#ddd';
}

function checkSquare(square) {
    const currentId = parseInt(square.id);
    setTimeout(() => {
        const isLeftEdge = (currentId % GRID_WIDTH === 0);
        const isRightEdge = (currentId % GRID_WIDTH === GRID_WIDTH - 1);

        if (currentId > 0 && !isLeftEdge) handleClick(squares[currentId - 1]);
        if (currentId > 9 && !isRightEdge) handleClick(squares[currentId + 1 - GRID_WIDTH]);
        if (currentId > 10) handleClick(squares[currentId - GRID_WIDTH]);
        if (currentId > 11 && !isLeftEdge) handleClick(squares[currentId - 1 - GRID_WIDTH]);
        if (currentId < 98 && !isRightEdge) handleClick(squares[currentId + 1]);
        if (currentId < 90 && !isLeftEdge) handleClick(squares[currentId - 1 + GRID_WIDTH]);
        if (currentId < 88 && !isRightEdge) handleClick(squares[currentId + 1 + GRID_WIDTH]);
        if (currentId < 89) handleClick(squares[currentId + GRID_WIDTH]);
    }, 10);
}

function addFlag(square) {
    if (isGameOver || square.classList.contains('checked')) return;
    if (!square.classList.contains('flag') && flags < MINE_COUNT) {
        square.classList.add('flag');
        square.textContent = '🚩';
        flags++;
    } else if (square.classList.contains('flag')) {
        square.classList.remove('flag');
        square.textContent = '';
        flags--;
    }
    flagsLeftDisplay.textContent = MINE_COUNT - flags;
    checkForWin();
}

function gameOver(isWin) {
    isGameOver = true;
    statusDisplay.textContent = isWin ? 'YOU WIN!' : 'GAME OVER!';
    squares.forEach(square => {
        if (square.classList.contains('mine')) {
            square.textContent = '💣';
            square.style.backgroundColor = '#f8d7da';
        }
    });
}

function checkForWin() {
    let matches = 0;
    for (let i = 0; i < squares.length; i++) {
        if (squares[i].classList.contains('flag') && squares[i].classList.contains('mine')) {
            matches++;
        }
    }
    if (matches === MINE_COUNT) {
        gameOver(true);
    }
}

export function init() {
    grid = document.getElementById('minesweeper-grid');
    flagsLeftDisplay = document.getElementById('m-flags-left');
    statusDisplay = document.getElementById('m-game-status');
    resetBtn = document.getElementById('m-reset-btn');

    createBoard();
    resetBtn.addEventListener('click', createBoard);
}

export function cleanup() {
    resetBtn?.removeEventListener('click', createBoard);
}