import Game from './game.js';

console.log("Game starting...");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const game = new Game(ctx);
game.start();

console.log("Canvas initialized.");