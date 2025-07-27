import { debugLog } from './debug.js';
import Game from './game.js';

debugLog("Game starting...");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Set initial canvas size
handleResize();

// Adjust canvas size on window resize
window.addEventListener('resize', handleResize);

const game = new Game(ctx);
game.start();

debugLog("Canvas initialized.");