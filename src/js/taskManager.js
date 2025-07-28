import { debugLog } from './debug.js';
import Task from './task.js';
import { TASK_TYPES } from './constants.js';

export default class TaskManager {
    constructor() {
        this.tasks = [];
        this.changeListeners = [];
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
        this.notifyChange();
    }

    getTask(filterFn = null) {
        for (let i = 0; i < this.tasks.length; i++) {
            const task = this.tasks[i];
            if (task.assigned) continue;
            if (!filterFn || filterFn(task)) {
                return task;
            }
        }
        return null;
    }

    getTaskForSettler(settler, filterFn = null) {
        for (let i = 0; i < this.tasks.length; i++) {
            const task = this.tasks[i];
            if (task.assigned) continue;
            if (settler.taskPriorities && settler.taskPriorities[task.type] > 0) {
                if (!filterFn || filterFn(task)) {
                    return task;
                }
            }
        }
        return null;
    }

    assignTasks(settlers, filterFn = null) {
        let changed = false;
        for (let i = 0; i < this.tasks.length; i++) {
            const task = this.tasks[i];
            if (task.assigned) continue;
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
                task.assigned = bestSettler.name;
                if (task.building) {
                    task.building.occupant = bestSettler;
                    bestSettler.currentBuilding = task.building;
                }
                changed = true;
                debugLog(`${bestSettler.name} picked up task: ${task.type}`);
            }
        }
        if (changed) {
            this.notifyChange();
        }
    }

    // You might want more sophisticated methods later, like:
    // assignTask(settler) { ... }
    // getTasksByType(type) { ... }

    removeTask(task) {
        const index = this.tasks.indexOf(task);
        if (index !== -1) {
            this.tasks.splice(index, 1);
            this.notifyChange();
        }
    }

    cleanupCompletedTasks(settlers) {
        const originalLength = this.tasks.length;
        this.tasks = this.tasks.filter(task => {
            if (!task.assigned) return true;
            const settler = settlers.find(s => s.name === task.assigned);
            return settler && settler.currentTask === task;
        });
        if (this.tasks.length !== originalLength) {
            this.notifyChange();
        }
    }

    addChangeListener(listener) {
        this.changeListeners.push(listener);
    }

    removeChangeListener(listener) {
        this.changeListeners = this.changeListeners.filter(l => l !== listener);
    }

    notifyChange() {
        this.changeListeners.forEach(listener => listener(this.tasks));
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
