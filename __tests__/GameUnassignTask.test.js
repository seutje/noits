import Game from '../src/js/game.js';
import Settler from '../src/js/settler.js';
import Task from '../src/js/task.js';
import { TASK_TYPES } from '../src/js/constants.js';

describe('Game unassign task', () => {
    test('unassignTask clears assignment and reassigns when idle settler available', () => {
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
            { ...defaultSkills },
        );
        const bob = new Settler(
            'Bob',
            0,
            0,
            game.resourceManager,
            game.map,
            game.roomManager,
            game.spriteManager,
            game.settlers,
            { ...defaultSkills },
        );
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
        expect(bob.currentTask).toBeNull();

        alice.state = 'busy';
        game.unassignTask(task);

        expect(alice.currentTask).toBeNull();
        expect(task.assigned).toBe('Bob');
        expect(bob.currentTask).toBe(task);
    });
});
