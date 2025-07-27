import TaskManager from '../src/js/taskManager.js';
import Task from '../src/js/task.js';
import { TASK_TYPES } from '../src/js/constants.js';

describe('TaskManager', () => {
    let taskManager;

    beforeEach(() => {
        taskManager = new TaskManager();
    });

    test('should add a task to the queue', () => {
        const task = new Task(TASK_TYPES.CHOP_WOOD, 1, 1);
        taskManager.addTask(task);
        expect(taskManager.tasks.length).toBe(1);
        expect(taskManager.tasks[0]).toBe(task);
    });

    test('should retrieve the first task in the queue', () => {
        const task1 = new Task(TASK_TYPES.CHOP_WOOD, 1, 1);
        const task2 = new Task(TASK_TYPES.MINE_STONE, 2, 2);
        taskManager.addTask(task1);
        taskManager.addTask(task2);
        expect(taskManager.getTask()).toBe(task1);
        expect(taskManager.tasks.length).toBe(1);
    });

    test('should return null if no tasks are available', () => {
        expect(taskManager.getTask()).toBe(null);
    });

    test('should sort tasks by priority when adding', () => {
        const taskLow = new Task('low_priority', 1, 1, null, 0, 1);
        const taskHigh = new Task('high_priority', 2, 2, null, 0, 5);
        const taskMedium = new Task('medium_priority', 3, 3, null, 0, 3);

        taskManager.addTask(taskLow);
        taskManager.addTask(taskHigh);
        taskManager.addTask(taskMedium);

        // Expect tasks to be sorted by priority (highest first)
        expect(taskManager.tasks[0]).toBe(taskHigh);
        expect(taskManager.tasks[1]).toBe(taskMedium);
        expect(taskManager.tasks[2]).toBe(taskLow);
    });

    test('getTask can use a filter function', () => {
        const haulTask = new Task(TASK_TYPES.HAUL, 1, 1);
        const buildTask = new Task(TASK_TYPES.BUILD, 2, 2);
        taskManager.addTask(haulTask);
        taskManager.addTask(buildTask);

        const task = taskManager.getTask(t => t.type === TASK_TYPES.BUILD);

        expect(task).toBe(buildTask);
        expect(taskManager.tasks).toContain(haulTask);
        expect(taskManager.tasks).not.toContain(buildTask);
    });

    test('getTaskForSettler respects settler priorities', () => {
        const settler = { taskPriorities: { [TASK_TYPES.BUILD]: 0, [TASK_TYPES.HAUL]: 5 } };
        const haulTask = new Task(TASK_TYPES.HAUL, 1, 1);
        const buildTask = new Task(TASK_TYPES.BUILD, 2, 2);
        taskManager.addTask(buildTask);
        taskManager.addTask(haulTask);

        const task = taskManager.getTaskForSettler(settler);

        expect(task).toBe(haulTask);
        expect(taskManager.tasks).toContain(buildTask);
        expect(taskManager.tasks).not.toContain(haulTask);
    });

    test('assignTasks chooses idle settler with highest priority', () => {
        const settlerA = { name: 'A', state: 'idle', currentTask: null, taskPriorities: { [TASK_TYPES.BUILD]: 2 } };
        const settlerB = { name: 'B', state: 'idle', currentTask: null, taskPriorities: { [TASK_TYPES.BUILD]: 5 } };
        const buildTask = new Task(TASK_TYPES.BUILD, 1, 1);
        taskManager.addTask(buildTask);

        taskManager.assignTasks([settlerA, settlerB]);

        expect(settlerB.currentTask).toBe(buildTask);
        expect(settlerA.currentTask).toBeNull();
        expect(taskManager.tasks.length).toBe(0);
    });
});