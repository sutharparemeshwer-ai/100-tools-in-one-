// js/tools/virtual-piano.js

// Map keyboard key codes to HTML data-key attributes
const KEY_MAP = {
    'a': 'C', 's': 'D', 'd': 'E', 'f': 'F', 'g': 'G', 'h': 'A', 'j': 'B',
    'w': 'C#', 'e': 'D#', 't': 'F#', 'y': 'G#', 'u': 'A#'
};

// Map notes to an arbitrary pitch multiplier for a single sound file
// These values are calculated to create different musical steps (notes).
// These values are based on the 12-tone equal temperament scale.
const PITCH_MAP = {
    'C': 1.0, 'C#': 1.059, 'D': 1.122, 'D#': 1.189, 'E': 1.260, 'F': 1.335,
    'F#': 1.414, 'G': 1.498, 'G#': 1.587, 'A': 1.682, 'A#': 1.782, 'B': 1.888
};

// DOM Elements
let allKeys;
let baseAudioSrc; // We'll store the source path

// --- Core Logic ---

/**
 * Plays the note and updates the key visual.
 */
function playNote(note, keyElement) {
    if (!baseAudioSrc) return;

    // 1. Create a new Audio object for each note play
    const audio = new Audio(baseAudioSrc);

    // 2. Set the playback rate (PITCH) based on the note map
    audio.playbackRate = PITCH_MAP[note] || 1.0;

    // 3. Play the sound
    audio.play().catch(e => console.warn("Audio playback failed (usually harmless):", e));

    // The audio will play to its natural end. If you want to cut it short,
    // you could add a timeout to pause it, but it's often not necessary.

    // 4. Set Active State for Visual Feedback
    if (keyElement) {
        keyElement.classList.add('active');
        setTimeout(() => {
            keyElement.classList.remove('active');
        }, 150);
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
    const audioEl = document.getElementById('piano-sound');
    allKeys = document.querySelectorAll('.key');

    if (audioEl) {
        baseAudioSrc = audioEl.src;
    }

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