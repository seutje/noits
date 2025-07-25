
export default class Settler {
    constructor(name, x, y, resourceManager, map, roomManager) {
        this.resourceManager = resourceManager;
        this.map = map;
        this.roomManager = roomManager;
        this.name = name;
        this.x = x;
        this.y = y;
        this.health = 100; // 0-100
        this.hunger = 100; // 0-100, 0 means starving
        this.sleep = 100; // 0-100, 0 means exhausted
        this.mood = 100; // 0-100, 0 means very unhappy
        this.state = "idle"; // e.g., "idle", "seeking_food", "seeking_sleep"
        this.currentTask = null;
        this.carrying = null; // { type: "wood", quantity: 1 }
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
        } else if (this.carrying) {
            this.state = "hauling";
        } else {
            this.state = "idle";
        }

        // If hauling, find a storage room and set a task
        if (this.state === "hauling" && !this.currentTask) {
            const storageRooms = this.roomManager.rooms.filter(room => room.type === "storage");
            if (storageRooms.length > 0) {
                // For simplicity, just pick the first storage room
                const targetRoom = storageRooms[0];
                // Find a tile within the storage room to drop off resources
                const targetTile = targetRoom.tiles[0]; // Just use the first tile for now
                this.currentTask = { type: "haul", targetX: targetTile.x, targetY: targetTile.y, resource: this.carrying };
                console.log(`${this.name} is hauling ${this.carrying.type} to storage.`);
            } else {
                console.log(`${this.name} has resources to haul but no storage room found.`);
                this.state = "idle"; // Go back to idle if no storage
            }
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

                if (this.currentTask.type === "move") {
                    console.log(`${this.name} completed task: ${this.currentTask.type}`);
                    this.currentTask = null;
                } else if (this.currentTask.type === "build" && this.currentTask.building) {
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
                } else if (this.currentTask.type === "chop_wood" || this.currentTask.type === "gather_berries" || this.currentTask.type === "forage_food" || this.currentTask.type === "hunt_animal" || this.currentTask.type === "sow_crop" || this.currentTask.type === "harvest_crop" || this.currentTask.type === "tend_animals") {
                    const resourceType = this.currentTask.resourceType;
                    const gatheringRate = 0.1; // e.g., 0.1 units of resource per second
                    const amountToGather = gatheringRate * (deltaTime / 1000);

                    this.currentTask.quantity -= amountToGather;

                    if (this.currentTask.quantity <= 0) {
                        this.carrying = { type: resourceType, quantity: 1 }; // Settler carries the resource
                        this.map.removeResourceNode(this.currentTask.targetX, this.currentTask.targetY);
                        console.log(`${this.name} completed ${this.currentTask.type} and is now carrying ${this.carrying.type}.`);
                        this.currentTask = null;
                    }
                } else if (this.currentTask.type === "sow_crop" && this.currentTask.building) {
                    const farmPlot = this.currentTask.building;
                    if (farmPlot.plant(this.currentTask.cropType)) {
                        console.log(`${this.name} planted ${this.currentTask.cropType} at ${farmPlot.x},${farmPlot.y}.`);
                        this.currentTask = null;
                    } else {
                        console.log(`${this.name} failed to plant at ${farmPlot.x},${farmPlot.y}.`);
                        this.currentTask = null;
                    }
                } else if (this.currentTask.type === "harvest_crop" && this.currentTask.building) {
                    const farmPlot = this.currentTask.building;
                    const harvestedCrop = farmPlot.harvest();
                    if (harvestedCrop) {
                        this.resourceManager.addResource(harvestedCrop, 1); // Add 1 unit of harvested crop
                        console.log(`${this.name} harvested ${harvestedCrop} from ${farmPlot.x},${farmPlot.y}.`);
                        this.currentTask = null;
                    } else {
                        console.log(`${this.name} failed to harvest at ${farmPlot.x},${farmPlot.y}.`);
                        this.currentTask = null;
                    }
                } else if (this.currentTask.type === "tend_animals" && this.currentTask.building) {
                    const animalPen = this.currentTask.building;
                    // Simulate tending animals - perhaps increases animal health/reproduction rate
                    console.log(`${this.name} tended to animals at ${animalPen.x},${animalPen.y}.`);
                    this.currentTask = null;
                } else if (this.currentTask.type === "haul" && this.currentTask.resource) {
                    const room = this.roomManager.getRoomAt(this.currentTask.targetX, this.currentTask.targetY);
                    if (room && room.type === "storage") {
                        this.roomManager.addResourceToStorage(room, this.currentTask.resource.type, this.currentTask.resource.quantity);
                        this.carrying = null; // Clear carried resource
                        console.log(`${this.name} deposited ${this.currentTask.resource.type} into storage.`);
                        this.currentTask = null;
                    } else {
                        console.log(`${this.name} arrived at haul destination but it's not a storage room.`);
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
