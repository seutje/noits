import Game from '../src/js/game.js';
import Settler from '../src/js/settler.js';
import Task from '../src/js/task.js';
import { TASK_TYPES } from '../src/js/constants.js';

describe('Game auto pause task', () => {
    test('task pauses after being unassigned more than 5 times within a second', () => {
        jest.spyOn(Date, 'now')
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(100)
            .mockReturnValueOnce(200)
            .mockReturnValueOnce(300)
            .mockReturnValueOnce(400)
            .mockReturnValueOnce(500)
            .mockReturnValue(600);

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
        const alice = new Settler(
            'Alice',
            0,
            0,
            game.resourceManager,
            game.map,
            game.roomManager,
            game.spriteManager,
            game.settlers,
            defaultSkills,
        );
        alice.updateNeeds = jest.fn();
        alice.state = 'idle';
        game.settlers = [alice];
        game.roomManager.setSettlers(game.settlers);

        const task = new Task(TASK_TYPES.BUILD, 1, 1);
        game.taskManager.addTask(task);

        game.update(16);

        for (let i = 0; i < 6; i++) {
            game.unassignTask(task);
            game.update(16);
        }

        expect(task.paused).toBe(true);

        Date.now.mockRestore();
    });
});
