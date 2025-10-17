// js/tools/blackjack.js

let deck = [];
let playerCards = [];
let dealerCards = [];
let gameOver = false;

const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// ------------------------------------
// Router Lifecycle Functions
// ------------------------------------
export function init() {
  document.getElementById('start-btn').addEventListener('click', startGame);
  document.getElementById('hit-btn').addEventListener('click', playerHit);
  document.getElementById('stand-btn').addEventListener('click', playerStand);
  // Ensure buttons are disabled on initial load until game starts
  document.getElementById('hit-btn').disabled = true;
  document.getElementById('stand-btn').disabled = true;
}

export function cleanup() {
  document.getElementById('start-btn').removeEventListener('click', startGame);
  document.getElementById('hit-btn').removeEventListener('click', playerHit);
  document.getElementById('stand-btn').removeEventListener('click', playerStand);
}

// ------------------------------------
// Core Game Logic
// ------------------------------------
function createDeck() {
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
  deck = shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startGame() {
  gameOver = false;
  document.getElementById('game-result').textContent = 'Game in progress...';
  
  createDeck();
  playerCards = [deck.pop(), deck.pop()];
  dealerCards = [deck.pop(), deck.pop()]; // Dealer's first card is face down
  
  // Check for immediate Blackjack
  if (calculateScore(playerCards) === 21) {
    endGame("Blackjack! Player wins!");
    return;
  }
  
  updateUI();
}

function playerHit() {
  if (gameOver) return;
  playerCards.push(deck.pop());
  const score = calculateScore(playerCards);
  
  if (score > 21) {
    endGame("Player busts! Dealer wins.");
  }
  updateUI();
}

function playerStand() {
  if (gameOver) return;
  gameOver = true;

  // Dealer's turn: hit until score is 17 or more
  while (calculateScore(dealerCards) < 17) {
    dealerCards.push(deck.pop());
  }
  
  // Determine winner after dealer stands
  determineWinner();
  updateUI();
}

function determineWinner() {
  const playerScore = calculateScore(playerCards);
  const dealerScore = calculateScore(dealerCards);

  if (playerScore > 21) {
    // Should have been caught in playerHit, but here for safety
    endGame("Player busts! Dealer wins.");
  } else if (dealerScore > 21) {
    endGame("Dealer busts! Player wins.");
  } else if (dealerScore > playerScore) {
    endGame("Dealer wins!");
  } else if (dealerScore < playerScore) {
    endGame("Player wins!");
  } else {
    endGame("It's a tie!");
  }
}

function endGame(message) {
  gameOver = true;
  document.getElementById('game-result').textContent = message;
  document.getElementById('hit-btn').disabled = true;
  document.getElementById('stand-btn').disabled = true;
  document.getElementById('start-btn').disabled = false;
}

function calculateScore(cards) {
  let sum = 0;
  let aceCount = 0;
  for (let card of cards) {
    if (['J','Q','K'].includes(card.value)) sum += 10;
    else if (card.value === 'A') {
      sum += 11;
      aceCount++;
    } else sum += Number(card.value);
  }
  while (sum > 21 && aceCount > 0) {
    sum -= 10;
    aceCount--;
  }
  return sum;
}

// ------------------------------------
// UI/Design Logic (The fixed card display)
// ------------------------------------
function updateUI() {
  const playerDiv = document.getElementById('player-cards');
  const dealerDiv = document.getElementById('dealer-cards');
  const resultDiv = document.getElementById('game-result');

  playerDiv.innerHTML = '';
  dealerDiv.innerHTML = '';

  const getCardHTML = (card, isHidden = false) => {
    let suitColor = (card.suit === '♥' || card.suit === '♦') ? 'text-danger' : 'text-dark';
    let content = isHidden ? 
        '<div class="card-back">?</div>' : 
        `<span class="card-value">${card.value}</span><span class="card-suit ${suitColor}">${card.suit}</span>`;
    
    return `<div class="card-element mytool shadow-sm me-2 mb-2">${content}</div>`;
  };

  // Player Cards
  playerCards.forEach(c => { playerDiv.innerHTML += getCardHTML(c); });

  // Dealer Cards (Hide the first card unless game is over)
  dealerCards.forEach((c, index) => { 
    let isHidden = !gameOver && index === 0;
    dealerDiv.innerHTML += getCardHTML(c, isHidden); 
  });
  
  // Score Update Logic
  let playerScore = calculateScore(playerCards);
  let dealerScoreText = gameOver ? calculateScore(dealerCards) : '?';
  
  document.getElementById('player-score').textContent = playerScore;
  document.getElementById('dealer-score').textContent = dealerScoreText;

  // Update button states
  document.getElementById('hit-btn').disabled = gameOver;
  document.getElementById('stand-btn').disabled = gameOver;
  document.getElementById('start-btn').disabled = !gameOver;
  
  // If the game just started and buttons are enabled, clear the result text
  if (!gameOver && resultDiv.textContent === 'Game in progress...') {
      // Keep "Game in progress..."
  } else if (!gameOver) {
      // Clear message if it's not the start message and not game over
      resultDiv.textContent = '';
  }
}