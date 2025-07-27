import Task from './task.js';
import { TASK_TYPES } from './constants.js';

export default class TaskManager {
    constructor() {
        this.tasks = [];
    }

    addTask(task) {
        // Insert task by priority without resorting the entire array
        let low = 0;
        let high = this.tasks.length;
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (this.tasks[mid].priority < task.priority) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }
        this.tasks.splice(low, 0, task);
    }

    getTask(filterFn = null) {
        if (filterFn) {
            for (let i = 0; i < this.tasks.length; i++) {
                if (filterFn(this.tasks[i])) {
                    return this.tasks.splice(i, 1)[0];
                }
            }
            return null;
        }
        if (this.tasks.length > 0) {
            return this.tasks.shift(); // Get the first task in the queue
        }
        return null;
    }

    // You might want more sophisticated methods later, like:
    // assignTask(settler) { ... }
    // removeTask(task) { ... }
    // getTasksByType(type) { ... }

    hasTaskForTargetSettler(targetSettler) {
        return this.tasks.some(task => task.type === TASK_TYPES.TREATMENT && task.targetSettler === targetSettler);
    }

    serialize() {
        return this.tasks.map(task => task.serialize());
    }

    deserialize(data) {
        this.tasks = data.map(taskData => {
            const task = new Task(
                taskData.type,
                taskData.targetX,
                taskData.targetY,
                taskData.resourceType,
                taskData.quantity,
                taskData.priority,
                taskData.building,
                taskData.recipe,
                taskData.cropType,
                taskData.targetLocation,
                taskData.carrying,
                taskData.targetSettler,
                taskData.targetEnemy,
                taskData.sourceX,
                taskData.sourceY
            );
            task.deserialize(taskData);
            return task;
        });
    }
}
