import Task from './task.js';

export default class TaskManager {
    constructor() {
        this.tasks = [];
    }

    addTask(task) {
        this.tasks.push(task);
        this.tasks.sort((a, b) => b.priority - a.priority); // Sort by priority (highest first)
    }

    getTask() {
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
        return this.tasks.some(task => task.type === 'treatment' && task.targetSettler === targetSettler);
    }
}