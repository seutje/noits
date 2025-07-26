import ResourcePile from './resourcePile.js';

export default class RoomManager {
    constructor(map, spriteManager, tileSize) {
        this.map = map;
        this.spriteManager = spriteManager;
        this.tileSize = tileSize;
        this.map = map;
        this.rooms = []; // Stores room objects
        this.roomGrid = Array(map.height).fill(0).map(() => Array(map.width).fill(null)); // 2D array to store room references for each tile
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
            console.log(`Designated a ${type} room with ${newRoom.tiles.length} tiles.`);
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

    addResourceToStorage(room, resourceType, quantity) {
        if (room.type === "storage") {
            if (!room.storage[resourceType]) {
                room.storage[resourceType] = 0;
            }
            room.storage[resourceType] += quantity;
            console.log(`Added ${quantity} ${resourceType} to storage room ${room.id}. Current: ${room.storage[resourceType]}`);
            
            // Find a suitable tile in the storage room to place the resource pile
            if (room.tiles.length > 0) {
                const { x, y } = room.tiles[0]; // Use the first tile of the room for now
                const existingPile = this.map.resourcePiles.find(pile => pile.x === x && pile.y === y && pile.type === resourceType);

                if (existingPile) {
                    existingPile.add(quantity);
                } else {
                    const newPile = new ResourcePile(resourceType, quantity, x, y, this.tileSize, this.spriteManager);
                    this.map.addResourcePile(newPile);
                }
            }
            return true;
        }
        console.warn(`Room ${room.id} is not a storage room.`);
        return false;
    }

    removeResourceFromStorage(room, resourceType, quantity) {
        if (room.type === "storage") {
            if (room.storage[resourceType] && room.storage[resourceType] >= quantity) {
                room.storage[resourceType] -= quantity;
                console.log(`Removed ${quantity} ${resourceType} from storage room ${room.id}. Current: ${room.storage[resourceType]}`);
                return true;
            }
            console.warn(`Not enough ${resourceType} in storage room ${room.id}.`);
            return false;
        }
        console.warn(`Room ${room.id} is not a storage room.`);
        return false;
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