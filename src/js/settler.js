
export default class Settler {
    constructor(name, x, y, resourceManager) {
        this.resourceManager = resourceManager;
        this.name = name;
        this.x = x;
        this.y = y;
        this.health = 100; // 0-100
        this.hunger = 100; // 0-100, 0 means starving
        this.sleep = 100; // 0-100, 0 means exhausted
        this.mood = 100; // 0-100, 0 means very unhappy
        this.state = "idle"; // e.g., "idle", "seeking_food", "seeking_sleep"
        this.currentTask = null;
        this.skills = {
            farming: 1,
            mining: 1,
            building: 1,
            crafting: 1,
            combat: 1
        };
    }

    updateNeeds(deltaTime) {
        // Decrease hunger over time
        this.hunger -= 0.01 * (deltaTime / 1000); // Adjust rate as needed
        if (this.hunger < 0) this.hunger = 0;

        // Decrease sleep over time
        this.sleep -= 0.005 * (deltaTime / 1000); // Adjust rate as needed
        if (this.sleep < 0) this.sleep = 0;

        // Adjust mood based on hunger and sleep
        if (this.hunger < 50) {
            this.mood -= (50 - this.hunger) * 0.001 * (deltaTime / 1000);
        }
        if (this.sleep < 50) {
            this.mood -= (50 - this.sleep) * 0.001 * (deltaTime / 1000);
        }
        if (this.mood > 100) this.mood = 100;
        if (this.mood < 0) this.mood = 0;

        // Basic AI: Change state based on needs
        if (this.hunger < 20) {
            this.state = "seeking_food";
        } else if (this.sleep < 20) {
            this.state = "seeking_sleep";
        } else {
            this.state = "idle";
        }

        // Execute current task
        if (this.currentTask) {
            // Move towards the target
            const speed = 0.05; // tiles per second
            if (this.x < this.currentTask.targetX) {
                this.x += speed * (deltaTime / 1000);
            } else if (this.x > this.currentTask.targetX) {
                this.x -= speed * (deltaTime / 1000);
            }
            if (this.y < this.currentTask.targetY) {
                this.y += speed * (deltaTime / 1000);
            } else if (this.y > this.currentTask.targetY) {
                this.y -= speed * (deltaTime / 1000);
            }

            // Check if arrived at target
            if (Math.abs(this.x - this.currentTask.targetX) < speed && Math.abs(this.y - this.currentTask.targetY) < speed) {
                this.x = this.currentTask.targetX; // Snap to tile
                this.y = this.currentTask.targetY; // Snap to tile
                // For now, just complete the task after some time
                // In future, this will involve interaction, etc.
                this.currentTask.quantity -= 1 * (deltaTime / 1000); // Simulate work
                if (this.currentTask.type === "build" && this.currentTask.building) {
                    const material = this.currentTask.building.material;
                    const consumptionRate = 0.1; // e.g., 0.1 units of material per second
                    const amountToConsume = consumptionRate * (deltaTime / 1000); // Amount to consume per update

                    if (this.resourceManager.removeResource(material, amountToConsume)) {
                        const workAmount = 1 * (deltaTime / 1000); // Amount of work done
                        this.currentTask.building.buildProgress += workAmount; // Increase build progress
                        if (this.currentTask.building.buildProgress >= 100) {
                            this.currentTask.building.buildProgress = 100;
                            console.log(`${this.name} completed building task for ${this.currentTask.building.type}`);
                            this.currentTask = null; // Task completed
                        }
                    } else {
                        console.log(`${this.name} stopped building due to lack of ${material}`);
                        this.currentTask = null; // Clear the task
                    }
                } else if (this.currentTask.quantity <= 0) {
                    console.log(`${this.name} completed task: ${this.currentTask.type}`);
                    this.currentTask = null;
                }
            }
        }
    }

    // Placeholder for future methods like update, render, etc.

    render(ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x * 32, this.y * 32, 32, 32);
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(this.name, this.x * 32, this.y * 32 - 5);
        ctx.fillText(this.state, this.x * 32, this.y * 32 + 40);
        ctx.fillText(this.getStatus(), this.x * 32, this.y * 32 + 50);
    }

    getStatus() {
        if (this.hunger < 20) return "Hungry";
        if (this.sleep < 20) return "Sleepy";
        return "OK";
    }
}
