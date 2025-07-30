import { debugLog } from './debug.js';
import Task from './task.js';
import { TASK_TYPES } from './constants.js';

// Map task types to the settler skill that should be considered when assigning
// that task. Only tasks that benefit from a particular skill are listed.
export const TASK_SKILL_MAP = {
    [TASK_TYPES.BUILD]: 'building',
    [TASK_TYPES.CRAFT]: 'crafting',
    [TASK_TYPES.BAKING]: 'cooking',
    [TASK_TYPES.PREPARE_MEAL]: 'cooking',
    [TASK_TYPES.SOW_CROP]: 'farming',
    [TASK_TYPES.HARVEST_CROP]: 'farming',
    [TASK_TYPES.TEND_ANIMALS]: 'farming',
    [TASK_TYPES.CHOP_WOOD]: 'farming',
    [TASK_TYPES.MINE_STONE]: 'mining',
    [TASK_TYPES.MINE_IRON_ORE]: 'mining',
    [TASK_TYPES.DIG_DIRT]: 'mining',
    [TASK_TYPES.BUTCHER]: 'farming',
    [TASK_TYPES.TREATMENT]: 'medical',
    [TASK_TYPES.HUNT_ANIMAL]: 'combat',
    [TASK_TYPES.DECONSTRUCT]: 'building',
};

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
            if (task.assigned || task.paused) continue;
            if (!filterFn || filterFn(task)) {
                return task;
            }
        }
        return null;
    }

    getTaskForSettler(settler, filterFn = null) {
        for (let i = 0; i < this.tasks.length; i++) {
            const task = this.tasks[i];
            if (task.assigned || task.paused) continue;
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
            if (task.assigned || task.paused) continue;
            let bestSettler = null;
            let bestPriority = -1;
            let bestSkill = -1;
            let bestDistance = Infinity;

            settlers.forEach(settler => {
                if (settler.currentTask) return;

                if (task.building && task.building.occupant && task.building.occupant !== settler) {
                    return; // building already in use
                }

                const isSelfTreatment = task.type === TASK_TYPES.TREATMENT && task.targetSettler === settler;
                if (settler.state !== 'idle' && !(isSelfTreatment && settler.state === 'seeking_treatment')) return;

                const taskPriority = settler.taskPriorities ? settler.taskPriorities[task.type] : 0;
                if (taskPriority <= 0 || (filterFn && !filterFn(task, settler))) return;

                const skillName = TASK_SKILL_MAP[task.type];
                const skillLevel = skillName ? ((settler.skills && settler.skills[skillName]) || 0) : 0;

                let distance = Infinity;
                if (task.building) {
                    distance = Math.abs(settler.x - task.building.x) + Math.abs(settler.y - task.building.y);
                } else if (typeof task.targetX === 'number' && typeof task.targetY === 'number') {
                    distance = Math.abs(settler.x - task.targetX) + Math.abs(settler.y - task.targetY);
                }

                if (
                    taskPriority > bestPriority ||
                    (taskPriority === bestPriority && skillLevel > bestSkill) ||
                    (taskPriority === bestPriority && skillLevel === bestSkill && distance < bestDistance)
                ) {
                    bestPriority = taskPriority;
                    bestSkill = skillLevel;
                    bestDistance = distance;
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
                bestSettler.state = task.type;
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
