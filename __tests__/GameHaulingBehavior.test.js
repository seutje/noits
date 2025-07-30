import Game from '../src/js/game.js';
import Settler from '../src/js/settler.js';
import Task from '../src/js/task.js';
import { TASK_TYPES } from '../src/js/constants.js';

// This test uses the real modules to verify that settlers do not
// pick up haul tasks when they are already carrying a resource.

describe('Game hauling behavior', () => {
    test('settler carrying resource ignores haul tasks', () => {
        const ctx = { canvas: { width: 800, height: 600 }, clearRect: jest.fn(), drawImage: jest.fn() };
        const game = new Game(ctx);
        const defaultSkills = {
            farming: 1,
            mining: 1,
            building: 1,
            crafting: 1,
            cooking: 1,
            combat: 1,
            medical: 1,
        };
        const settler = new Settler(
            'Bob',
            0,
            0,
            game.resourceManager,
            game.map,
            game.roomManager,
            game.spriteManager,
            game.settlers,
            defaultSkills,
        );
        settler.updateNeeds = jest.fn();
        settler.carrying = { type: 'wood', quantity: 1 };
        settler.state = 'idle';
        game.settlers.push(settler);
        game.roomManager.setSettlers(game.settlers);

        const haulTask = new Task(TASK_TYPES.HAUL, 0, 0, 'wood', 1, 2, null, null, null, null, null, null, null, 0, 0);
        game.taskManager.addTask(haulTask);

        game.update(16);

        expect(settler.currentTask).toBe(null);
        expect(game.taskManager.tasks.length).toBe(1);
    });
});
