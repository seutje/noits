export default class Task {
    constructor(type, targetX, targetY, resourceType = null, quantity = 0, priority = 1, building = null, recipe = null, cropType = null, targetLocation = null, carrying = null) {
        this.type = type; // e.g., "chop_wood", "mine_stone", "eat", "sleep", "build", "craft", "mine_stone", "mine_iron_ore", "gather_berries", "mine_stone", "mine_iron_ore", "gather_berries"
        this.targetX = targetX;
        this.targetY = targetY;
        this.resourceType = resourceType; // For gathering tasks
        this.quantity = quantity; // For gathering tasks
        this.priority = priority; // 1 (low) to 5 (high)
        this.building = building; // For building tasks (e.g., build task, or crafting station for craft task)
        this.recipe = recipe; // For craft tasks
        this.assignedSettler = null;
        this.craftingProgress = 0; // For craft tasks
        this.cropType = cropType; // For sow_crop tasks
        this.targetLocation = targetLocation; // For explore tasks
        this.carrying = carrying; // For haul tasks
    }
}