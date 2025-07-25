import Task from './task.js';

export default class TaskManager {
    constructor() {
        this.tasks = [];
    }

    addTask(task) {
        this.tasks.push(task);
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
}