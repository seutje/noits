import Game from '../src/js/game.js';
import Settler from '../src/js/settler.js';
import Task from '../src/js/task.js';
import { TASK_TYPES } from '../src/js/constants.js';

describe('Game pause task', () => {
    test('pauseTask unassigns settler and prevents reassignment until unpaused', () => {
        const ctx = { canvas: { width: 800, height: 600 }, clearRect: jest.fn(), drawImage: jest.fn() };
        const game = new Game(ctx);
        const alice = new Settler('Alice', 0, 0, game.resourceManager, game.map, game.roomManager, game.spriteManager, game.settlers);
        const bob = new Settler('Bob', 0, 0, game.resourceManager, game.map, game.roomManager, game.spriteManager, game.settlers);
        alice.updateNeeds = jest.fn();
        bob.updateNeeds = jest.fn();
        alice.state = 'idle';
        bob.state = 'idle';
        game.settlers = [alice, bob];
        game.roomManager.setSettlers(game.settlers);

        const task = new Task(TASK_TYPES.BUILD, 1, 1);
        game.taskManager.addTask(task);

        game.update(16);

        expect(task.assigned).toBe('Alice');
        expect(alice.currentTask).toBe(task);

        game.pauseTask(task);

        expect(task.paused).toBe(true);
        expect(task.assigned).toBeNull();
        expect(alice.currentTask).toBeNull();
        expect(bob.currentTask).toBeNull();

        game.unpauseTask(task);

        expect(task.paused).toBe(false);
        expect(task.assigned).toBe('Alice');
    });
});
