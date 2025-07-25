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
                } else if (rand < 0.07) {
                    tiles[y][x] = 3; // 3 for stone
                } else if (rand < 0.09) {
                    tiles[y][x] = 4; // 4 for berries
                } else if (rand < 0.11) {
                    tiles[y][x] = 5; // 5 for iron_ore
                } else if (rand < 0.13) {
                    tiles[y][x] = 6; // 6 for wild food (bush)
                } else if (rand < 0.15) {
                    tiles[y][x] = 7; // 7 for animal
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

    removeResourceNode(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.tiles[y][x] = 0; // Change resource node to grass
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
                } else if (tile === 6) {
                    ctx.fillStyle = '#8B4513'; // Brown for wild food (bush)
                } else if (tile === 7) {
                    ctx.fillStyle = '#800000'; // Maroon for animal
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