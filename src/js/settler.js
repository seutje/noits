
import Task from './task.js';
import ResourcePile from './resourcePile.js';
import { SLEEP_GAIN_RATE, SETTLER_RUN_SPEED, TASK_TYPES, RESOURCE_TYPES, HEALTH_REGEN_RATE } from './constants.js';

export default class Settler {
    constructor(name, x, y, resourceManager, map, roomManager, spriteManager, allSettlers = null) {
        this.resourceManager = resourceManager;
        this.map = map;
        this.roomManager = roomManager;
        this.spriteManager = spriteManager;
        this.allSettlers = allSettlers;
        this.name = name;
        this.x = x;
        this.y = y;
        this.health = 100; // 0-100
        this.bodyParts = {
            head: { health: 100, bleeding: false },
            torso: { health: 100, bleeding: false },
            leftArm: { health: 100, bleeding: false },
            rightArm: { health: 100, bleeding: false },
            leftLeg: { health: 100, bleeding: false },
            rightLeg: { health: 100, bleeding: false }
        };
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
            combat: 1,
            medical: 1
        };
        this.taskPriorities = {};
        Object.values(TASK_TYPES).forEach(type => {
            this.taskPriorities[type] = 5;
        });
        this.equippedWeapon = null; // Stores a Weapon object
        this.equippedArmor = {}; // Stores Armor objects by body part (e.g., { head: ArmorObject, torso: ArmorObject })
        this.targetEnemy = null; // The enemy the settler is currently targeting
        this.isDead = false; // New property to track if the settler is dead
        this.isSleeping = false; // True when settler is sleeping
        this.sleepingInBed = false; // True when sleeping in a bed
        this.currentBed = null; // Reference to bed building when sleeping in one
        this.currentBuilding = null; // Building this settler is currently using
    }

    equipWeapon(weapon) {
        this.equippedWeapon = weapon;
        console.log(`${this.name} equipped ${weapon.name}.`);
    }

    unequipWeapon() {
        if (this.equippedWeapon) {
            console.log(`${this.name} unequipped ${this.equippedWeapon.name}.`);
            this.equippedWeapon = null;
        }
    }

    equipArmor(armor) {
        if (armor.bodyPart) {
            this.equippedArmor[armor.bodyPart] = armor;
            console.log(`${this.name} equipped ${armor.name} on ${armor.bodyPart}.`);
        } else {
            console.warn(`Armor ${armor.name} has no specified body part.`);
        }
    }

    unequipArmor(bodyPart) {
        if (this.equippedArmor[bodyPart]) {
            console.log(`${this.name} unequipped ${this.equippedArmor[bodyPart].name} from ${bodyPart}.`);
            delete this.equippedArmor[bodyPart];
        }
    }

    pickUpPile(type, quantity) {
        if (this.carrying) {
            const dropX = Math.floor(this.x);
            const dropY = Math.floor(this.y);
            const existingPile = this.map.resourcePiles.find(p => p.x === dropX && p.y === dropY && p.type === this.carrying.type);
            if (existingPile) {
                existingPile.add(this.carrying.quantity);
            } else {
                const newPile = new ResourcePile(this.carrying.type, this.carrying.quantity, dropX, dropY, this.map.tileSize, this.spriteManager);
                this.map.addResourcePile(newPile);
            }
        }
        this.carrying = { type, quantity };
    }

    dropCarriedResource() {
        if (!this.carrying) return;
        const dropX = Math.floor(this.x);
        const dropY = Math.floor(this.y);
        const existingPile = this.map.resourcePiles.find(p => p.x === dropX && p.y === dropY && p.type === this.carrying.type);
        if (existingPile) {
            existingPile.add(this.carrying.quantity);
        } else {
            const newPile = new ResourcePile(this.carrying.type, this.carrying.quantity, dropX, dropY, this.map.tileSize, this.spriteManager);
            this.map.addResourcePile(newPile);
        }
        this.carrying = null;
    }

    setTargetEnemy(enemy) {
        this.targetEnemy = enemy;
        if (enemy) {
            console.log(`${this.name} is now targeting ${enemy.name}.`);
        } else {
            console.log(`${this.name} no longer has a target enemy.`);
        }
    }

    updateNeeds(deltaTime) {
        if (this.isDead) return; // Do nothing if dead
        // Decrease hunger over time
        this.hunger -= 0.01 * (deltaTime / 1000); // Adjust rate as needed
        if (this.hunger < 0) this.hunger = 0;
        if (this.isSleeping) {
            let gain = SLEEP_GAIN_RATE * (deltaTime / 1000);
            if (this.sleepingInBed) gain *= 2;
            this.sleep += gain;
            if (this.sleep >= 100) {
                this.sleep = 100;
                this.isSleeping = false;
                if (this.currentBed) {
                    this.currentBed.occupant = null;
                    this.currentBed = null;
                }
                this.state = 'idle';
            }
        } else {
            // Decrease sleep over time
            this.sleep -= 0.005 * (deltaTime / 1000); // Adjust rate as needed
            if (this.sleep < 0) this.sleep = 0;
        }

        // Adjust mood based on hunger and sleep
        if (this.hunger < 50) {
            this.mood -= (50 - this.hunger) * 0.001 * (deltaTime / 1000);
        }
        if (this.sleep < 50) {
            this.mood -= (50 - this.sleep) * 0.001 * (deltaTime / 1000);
        }
        if (this.mood > 100) this.mood = 100;
        if (this.mood < 0) this.mood = 0;

        // Update overall health based on body parts
        let totalHealth = 0;
        for (const part in this.bodyParts) {
            // Simulate bleeding
            if (this.bodyParts[part].bleeding) {
                this.bodyParts[part].health -= 0.01 * (deltaTime / 1000); // Bleeding causes health loss
                if (this.bodyParts[part].health < 0) this.bodyParts[part].health = 0;
            } else if (this.bodyParts[part].health < 100) {
                // Regenerate health when not bleeding
                this.bodyParts[part].health += (this.hunger / 100) * HEALTH_REGEN_RATE * (deltaTime / 1000);
                if (this.bodyParts[part].health > 100) this.bodyParts[part].health = 100;
            }
            totalHealth += this.bodyParts[part].health;
        }
        this.health = totalHealth / Object.keys(this.bodyParts).length; // Average health of all parts

        if (this.isSleeping) {
            return;
        }

        // Basic AI: Change state based on needs
        if (this.targetEnemy && this.targetEnemy.health > 0) {
            this.state = "combat";
        } else if (this.needsTreatment() && this.map.resourcePiles.some(p => p.type === RESOURCE_TYPES.BANDAGE && p.quantity > 0)) {
            this.state = "seeking_treatment";
        } else if (this.hunger < 20) {
            this.state = "seeking_food";
        } else if (this.sleep < 20) {
            this.state = "seeking_sleep";
        } else if (this.carrying) {
            if (this.taskPriorities[TASK_TYPES.HAUL] > 0) {
                this.state = "hauling";
            } else {
                this.dropCarriedResource();
                this.state = "idle";
            }
        } else {
            this.state = "idle";
        }

        if (this.state === 'seeking_sleep' && this.sleep <= 0 && !this.isSleeping) {
            this.isSleeping = true;
            this.sleepingInBed = false;
            this.currentTask = null;
            this.state = 'sleeping';
            console.log(`${this.name} collapsed from exhaustion.`);
        }

        // If hungry, create a task to go eat from storage
        if (this.state === "seeking_food" && !this.currentTask) {
            const storageRooms = this.roomManager.rooms.filter(room => room.type === "storage");
            let assigned = false;
            for (const room of storageRooms) {
                const foodTypes = [RESOURCE_TYPES.BERRIES, RESOURCE_TYPES.MUSHROOMS, RESOURCE_TYPES.MEAT];
                for (const food of foodTypes) {
                    if (room.storage[food] && room.storage[food] > 0) {
                        const targetTile = room.tiles[0];
                        this.currentTask = {
                            type: "eat",
                            targetX: targetTile.x,
                            targetY: targetTile.y,
                            foodType: food,
                            room
                        };
                        console.log(`${this.name} is moving to eat ${food} from storage.`);
                        assigned = true;
                        break;
                    }
                }
                if (assigned) break;
            }
        }

        if (this.state === "seeking_sleep" && !this.currentTask) {
            const beds = (this.map.buildings || []).filter(b => b.type === 'bed' && (!b.occupant || b.occupant === this));
            if (beds.length > 0) {
                const bed = beds[0];
                bed.occupant = this;
                this.currentTask = { type: TASK_TYPES.SLEEP, targetX: bed.x, targetY: bed.y, bed };
                console.log(`${this.name} is heading to bed at ${bed.x},${bed.y}.`);
            }
        }

        // If hauling, deliver to construction site if possible, otherwise storage
        if (this.state === "hauling" && !this.currentTask) {
            if (this.taskPriorities[TASK_TYPES.HAUL] === 0) {
                this.dropCarriedResource();
                this.state = "idle";
            } else {
                const targetBuilding = (this.map.buildings || []).find(b => b.buildProgress < 100 && b.material === this.carrying.type && b.resourcesDelivered < b.resourcesRequired);
                if (targetBuilding) {
                    this.currentTask = { type: TASK_TYPES.HAUL, targetX: targetBuilding.x, targetY: targetBuilding.y, resource: this.carrying, building: targetBuilding };
                    console.log(`${this.name} is hauling ${this.carrying.type} to construction site.`);
                } else {
                    const target = this.roomManager.findStorageRoomAndTile(this.carrying.type);
                    if (target) {
                        this.currentTask = { type: TASK_TYPES.HAUL, targetX: target.tile.x, targetY: target.tile.y, resource: this.carrying };
                        console.log(`${this.name} is hauling ${this.carrying.type} to storage.`);
                    } else {
                        console.log(`${this.name} has resources to haul but no storage room found. Dropping on the ground.`);
                        const dropX = Math.floor(this.x);
                        const dropY = Math.floor(this.y);
                        const existingPile = this.map.resourcePiles.find(p => p.x === dropX && p.y === dropY && p.type === this.carrying.type);
                        if (existingPile) {
                            existingPile.add(this.carrying.quantity);
                        } else {
                            const newPile = new ResourcePile(this.carrying.type, this.carrying.quantity, dropX, dropY, this.map.tileSize, this.spriteManager);
                            this.map.addResourcePile(newPile);
                        }
                        this.carrying = null;
                        this.state = "idle"; // Go back to idle after dropping
                    }
                }
            }
        }

        // Execute current task
        if (this.currentTask) {
            // Move towards the target
            const speed = SETTLER_RUN_SPEED; // tiles per second
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
                } else if (this.currentTask.type === TASK_TYPES.SLEEP && this.currentTask.bed) {
                    this.isSleeping = true;
                    this.sleepingInBed = true;
                    this.currentBed = this.currentTask.bed;
                    this.currentTask = null;
                    this.state = 'sleeping';
                } else if (this.currentTask.type === TASK_TYPES.BUILD && this.currentTask.building) {
                    const building = this.currentTask.building;
                    const material = building.material;
                    const consumptionRate = 0.1; // units of material per second
                    const amountToConsume = consumptionRate * (deltaTime / 1000);

                    if (building.resourcesDelivered < building.resourcesRequired) {
                        if (this.carrying && this.carrying.type === material) {
                            const needed = building.resourcesRequired - building.resourcesDelivered;
                            const amountToDrop = Math.min(needed, this.carrying.quantity);
                            building.addToInventory(material, amountToDrop);
                            this.carrying.quantity -= amountToDrop;
                            if (this.carrying.quantity <= 0) this.carrying = null;
                        } else if (building.getResourceQuantity(material) >= amountToConsume) {
                            building.resourcesDelivered = building.getResourceQuantity(material);
                        } else {
                            console.log(`${this.name} needs ${material} delivered to build site.`);
                            if (building.occupant === this) {
                                building.occupant = null;
                                this.currentBuilding = null;
                            }
                            this.currentTask = null;
                            return;
                        }
                    }

                    if (building.resourcesDelivered >= building.resourcesRequired) {
                        const workAmount = 1 * (deltaTime / 1000); // Amount of work done
                        building.buildProgress += workAmount; // Increase build progress
                        if (building.buildProgress >= 100) {
                            building.buildProgress = 100;
                            console.log(`${this.name} completed building task for ${building.type}`);
                            if (building.occupant === this) {
                                building.occupant = null;
                                this.currentBuilding = null;
                            }
                            this.currentTask = null; // Task completed
                        }
                    }
                } else if (this.currentTask.type === TASK_TYPES.CRAFT && this.currentTask.recipe) {
                    const recipe = this.currentTask.recipe;
                    const station = this.currentTask.building;

                    if (station) {
                        if (station.occupant && station.occupant !== this) {
                            return; // Wait if another settler is using the station
                        }
                        if (!station.occupant) {
                            station.occupant = this;
                            this.currentBuilding = station;
                        }
                    }

                    if (!this.currentTask.inputsConsumed) {
                        let resourcesAvailable = true;
                        for (const input of recipe.inputs) {
                            const available = station
                                ? station.getResourceQuantity(input.resourceType)
                                : this.resourceManager.getResourceQuantity(input.resourceType);
                            if (available < input.quantity) {
                                resourcesAvailable = false;
                                break;
                            }
                        }

                        if (resourcesAvailable) {
                            for (const input of recipe.inputs) {
                                if (station) {
                                    station.removeFromInventory(input.resourceType, input.quantity);
                                } else {
                                    this.resourceManager.removeResource(input.resourceType, input.quantity);
                                }
                            }
                            this.currentTask.inputsConsumed = true;
                        } else {
                            console.log(`${this.name} is waiting for resources to craft ${recipe.name}.`);
                            return;
                        }
                    }

                    this.currentTask.craftingProgress += (deltaTime / 1000);
                    if (this.currentTask.craftingProgress >= recipe.time) {
                        for (const output of recipe.outputs) {
                            const outputQuality = this.calculateOutputQuality(output.quality);
                            const pile = new ResourcePile(
                                output.resourceType,
                                output.quantity,
                                station ? station.x : Math.floor(this.x),
                                station ? station.y : Math.floor(this.y),
                                this.map.tileSize,
                                this.spriteManager,
                                outputQuality,
                            );
                            this.map.addResourcePile(pile);
                        }
                        console.log(`${this.name} completed crafting ${recipe.name}.`);
                        if (station && station.occupant === this) {
                            station.occupant = null;
                            this.currentBuilding = null;
                        }
                        this.currentTask = null;
                    }
                } else if (
                    this.currentTask.type === TASK_TYPES.MINE_STONE ||
                    this.currentTask.type === TASK_TYPES.MINE_IRON_ORE ||
                    this.currentTask.type === TASK_TYPES.DIG_DIRT
                ) {
                    const resourceType = this.currentTask.type.replace("mine_", "").replace("dig_", "");
                    const miningRate = 0.1; // e.g., 0.1 units of resource per second
                    const amountToMine = miningRate * (deltaTime / 1000);

                    // Simulate mining progress
                    this.currentTask.quantity -= amountToMine; // Decrease task workload

                    if (this.currentTask.quantity <= 0) {
                        this.pickUpPile(resourceType, 1); // Settler carries the resource
                        if (this.currentTask.type === TASK_TYPES.DIG_DIRT) {
                            this.map.tiles[this.currentTask.targetY][this.currentTask.targetX] = 1; // Change tile to dirt
                        } else {
                            this.map.removeResourceNode(this.currentTask.targetX, this.currentTask.targetY);
                        }
                        console.log(`${this.name} completed ${this.currentTask.type} and is now carrying ${this.carrying.type}.`);
                        this.currentTask = null; // Task completed
                    }
                } else if (
                    this.currentTask.type === TASK_TYPES.CHOP_WOOD ||
                    this.currentTask.type === TASK_TYPES.GATHER_BERRIES ||
                    this.currentTask.type === TASK_TYPES.MUSHROOM ||
                    this.currentTask.type === TASK_TYPES.HUNT_ANIMAL
                ) {
                    const resourceType = this.currentTask.resourceType;
                    const gatheringRate = 0.1; // e.g., 0.1 units of resource per second
                    const amountToGather = gatheringRate * (deltaTime / 1000);

                    this.currentTask.quantity -= amountToGather;

                    if (this.currentTask.quantity <= 0) {
                        this.pickUpPile(resourceType, 1); // Settler carries the resource
                        if (this.currentTask.type === TASK_TYPES.HUNT_ANIMAL) {
                            // Hunting yields extra materials like bandages dropped on the ground
                            const bandagePile = new ResourcePile(RESOURCE_TYPES.BANDAGE, 1, this.currentTask.targetX, this.currentTask.targetY, this.map.tileSize, this.spriteManager);
                            this.map.addResourcePile(bandagePile);
                        }
                        this.map.removeResourceNode(this.currentTask.targetX, this.currentTask.targetY);
                        console.log(`${this.name} completed ${this.currentTask.type} and is now carrying ${this.carrying.type}.`);
                        this.currentTask = null;
                    }
                } else if (this.currentTask.type === TASK_TYPES.BUTCHER && this.currentTask.targetEnemy) {
                    if (this.currentTask.targetEnemy.decay > 50) {
                        this.currentTask.targetEnemy.isMarkedForButcher = false;
                        console.log(`${this.currentTask.targetEnemy.name} is too decayed to butcher.`);
                        this.currentTask = null;
                    } else {
                        const butcheringRate = 0.1;
                        const amountToButcher = butcheringRate * (deltaTime / 1000);
                        this.currentTask.quantity -= amountToButcher;

                        if (this.currentTask.quantity <= 0) {
                            const lootType = this.currentTask.targetEnemy.lootType || RESOURCE_TYPES.MEAT;
                            this.pickUpPile(lootType, 1);
                            this.currentTask.targetEnemy.isButchered = true;
                            this.currentTask.targetEnemy.isMarkedForButcher = false;
                            console.log(`${this.name} butchered ${this.currentTask.targetEnemy.name}.`);
                            this.currentTask = null;
                        }
                    }
                } else if (this.currentTask.type === TASK_TYPES.SOW_CROP && this.currentTask.building) {
                    const farmPlot = this.currentTask.building;
                    if (farmPlot.plant(this.currentTask.cropType)) {
                        console.log(`${this.name} planted ${this.currentTask.cropType} at ${farmPlot.x},${farmPlot.y}.`);
                    } else {
                        console.log(`${this.name} failed to plant at ${farmPlot.x},${farmPlot.y}.`);
                    }
                    this.currentTask = null; // Task completed immediately after action
                } else if (this.currentTask.type === TASK_TYPES.HARVEST_CROP && this.currentTask.building) {
                    const farmPlot = this.currentTask.building;
                    const harvestedCrop = farmPlot.harvest();
                    if (harvestedCrop) {
                        const pile = new ResourcePile(harvestedCrop, 1, farmPlot.x, farmPlot.y, this.map.tileSize, this.spriteManager);
                        this.map.addResourcePile(pile);
                        console.log(`${this.name} harvested ${harvestedCrop} from ${farmPlot.x},${farmPlot.y} and created a pile.`);
                    } else {
                        console.log(`${this.name} failed to harvest at ${farmPlot.x},${farmPlot.y}.`);
                    }
                    this.currentTask = null; // Task completed immediately after action
                } else if (this.currentTask.type === TASK_TYPES.TEND_ANIMALS && this.currentTask.building) {
                    const animalPen = this.currentTask.building;
                    // Simulate tending animals - perhaps increases animal health/reproduction rate
                    console.log(`${this.name} tended to animals at ${animalPen.x},${animalPen.y}.`);
                    this.currentTask = null; // Task completed immediately after action
                } else if (this.currentTask.type === "eat" && this.currentTask.foodType) {
                    const room = this.roomManager.getRoomAt(this.currentTask.targetX, this.currentTask.targetY);
                    if (room && room.type === "storage" && this.roomManager.removeResourceFromStorage(room, this.currentTask.foodType, 1)) {
                        this.hunger += 30;
                        if (this.hunger > 100) this.hunger = 100;
                        this.state = "idle";
                        console.log(`${this.name} ate ${this.currentTask.foodType} from storage.`);
                    } else {
                        console.log(`${this.name} could not find ${this.currentTask.foodType} at storage.`);
                    }
                    this.currentTask = null;
                } else if (this.currentTask.type === TASK_TYPES.HAUL && this.currentTask.building) {
                    const building = this.currentTask.building;
                    // Stage 1: acquire resource if not already carrying
                    if (!this.currentTask.resource && !this.carrying) {
                        if (!this.currentTask.sourceX) {
                            const pile = this.map.resourcePiles.find(p => p.type === this.currentTask.resourceType && p.quantity > 0);
                            if (pile) {
                                this.currentTask.sourceX = pile.x;
                                this.currentTask.sourceY = pile.y;
                                this.currentTask.targetX = pile.x;
                                this.currentTask.targetY = pile.y;
                            } else {
                                console.log(`${this.name} couldn't find ${this.currentTask.resourceType} to haul.`);
                                this.currentTask = null;
                                return;
                            }
                        }
                        if (this.x === this.currentTask.sourceX && this.y === this.currentTask.sourceY) {
                            const pile = this.map.resourcePiles.find(p => p.x === this.currentTask.sourceX && p.y === this.currentTask.sourceY && p.type === this.currentTask.resourceType);
                            if (pile && pile.remove(this.currentTask.quantity)) {
                                if (pile.quantity <= 0) {
                                    this.map.resourcePiles = this.map.resourcePiles.filter(p => p !== pile);
                                }
                                this.pickUpPile(this.currentTask.resourceType, this.currentTask.quantity);
                                this.currentTask.resource = this.carrying;
                                this.currentTask.targetX = building.x;
                                this.currentTask.targetY = building.y;
                            } else {
                                console.log(`${this.name} failed to pick up ${this.currentTask.resourceType}.`);
                                this.currentTask = null;
                            }
                        }
                    } else if (this.carrying && this.x === building.x && this.y === building.y) {
                        building.addToInventory(this.carrying.type, this.carrying.quantity);
                        const deliveredType = this.currentTask.resourceType;
                        this.carrying = null;
                        this.currentTask = null;
                        console.log(`${this.name} delivered ${deliveredType} to building site.`);
                    }
                } else if (this.currentTask.type === TASK_TYPES.HAUL && this.currentTask.sourceX !== undefined && !this.currentTask.building && !this.currentTask.resource) {
                    if (this.x === this.currentTask.sourceX && this.y === this.currentTask.sourceY) {
                        const pile = this.map.resourcePiles.find(p => p.x === this.currentTask.sourceX && p.y === this.currentTask.sourceY && p.type === this.currentTask.resourceType);
                        if (pile && pile.remove(this.currentTask.quantity)) {
                            if (pile.quantity <= 0) {
                                this.map.resourcePiles = this.map.resourcePiles.filter(p => p !== pile);
                            }
                            this.pickUpPile(this.currentTask.resourceType, this.currentTask.quantity);
                            this.currentTask.resource = this.carrying;
                            const target = this.roomManager.findStorageRoomAndTile(this.currentTask.resourceType);
                            if (target) {
                                this.currentTask.targetX = target.tile.x;
                                this.currentTask.targetY = target.tile.y;
                            } else {
                                console.log(`${this.name} couldn't find storage for ${this.currentTask.resourceType}.`);
                                this.currentTask = null;
                            }
                        } else {
                            console.log(`${this.name} failed to pick up ${this.currentTask.resourceType}.`);
                            this.currentTask = null;
                        }
                    }
                } else if (this.currentTask.type === TASK_TYPES.HAUL && this.currentTask.resource) {
                    const room = this.roomManager.getRoomAt(this.currentTask.targetX, this.currentTask.targetY);
                    if (room && room.type === "storage") {
                        const success = this.roomManager.addResourceToStorage(room, this.currentTask.resource.type, this.currentTask.resource.quantity);
                        if (success) {
                            console.log(`${this.name} deposited ${this.currentTask.resource.type} into storage.`);
                        } else {
                            const dropX = Math.floor(this.x);
                            const dropY = Math.floor(this.y);
                            const existingPile = this.map.resourcePiles.find(p => p.x === dropX && p.y === dropY && p.type === this.currentTask.resource.type);
                            if (existingPile) {
                                existingPile.add(this.currentTask.resource.quantity);
                            } else {
                                const newPile = new ResourcePile(this.currentTask.resource.type, this.currentTask.resource.quantity, dropX, dropY, this.map.tileSize, this.spriteManager);
                                this.map.addResourcePile(newPile);
                            }
                            console.log(`${this.name} dropped ${this.currentTask.resource.type} on the ground.`);
                        }
                        this.carrying = null; // Clear carried resource
                    } else {
                        console.log(`${this.name} arrived at haul destination but it's not a storage room.`);
                    }
                    this.currentTask = null; // Task completed immediately after action
                } else if (this.currentTask.type === TASK_TYPES.EXPLORE && this.currentTask.targetLocation) {
                    // Settler has arrived at the exploration target
                    this.map.worldMap.discoverLocation(this.currentTask.targetLocation.id);
                    console.log(`${this.name} has arrived at ${this.currentTask.targetLocation.name} and discovered it.`);
                    this.currentTask = null; // Task completed immediately after action
                } else if (this.currentTask.type === TASK_TYPES.TREATMENT && this.currentTask.targetSettler) {
                    const targetSettler = this.currentTask.targetSettler;

                    if (!this.currentTask.stage) {
                        this.currentTask.stage = 'pickup';
                        const pile = this.map.resourcePiles.find(p => p.type === RESOURCE_TYPES.BANDAGE && p.quantity > 0);
                        if (pile) {
                            this.currentTask.sourceX = pile.x;
                            this.currentTask.sourceY = pile.y;
                            this.currentTask.targetX = pile.x;
                            this.currentTask.targetY = pile.y;
                        } else {
                            console.log(`${this.name} could not find bandages for treatment.`);
                            this.currentTask = null;
                            return;
                        }
                    }

                    if (this.currentTask.stage === 'pickup') {
                        if (this.x === this.currentTask.targetX && this.y === this.currentTask.targetY) {
                            const pile = this.map.resourcePiles.find(p => p.x === this.currentTask.sourceX && p.y === this.currentTask.sourceY && p.type === RESOURCE_TYPES.BANDAGE);
                            if (pile && pile.remove(1)) {
                                if (pile.quantity <= 0) {
                                    this.map.resourcePiles = this.map.resourcePiles.filter(p => p !== pile);
                                }
                                this.pickUpPile(RESOURCE_TYPES.BANDAGE, 1);
                                if (this.x === targetSettler.x && this.y === targetSettler.y) {
                                    if (this.carrying && this.carrying.type === RESOURCE_TYPES.BANDAGE) {
                                        this.carrying.quantity -= 1;
                                        if (this.carrying.quantity <= 0) this.carrying = null;
                                        targetSettler.stopBleeding();
                                        console.log(`${this.name} treated ${targetSettler.name}.`);
                                        this.currentTask = null;
                                        return;
                                    }
                                }
                                this.currentTask.stage = 'treat';
                                this.currentTask.targetX = targetSettler.x;
                                this.currentTask.targetY = targetSettler.y;
                            } else {
                                console.log(`${this.name} failed to pick up bandage.`);
                                this.currentTask = null;
                            }
                        }
                    } else if (this.currentTask.stage === 'treat') {
                        if (this.x === targetSettler.x && this.y === targetSettler.y) {
                            if (this.carrying && this.carrying.type === RESOURCE_TYPES.BANDAGE) {
                                this.carrying.quantity -= 1;
                                if (this.carrying.quantity <= 0) this.carrying = null;
                                targetSettler.stopBleeding();
                                console.log(`${this.name} treated ${targetSettler.name}.`);
                            } else {
                                console.log(`${this.name} lost the bandage before treating ${targetSettler.name}.`);
                            }
                            this.currentTask = null;
                        }
                    }
                }
            }
        } else if (this.state === "combat" && this.targetEnemy) {
            // Move towards the enemy
            const speed = SETTLER_RUN_SPEED; // tiles per second
            const distance = Math.sqrt(Math.pow(this.x - this.targetEnemy.x, 2) + Math.pow(this.y - this.targetEnemy.y, 2));
            const attackRange = 1.5; // Settler needs to be within this range to attack

            if (distance > attackRange) {
                // Move closer
                const angle = Math.atan2(this.targetEnemy.y - this.y, this.targetEnemy.x - this.x);
                this.x += Math.cos(angle) * speed * (deltaTime / 1000);
                this.y += Math.sin(angle) * speed * (deltaTime / 1000);
            } else {
                // Within range, attack!
                this.dealDamage(this.targetEnemy);
                // Check if enemy is defeated
                if (this.targetEnemy.health <= 0) {
                    console.log(`${this.name} defeated ${this.targetEnemy.name}!`);
                    this.targetEnemy = null; // Clear target
                    this.state = "idle"; // Return to idle
                }
            }
        }
    }

    // Placeholder for future methods like update, render, etc.

    render(ctx) {
        const settlerSprite = this.spriteManager.getSprite('settler');
        if (settlerSprite) {
            if (this.isDead) {
                ctx.save();
                ctx.translate(this.x * 32 + 16, this.y * 32 + 16); // Translate to center of tile
                ctx.rotate(Math.PI / 2); // Rotate 90 degrees (PI/2 radians)
                ctx.drawImage(settlerSprite, -16, -16, 32, 32); // Draw image centered
                ctx.restore();
            } else {
                ctx.drawImage(settlerSprite, this.x * 32, this.y * 32, 32, 32);
            }
        } else {
            ctx.fillStyle = 'blue';
            ctx.fillRect(this.x * 32, this.y * 32, 32, 32);
        }
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(this.name, this.x * 32, this.y * 32 - 5);
        ctx.fillText(this.state, this.x * 32, this.y * 32 + 40);
        ctx.fillText(this.getStatus(), this.x * 32, this.y * 32 + 50);
        ctx.fillText(`Health: ${this.health.toFixed(1)}`, this.x * 32, this.y * 32 + 60);
    }

    getStatus() {
        if (this.needsTreatment()) return "Bleeding";
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

    takeDamage(bodyPart, amount, bleeding = false, attacker = null) {
        if (this.isSleeping && this.sleep > 20) {
            this.isSleeping = false;
            if (this.currentBed) {
                this.currentBed.occupant = null;
                this.currentBed = null;
            }
            this.state = 'combat';
        }

        if (this.bodyParts[bodyPart]) {
            this.bodyParts[bodyPart].health -= amount;
            if (this.bodyParts[bodyPart].health < 0) this.bodyParts[bodyPart].health = 0;
            this.bodyParts[bodyPart].bleeding = bleeding;
            console.log(`${this.name} took ${amount} damage to ${bodyPart}. Health: ${this.bodyParts[bodyPart].health}. Bleeding: ${this.bodyParts[bodyPart].bleeding}`);
            if (attacker && this.targetEnemy === null) {
                this.setTargetEnemy(attacker);
                if (this.currentTask) {
                    this.currentTask = null;
                }
                this.state = "combat";
                if (this.allSettlers) {
                    this.allSettlers.forEach(ally => {
                        if (ally !== this && !ally.isDead && ally.state === 'idle' && !ally.currentTask) {
                            const distance = Math.sqrt(Math.pow(ally.x - this.x, 2) + Math.pow(ally.y - this.y, 2));
                            if (distance <= 5) {
                                ally.setTargetEnemy(attacker);
                                ally.state = 'combat';
                            }
                        }
                    });
                }
            }
            if (this.health <= 0) {
                this.isDead = true;
                this.state = "dead";
                this.currentTask = null; // Clear any current task
                this.targetEnemy = null; // Clear target enemy
                console.log(`${this.name} has died.`);
            }
        } else {
            console.warn(`Invalid body part: ${bodyPart}`);
        }
    }

    needsTreatment() {
        for (const part in this.bodyParts) {
            if (this.bodyParts[part].bleeding) {
                return true;
            }
        }
        return false;
    }

    stopBleeding() {
        for (const part in this.bodyParts) {
            this.bodyParts[part].bleeding = false;
        }
    }

    dealDamage(targetSettler) {
        let weapon = this.equippedWeapon;
        if (!weapon) {
            // If no weapon, use fists
            weapon = { name: "fists", damage: 5 }; // Base damage for unarmed combat
            console.log(`${this.name} is fighting with ${weapon.name}.`);
        }

        // Base damage from weapon (or fists)
        let damage = weapon.damage;

        // Add combat skill bonus
        damage += this.skills.combat * 0.5; // Each skill point adds 0.5 damage

        if (targetSettler.bodyParts) { // Check if target has body parts (i.e., is a Settler)
            // Choose a random body part to hit
            const bodyParts = Object.keys(targetSettler.bodyParts);
            const randomBodyPart = bodyParts[Math.floor(Math.random() * bodyParts.length)];

            // Apply armor defense
            if (targetSettler.equippedArmor[randomBodyPart]) {
                damage -= targetSettler.equippedArmor[randomBodyPart].defense;
                if (damage < 0) damage = 0; // Damage cannot be negative
            }

            // Apply damage to the target settler
            targetSettler.takeDamage(randomBodyPart, damage, true); // Assume bleeding for now
            console.log(`${this.name} attacked ${targetSettler.name} dealing ${damage.toFixed(1)} damage to ${randomBodyPart}.`);
        } else { // Target is likely an Enemy
            targetSettler.health -= damage;
            if (targetSettler.health <= 0) {
                targetSettler.health = 0;
                targetSettler.isDead = true;
                targetSettler.state = "dead";
                targetSettler.currentTask = null; // Clear any current task
                targetSettler.targetSettler = null; // Clear target settler for enemy
                console.log(`${targetSettler.name} has died.`);
            }
            console.log(`${this.name} attacked ${targetSettler.name} dealing ${damage.toFixed(1)} damage. ${targetSettler.name} health: ${targetSettler.health.toFixed(1)}`);
        }
    }

    serialize() {
        return {
            name: this.name,
            x: this.x,
            y: this.y,
            health: this.health,
            bodyParts: this.bodyParts,
            hunger: this.hunger,
            sleep: this.sleep,
            mood: this.mood,
            state: this.state,
            currentTask: this.currentTask ? this.currentTask.serialize() : null,
            carrying: this.carrying,
            skills: this.skills,
            equippedWeapon: this.equippedWeapon ? this.equippedWeapon.serialize() : null,
            equippedArmor: Object.fromEntries(Object.entries(this.equippedArmor).map(([part, armor]) => [part, armor.serialize()])),
            targetEnemy: this.targetEnemy ? { id: this.targetEnemy.id } : null, // Only save ID, actual object will be re-linked
            isDead: this.isDead,
            isSleeping: this.isSleeping,
            sleepingInBed: this.sleepingInBed,
            taskPriorities: this.taskPriorities
        };
    }

    deserialize(data) {
        this.name = data.name;
        this.x = data.x;
        this.y = data.y;
        this.health = data.health;
        this.bodyParts = data.bodyParts;
        this.hunger = data.hunger;
        this.sleep = data.sleep;
        this.mood = data.mood;
        this.state = data.state;
        this.carrying = data.carrying;
        this.skills = data.skills;
        // Re-instantiate Weapon and Armor objects if they exist
        if (data.equippedWeapon) {
            // Assuming a Weapon class exists and has a deserialize method
            // For now, just assign the data, ideally you'd re-instantiate the object
            this.equippedWeapon = data.equippedWeapon; 
        }
        if (data.equippedArmor) {
            // Assuming an Armor class exists and has a deserialize method
            // For now, just assign the data, ideally you'd re-instantiate the objects
            this.equippedArmor = data.equippedArmor;
        }
        if (data.currentTask) {
            const task = new Task(
                data.currentTask.type,
                data.currentTask.targetX,
                data.currentTask.targetY,
                data.currentTask.resourceType,
                data.currentTask.quantity,
                data.currentTask.priority,
                data.currentTask.building,
                data.currentTask.recipe,
                data.currentTask.cropType,
                data.currentTask.targetLocation,
                data.currentTask.carrying,
                data.currentTask.targetSettler,
                data.currentTask.targetEnemy
            );
            task.deserialize(data.currentTask);
            this.currentTask = task;
        }
        // targetEnemy will need to be re-linked by the Game class after all entities are deserialized
        this.targetEnemy = null;
        this.isDead = data.isDead || false;
        this.isSleeping = data.isSleeping || false;
        this.sleepingInBed = data.sleepingInBed || false;
        if (data.taskPriorities) {
            this.taskPriorities = data.taskPriorities;
        }
    }
}
