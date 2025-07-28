import { debugLog } from './debug.js';
import ResourcePile from './resourcePile.js';
import Task from './task.js';
import { TASK_TYPES, FOOD_HUNGER_VALUES, RESOURCE_TYPES } from './constants.js';

export default class RoomManager {
    constructor(map, spriteManager, tileSize, taskManager = null, settlers = []) {
        this.map = map;
        this.spriteManager = spriteManager;
        this.tileSize = tileSize;
        this.map = map;
        this.taskManager = taskManager;
        this.rooms = []; // Stores room objects
        this.roomGrid = Array(map.height).fill(0).map(() => Array(map.width).fill(null)); // 2D array to store room references for each tile
        this.settlers = settlers;
    }

    setSettlers(settlers) {
        this.settlers = settlers;
    }

    /**
     * Designates a rectangular area as a room of a specific type.
     * @param {number} startX - Starting X coordinate (tile).
     * @param {number} startY - Starting Y coordinate (tile).
     * @param {number} endX - Ending X coordinate (tile).
     * @param {number} endY - Ending Y coordinate (tile).
     * @param {string} type - Type of room (e.g., "bedroom", "storage").
     */
    designateRoom(startX, startY, endX, endY, type) {
        // Ensure coordinates are within bounds and ordered correctly
        const x1 = Math.min(startX, endX);
        const y1 = Math.min(startY, endY);
        const x2 = Math.max(startX, endX);
        const y2 = Math.max(startY, endY);

        const newRoom = {
            id: Date.now(), // Simple unique ID
            type: type,
            tiles: [],
            storage: {} // For storage rooms, this will hold resources
        };

        for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
                if (this.map.getTile(x, y) !== -1) { // Check if tile is valid
                    if (this.roomGrid[y][x] === null) { // Only designate if not already part of a room
                        this.roomGrid[y][x] = newRoom;
                        newRoom.tiles.push({ x, y });
                    } else {
                        console.warn(`Tile ${x},${y} is already part of a room. Skipping.`);
                    }
                }
            }
        }

        if (newRoom.tiles.length > 0) {
            this.rooms.push(newRoom);
            debugLog(`Designated a ${type} room with ${newRoom.tiles.length} tiles.`);
            if (type === 'storage' && this.taskManager) {
                this.assignHaulingTasksForDroppedPiles();
            }
            return newRoom;
        }
        return null;
    }

    getRoomAt(x, y) {
        if (x >= 0 && x < this.map.width && y >= 0 && y < this.map.height) {
            return this.roomGrid[y][x];
        }
        return null;
    }

    /**
     * Find a storage room and tile that can accept a given resource type.
     * Returns an object with the room and tile coordinates or null if none found.
     * @param {string} resourceType
     */
    findStorageRoomAndTile(resourceType) {
        for (const room of this.rooms) {
            if (room.type !== "storage") continue;

            let emptyTile = null;
            for (const tile of room.tiles) {
                const pileAtTile = this.map.resourcePiles.find(p => p.x === tile.x && p.y === tile.y);

                if (pileAtTile) {
                    if (pileAtTile.type === resourceType && pileAtTile.quantity < ResourcePile.MAX_QUANTITY) {
                        return { room, tile };
                    }
                    continue;
                }

                if (!emptyTile) {
                    emptyTile = tile;
                }
            }

            if (emptyTile) {
                return { room, tile: emptyTile };
            }
        }

        return null;
    }

    addResourceToStorage(room, resourceType, quantity) {
        if (room.type !== "storage") {
            console.warn(`Room ${room.id} is not a storage room.`);
            return false;
        }

        if (!room.storage[resourceType]) {
            room.storage[resourceType] = 0;
        }
        room.storage[resourceType] += quantity;
        debugLog(`Added ${quantity} ${resourceType} to storage room ${room.id}. Current: ${room.storage[resourceType]}`);

        if (room.tiles.length > 0) {
            let emptyTile = null;
            let pile = null;

            for (const tile of room.tiles) {
                const pileAtTile = this.map.resourcePiles.find(p => p.x === tile.x && p.y === tile.y);

                // If a pile already exists on this tile, we can't place another one
                if (pileAtTile) {
                    if (pileAtTile.type === resourceType) {
                        // Found a pile of the same type to stack onto
                        pile = pileAtTile;
                        break;
                    }
                    continue;
                }

                // First completely empty tile becomes a candidate
                if (!emptyTile) {
                    emptyTile = tile;
                }
            }

            if (pile) {
                pile.add(quantity);
            } else if (emptyTile) {
                const newPile = new ResourcePile(resourceType, quantity, emptyTile.x, emptyTile.y, this.tileSize, this.spriteManager);
                const added = this.map.addResourcePile(newPile);
                if (!added) {
                    console.warn('Failed to add resource pile to map.');
                }
            } else {
                console.warn('No available storage tile for resource pile.');
                return false;
            }
        }

        return true;
    }

    removeResourceFromStorage(room, resourceType, quantity) {
        if (room.type !== "storage") {
            console.warn(`Room ${room.id} is not a storage room.`);
            return false;
        }

        if (!room.storage[resourceType] || room.storage[resourceType] < quantity) {
            console.warn(`Not enough ${resourceType} in storage room ${room.id}.`);
            return false;
        }

        let remaining = quantity;
        for (const tile of room.tiles) {
            if (remaining <= 0) break;
            const pile = this.map.resourcePiles.find(p => p.x === tile.x && p.y === tile.y && p.type === resourceType);
            if (pile) {
                const removeAmount = Math.min(pile.quantity, remaining);
                pile.remove(removeAmount);
                remaining -= removeAmount;
            }
        }

        if (remaining > 0) {
            console.warn(`Storage room ${room.id} missing piles for ${resourceType}.`);
            return false;
        }

        room.storage[resourceType] -= quantity;
        debugLog(`Removed ${quantity} ${resourceType} from storage room ${room.id}. Current: ${room.storage[resourceType]}`);
        if (this.taskManager) {
            this.assignHaulingTasksForDroppedPiles();
        }
        return true;
    }

    findHighestValueFoods(count = 2) {
        const foods = [];
        for (const room of this.rooms) {
            if (room.type !== 'storage') continue;
            for (const food in FOOD_HUNGER_VALUES) {
                if (food === RESOURCE_TYPES.MEAL) continue;
                const qty = room.storage[food] || 0;
                const limit = Math.min(qty, count);
                for (let i = 0; i < limit; i++) {
                    foods.push({ room, type: food, value: FOOD_HUNGER_VALUES[food] });
                }
            }
        }
        foods.sort((a, b) => b.value - a.value);
        return foods.slice(0, count);
    }

    assignHaulingTasksForDroppedPiles(settlers = this.settlers) {
        if (!this.taskManager) return;
        for (const pile of this.map.resourcePiles) {
            const roomAtPile = this.getRoomAt(pile.x, pile.y);
            if (roomAtPile && roomAtPile.type === 'storage') {
                continue; // Already in storage
            }
            const target = this.findStorageRoomAndTile(pile.type);
            if (!target) continue;
            const existing = this.taskManager.tasks.some(
                t => t.type === TASK_TYPES.HAUL && t.sourceX === pile.x && t.sourceY === pile.y && t.resourceType === pile.type
            );
            const assigned = (settlers || []).some(
                s => s.currentTask && s.currentTask.type === TASK_TYPES.HAUL &&
                     s.currentTask.sourceX === pile.x &&
                     s.currentTask.sourceY === pile.y &&
                     s.currentTask.resourceType === pile.type
            );
            if (!existing && !assigned) {
                const task = new Task(TASK_TYPES.HAUL, pile.x, pile.y, pile.type, pile.quantity, 2, null, null, null, null, null, null, null, pile.x, pile.y);
                // Initial target is the pile itself; destination will be chosen when picked up
                this.taskManager.addTask(task);
            }
        }
    }

    // Future: removeRoom, getRoomsByType, etc.

    render(ctx, tileSize) {
        this.rooms.forEach(room => {
            let color;
            switch (room.type) {
                case "bedroom":
                    color = "rgba(255, 0, 0, 0.3)"; // Red for bedroom
                    break;
                case "storage":
                    color = "rgba(0, 0, 255, 0.3)"; // Blue for storage
                    break;
                default:
                    color = "rgba(128, 128, 128, 0.3)"; // Grey for unknown
            }

            ctx.fillStyle = color;
            room.tiles.forEach(tile => {
                ctx.fillRect(tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);
            });
        });
    }
}