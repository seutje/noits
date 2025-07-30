import Game from '../src/js/game.js';
import Settler from '../src/js/settler.js';
import Task from '../src/js/task.js';
import { TASK_TYPES } from '../src/js/constants.js';

describe('Game gathering behavior', () => {
    test('settler carrying resource ignores new gather tasks', () => {
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

        const gatherTask = new Task(TASK_TYPES.CHOP_WOOD, 0, 0, 'wood', 1, 2);
        game.taskManager.addTask(gatherTask);

        game.update(16);

        expect(settler.currentTask).toBe(null);
        expect(game.taskManager.tasks.length).toBe(1);
    });
});
