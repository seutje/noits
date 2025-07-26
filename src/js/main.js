import Game from './game.js';

console.log("Game starting...");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const game = new Game(ctx);
game.start();

document.getElementById('addBandage').addEventListener('click', () => {
    game.resourceManager.addResource('bandage', 1);
    console.log('Bandage added');
});

document.getElementById('injureSettler').addEventListener('click', () => {
    if (game.settlers.length > 0) {
        game.settlers[0].takeDamage('torso', 20, true);
    }
});

console.log("Canvas initialized.");