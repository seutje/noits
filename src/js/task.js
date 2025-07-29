export default class Task {
    constructor(type, targetX, targetY, resourceType = null, quantity = 0, priority = 1, building = null, recipe = null, cropType = null, targetLocation = null, carrying = null, targetSettler = null, targetEnemy = null, sourceX = null, sourceY = null) {
        this.type = type; // e.g., "chop_wood", "mine_stone", "eat", "sleep", "build", "craft", "mine_stone", "mine_iron_ore", "gather_berries", "mine_stone", "mine_iron_ore", "gather_berries", "treatment", "dig_dirt"
        this.targetX = targetX;
        this.targetY = targetY;
        this.resourceType = resourceType; // For gathering tasks
        this.quantity = quantity; // For gathering tasks
        this.priority = priority; // 1 (low) to 5 (high)
        this.building = building; // For building tasks (e.g., build task, or crafting station for craft task)
        this.recipe = recipe; // For craft tasks
        this.assignedSettler = null;
        this.assigned = null; // identifier of the settler assigned to this task
        this.paused = false; // when true, task will not be assigned
        this.craftingProgress = 0; // For craft tasks
        this.cropType = cropType; // For sow_crop tasks
        this.targetLocation = targetLocation; // For explore tasks
        this.carrying = carrying; // For haul tasks
        this.targetSettler = targetSettler; // For treatment tasks
        this.targetEnemy = targetEnemy; // For butcher tasks
        this.sourceX = sourceX; // For haul tasks from a source tile
        this.sourceY = sourceY; // For haul tasks from a source tile
        this.unassignTimestamps = []; // Track when the task was unassigned
    }

    serialize() {
        return {
            type: this.type,
            targetX: this.targetX,
            targetY: this.targetY,
            resourceType: this.resourceType,
            quantity: this.quantity,
            priority: this.priority,
            building: this.building ? { type: this.building.type, x: this.building.x, y: this.building.y } : null,
            recipe: this.recipe ? { name: this.recipe.name } : null,
            assignedSettler: this.assignedSettler ? this.assignedSettler.name : null,
            assigned: this.assigned,
            paused: this.paused,
            craftingProgress: this.craftingProgress,
            cropType: this.cropType,
            targetLocation: this.targetLocation ? { id: this.targetLocation.id } : null,
            carrying: this.carrying,
            targetSettler: this.targetSettler ? this.targetSettler.name : null,
            targetEnemy: this.targetEnemy ? { id: this.targetEnemy.id } : null,
            sourceX: this.sourceX,
            sourceY: this.sourceY,
            unassignTimestamps: this.unassignTimestamps,
        };
    }

    deserialize(data) {
        this.type = data.type;
        this.targetX = data.targetX;
        this.targetY = data.targetY;
        this.resourceType = data.resourceType;
        this.quantity = data.quantity;
        this.priority = data.priority;
        // Building, recipe, assignedSettler, targetLocation, targetSettler will be re-linked in TaskManager or Game.loadGame
        this.building = data.building; // Store raw data for now
        this.recipe = data.recipe; // Store raw data for now
        this.assignedSettler = data.assignedSettler; // Store raw data for now
        this.assigned = data.assigned || null;
        this.craftingProgress = data.craftingProgress;
        this.paused = data.paused || false;
        this.cropType = data.cropType;
        this.targetLocation = data.targetLocation; // Store raw data for now
        this.carrying = data.carrying;
        this.targetSettler = data.targetSettler; // Store raw data for now
        this.targetEnemy = data.targetEnemy; // Store raw data for now
        this.sourceX = data.sourceX;
        this.sourceY = data.sourceY;
        this.unassignTimestamps = data.unassignTimestamps || [];
    }
}