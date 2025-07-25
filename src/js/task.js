export default class Task {
    constructor(type, targetX, targetY, resourceType = null, quantity = 0) {
        this.type = type; // e.g., "chop_wood", "mine_stone", "eat", "sleep"
        this.targetX = targetX;
        this.targetY = targetY;
        this.resourceType = resourceType; // For gathering tasks
        this.quantity = quantity; // For gathering tasks
        this.assignedSettler = null;
    }
}