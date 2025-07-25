import ResourcePile from './resourcePile.js';

export default class Map {
    constructor(width, height, tileSize) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.tiles = this.createEmptyMap();
        this.resourcePiles = [];
        this.buildings = [];
    }

    createEmptyMap() {
        const tiles = [];
        for (let y = 0; y < this.height; y++) {
            tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                const rand = Math.random();
                if (rand < 0.05) {
                    tiles[y][x] = 2; // 2 for tree
                } else if (rand < 0.25) {
                    tiles[y][x] = 1; // 1 for dirt
                } else {
                    tiles[y][x] = 0; // 0 for grass
                }
            }
        }
        return tiles;
    }

    addResourcePile(resourcePile) {
        this.resourcePiles.push(resourcePile);
    }

    addBuilding(building) {
        this.buildings.push(building);
    }

    getTile(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.tiles[y][x];
        }
        return -1; // Or throw an error, depending on desired behavior for out-of-bounds
    }

    removeTree(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.tiles[y][x] = 0; // Change tree to grass
        }
    }

    getBuildingAt(x, y) {
        return this.buildings.find(building => building.x === x && building.y === y);
    }

    removeBuilding(buildingToRemove) {
        this.buildings = this.buildings.filter(building => building !== buildingToRemove);
    }

    render(ctx) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];
                if (tile === 0) {
                    ctx.fillStyle = '#2c9f45'; // Green for grass
                } else if (tile === 1) {
                    ctx.fillStyle = '#8b4513'; // Brown for dirt
                } else if (tile === 2) {
                    ctx.fillStyle = '#006400'; // Dark green for tree
                } else if (tile === 3) {
                    ctx.fillStyle = '#808080'; // Grey for stone
                } else if (tile === 4) {
                    ctx.fillStyle = '#FF0000'; // Red for berries
                } else if (tile === 5) {
                    ctx.fillStyle = '#A9A9A9'; // Darker grey for iron_ore
                }
                ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
            }
        }

        for (const pile of this.resourcePiles) {
            pile.render(ctx);
        }

        for (const building of this.buildings) {
            building.render(ctx, this.tileSize);
        }
    }
}