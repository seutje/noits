import Task from '../src/js/task.js';
import { TASK_TYPES } from '../src/js/constants.js';

describe('Task', () => {
    test('should create a task with default priority', () => {
        const task = new Task(TASK_TYPES.CHOP_WOOD, 10, 20);
        expect(task.type).toBe(TASK_TYPES.CHOP_WOOD);
        expect(task.targetX).toBe(10);
        expect(task.targetY).toBe(20);
        expect(task.resourceType).toBe(null);
        expect(task.quantity).toBe(0);
        expect(task.priority).toBe(1);
        expect(task.assignedSettler).toBe(null);
    });

    test('should create a task with specified priority', () => {
        const task = new Task(TASK_TYPES.MINE_STONE, 5, 5, null, 0, 5);
        expect(task.priority).toBe(5);
    });

    test('should create a task with resource details', () => {
        const task = new Task('gather_food', 1, 2, 'berries', 10);
        expect(task.resourceType).toBe('berries');
        expect(task.quantity).toBe(10);
    });

    test('should store target enemy for butcher task', () => {
        const mockEnemy = { id: 1, name: 'Goblin' };
        const task = new Task(TASK_TYPES.BUTCHER, 3, 4, 'meat', 1, 2, null, null, null, null, null, null, mockEnemy);
        expect(task.targetEnemy).toBe(mockEnemy);
    });
});