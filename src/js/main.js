import { debugLog } from './debug.js';
import Game from './game.js';

debugLog('Game starting...');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.style.display = 'none';

function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
handleResize();
window.addEventListener('resize', handleResize);

const startScreen = document.getElementById('start-screen');
const embarkScreen = document.getElementById('embark-screen');
const seedInput = document.getElementById('seed-input');
const randomSeedButton = document.getElementById('random-seed');
const embarkButton = document.getElementById('embark-button');
const skillNames = ['farming', 'mining', 'building', 'crafting', 'cooking', 'combat', 'medical'];

function createSkillInputs(container) {
    const skillsDiv = container.querySelector('.skills');
    skillNames.forEach(skill => {
        const label = document.createElement('label');
        label.textContent = skill;
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.value = '0';
        input.dataset.skill = skill;
        label.appendChild(input);
        skillsDiv.appendChild(label);
    });
}

function setupPoints(container) {
    const pointsDisplay = container.querySelector('.points');
    const inputs = container.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            let total = 0;
            inputs.forEach(i => { total += parseInt(i.value) || 0; });
            if (total > 10) {
                const diff = total - 10;
                e.target.value = e.target.value - diff;
                total -= diff;
            }
            pointsDisplay.textContent = 10 - total;
        });
    });
}

createSkillInputs(document.getElementById('settler1'));
createSkillInputs(document.getElementById('settler2'));
setupPoints(document.getElementById('settler1'));
setupPoints(document.getElementById('settler2'));

randomSeedButton.addEventListener('click', () => {
    seedInput.value = Math.floor(Math.random() * 1000000);
});

document.getElementById('start-button').addEventListener('click', () => {
    startScreen.style.display = 'none';
    embarkScreen.style.display = 'flex';
});

function gatherSkills(container) {
    const skills = {};
    skillNames.forEach(skill => {
        const input = container.querySelector(`input[data-skill="${skill}"]`);
        skills[skill] = parseInt(input.value) || 0;
    });
    return skills;
}

embarkButton.addEventListener('click', () => {
    const seed = parseInt(seedInput.value) || Math.floor(Math.random() * 1000000);
    const settlers = [
        { name: 'Alice', skills: gatherSkills(document.getElementById('settler1')) },
        { name: 'Bob', skills: gatherSkills(document.getElementById('settler2')) },
    ];
    canvas.style.display = 'block';
    embarkScreen.style.display = 'none';
    const game = new Game(ctx, { seed, settlers });
    game.start();
});

debugLog('UI ready.');
