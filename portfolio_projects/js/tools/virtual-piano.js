// js/tools/virtual-piano.js

// Map keyboard key codes to HTML data-key attributes
const KEY_MAP = {
    'a': 'C', 's': 'D', 'd': 'E', 'f': 'F', 'g': 'G', 'h': 'A', 'j': 'B',
    'w': 'C#', 'e': 'D#', 't': 'F#', 'y': 'G#', 'u': 'A#'
};

// Map notes to an arbitrary pitch multiplier for a single sound file
// These values are calculated to create different musical steps (notes).
const PITCH_MAP = {
    'C': 1.0, 'C#': 1.06, 'D': 1.12, 'D#': 1.19, 'E': 1.26, 'F': 1.33,
    'F#': 1.41, 'G': 1.5, 'G#': 1.59, 'A': 1.68, 'A#': 1.78, 'B': 1.89
};

// DOM Elements
let audioEl, allKeys;

// --- Core Logic ---

/**
 * Plays the note and updates the key visual.
 */
function playNote(note, keyElement) {
    if (!audioEl) return;

    // 1. Set the playback rate (PITCH) based on the note map
    audioEl.playbackRate = PITCH_MAP[note] || 1.0; 
    
    // 2. Play the sound
    audioEl.currentTime = 0; // Reset to start for immediate play
    audioEl.play().catch(e => console.warn("Audio playback failed (usually harmless):", e));

    // 3. Stop the audio after 400ms (0.4 seconds)
    setTimeout(() => {
        if (!audioEl.paused) {
            audioEl.pause();
        }
    }, 400); // 400 milliseconds = 0.4 seconds

    // 4. Set Active State (Visual Feedback)
    if (keyElement) {
        keyElement.classList.add('active');
        setTimeout(() => {
            keyElement.classList.remove('active');
        }, 100);
    }
}

/**
 * Handles mouse click on a piano key.
 */
function handleKeyClick(e) {
    const note = e.currentTarget.dataset.note;
    playNote(note, e.currentTarget);
}

/**
 * Handles keyboard key press down.
 */
function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    
    if (key === ' ' || KEY_MAP[key]) e.preventDefault(); 
    
    const keyElement = document.querySelector(`.key[data-key="${key}"]`);
    
    if (keyElement && !keyElement.classList.contains('active')) {
        const note = keyElement.dataset.note;
        playNote(note, keyElement);
    }
}

/**
 * Handles keyboard key release.
 */
function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    const keyElement = document.querySelector(`.key[data-key="${key}"]`);
    if (keyElement) {
        keyElement.classList.remove('active');
    }
}

// --- Router Hooks ---

export function init() {
    // 1. Get DOM elements
    audioEl = document.getElementById('piano-sound');
    allKeys = document.querySelectorAll('.key');

    // 2. Attach listeners for mouse clicks
    allKeys.forEach(key => {
        key.addEventListener('click', handleKeyClick);
    });

    // 3. Attach listeners for keyboard input
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

export function cleanup() {
    // Remove listeners
    allKeys.forEach(key => {
        key.removeEventListener('click', handleKeyClick);
    });
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
}