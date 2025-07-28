import { debugLog } from './debug.js';
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

    getTaskForSettler(settler, filterFn = null) {
        for (let i = 0; i < this.tasks.length; i++) {
            const task = this.tasks[i];
            if (settler.taskPriorities && settler.taskPriorities[task.type] > 0) {
                if (!filterFn || filterFn(task)) {
                    this.tasks.splice(i, 1);
                    return task;
                }
            }
        }
        return null;
    }

    assignTasks(settlers, filterFn = null) {
        for (let i = 0; i < this.tasks.length; ) {
            const task = this.tasks[i];
            let bestSettler = null;
            let bestPriority = -1;

            settlers.forEach(settler => {
                if (settler.currentTask) return;

                if (task.building && task.building.occupant && task.building.occupant !== settler) {
                    return; // building already in use
                }

                const isSelfTreatment = task.type === TASK_TYPES.TREATMENT && task.targetSettler === settler;
                if (settler.state !== 'idle' && !(isSelfTreatment && settler.state === 'seeking_treatment')) return;

                const basePriority = settler.taskPriorities ? settler.taskPriorities[task.type] : 0;
                if (basePriority <= 0 || (filterFn && !filterFn(task, settler))) return;

                let priority = basePriority;
                if (task.building && settler.x === task.building.x && settler.y === task.building.y) {
                    priority += 0.1; // prefer settlers already at location
                }

                if (priority > bestPriority) {
                    bestPriority = priority;
                    bestSettler = settler;
                }
            });

            if (bestSettler) {
                if (task.type === TASK_TYPES.BUILD && task.building) {
                    const pos = bestSettler.map.findAdjacentFreeTile(
                        task.building.x,
                        task.building.y,
                        bestSettler.x,
                        bestSettler.y,
                    );
                    task.targetX = pos.x;
                    task.targetY = pos.y;
                }
                if (bestSettler.currentBuilding && bestSettler.currentBuilding !== task.building) {
                    bestSettler.currentBuilding.occupant = null;
                    bestSettler.currentBuilding = null;
                }

                bestSettler.currentTask = task;
                if (task.building) {
                    task.building.occupant = bestSettler;
                    bestSettler.currentBuilding = task.building;
                }

                this.tasks.splice(i, 1);
                debugLog(`${bestSettler.name} picked up task: ${task.type}`);
            } else {
                i++;
            }
        }
    }

    // You might want more sophisticated methods later, like:
    // assignTask(settler) { ... }
    // getTasksByType(type) { ... }

    removeTask(task) {
        const index = this.tasks.indexOf(task);
        if (index !== -1) {
            this.tasks.splice(index, 1);
        }
    }

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
