
export default class Settler {
    constructor(name, x, y, resourceManager, map) {
        this.resourceManager = resourceManager;
        this.map = map;
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
                } else if (this.currentTask.type === "craft" && this.currentTask.recipe) {
                    const recipe = this.currentTask.recipe;
                    // Check if resources are available for crafting
                    let resourcesAvailable = true;
                    for (const input of recipe.inputs) {
                        if (this.resourceManager.getResourceQuantity(input.resourceType) < input.quantity) {
                            resourcesAvailable = false;
                            break;
                        }
                    }

                    if (resourcesAvailable) {
                        // Consume input resources
                        for (const input of recipe.inputs) {
                            this.resourceManager.removeResource(input.resourceType, input.quantity);
                        }

                        // Simulate crafting time
                        this.currentTask.craftingProgress += (deltaTime / 1000);
                        if (this.currentTask.craftingProgress >= recipe.time) {
                            // Produce output resources
                            for (const output of recipe.outputs) {
                                const outputQuality = this.calculateOutputQuality(output.quality);
                                this.resourceManager.addResource(output.resourceType, output.quantity, outputQuality);
                            }
                            console.log(`${this.name} completed crafting ${recipe.name}.`);
                            this.currentTask = null; // Task completed
                        }
                    } else {
                        console.log(`${this.name} stopped crafting ${recipe.name} due to lack of resources.`);
                        this.currentTask = null; // Clear the task
                    }
                } else if (this.currentTask.type === "mine_stone" || this.currentTask.type === "mine_iron_ore") {
                    const resourceType = this.currentTask.type.replace("mine_", "");
                    const miningRate = 0.1; // e.g., 0.1 units of resource per second
                    const amountToMine = miningRate * (deltaTime / 1000);

                    // Simulate mining progress
                    this.currentTask.quantity -= amountToMine; // Decrease task quantity (workload)

                    if (this.currentTask.quantity <= 0) {
                        this.resourceManager.addResource(resourceType, 1); // Add 1 unit of mined resource
                        this.map.removeResourceNode(this.currentTask.targetX, this.currentTask.targetY);
                        console.log(`${this.name} completed mining ${resourceType}.`);
                        this.currentTask = null; // Task completed
                    }
                } else if (this.currentTask.type === "chop_wood" || this.currentTask.type === "gather_berries") {
                    const resourceType = this.currentTask.resourceType;
                    const gatheringRate = 0.1; // e.g., 0.1 units of resource per second
                    const amountToGather = gatheringRate * (deltaTime / 1000);

                    this.currentTask.quantity -= amountToGather;

                    if (this.currentTask.quantity <= 0) {
                        this.resourceManager.addResource(resourceType, 1); // Add 1 unit of gathered resource
                        this.map.removeResourceNode(this.currentTask.targetX, this.currentTask.targetY);
                        console.log(`${this.name} completed ${this.currentTask.type}.`);
                        this.currentTask = null;
                    }
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

    calculateOutputQuality(baseQuality) {
        // Simple quality calculation: baseQuality + (craftingSkill - 1) * 0.1
        // This means a crafting skill of 1 gives baseQuality, 2 gives baseQuality + 0.1, etc.
        const skillBonus = (this.skills.crafting - 1) * 0.1;
        let finalQuality = baseQuality + skillBonus;
        // Clamp quality between 0 and 2 (example range)
        if (finalQuality < 0) finalQuality = 0;
        if (finalQuality > 2) finalQuality = 2;
        return finalQuality;
    }
}
