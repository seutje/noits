export default class Task {
    constructor(type, targetX, targetY, resourceType = null, quantity = 0, priority = 1, building = null) {
        this.type = type; // e.g., "chop_wood", "mine_stone", "eat", "sleep", "build"
        this.targetX = targetX;
        this.targetY = targetY;
        this.resourceType = resourceType; // For gathering tasks
        this.quantity = quantity; // For gathering tasks
        this.priority = priority; // 1 (low) to 5 (high)
        this.building = building; // For building tasks
        this.assignedSettler = null;
    }
}