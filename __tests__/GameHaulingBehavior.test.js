import Game from '../src/js/game.js';
import Settler from '../src/js/settler.js';
import Task from '../src/js/task.js';

// This test uses the real modules to verify that settlers do not
// pick up haul tasks when they are already carrying a resource.

describe('Game hauling behavior', () => {
    test('settler carrying resource ignores haul tasks', () => {
        const ctx = { canvas: { width: 800, height: 600 }, clearRect: jest.fn(), drawImage: jest.fn() };
        const game = new Game(ctx);
        const settler = new Settler('Bob', 0, 0, game.resourceManager, game.map, game.roomManager, game.spriteManager, game.settlers);
        settler.updateNeeds = jest.fn();
        settler.carrying = { type: 'wood', quantity: 1 };
        settler.state = 'idle';
        game.settlers.push(settler);
        game.roomManager.setSettlers(game.settlers);

        const haulTask = new Task('haul', 0, 0, 'wood', 1, 2, null, null, null, null, null, null, null, 0, 0);
        game.taskManager.addTask(haulTask);

        game.update(16);

        expect(settler.currentTask).toBe(null);
        expect(game.taskManager.tasks.length).toBe(1);
    });
});
