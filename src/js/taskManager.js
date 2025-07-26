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
                taskData.targetSettler
            );
            task.deserialize(taskData);
            return task;
        });
    }