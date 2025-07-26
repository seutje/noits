import ResourcePile from './resourcePile.js';
import Building from './building.js';
import CraftingStation from './craftingStation.js';
import FarmPlot from './farmPlot.js';
import AnimalPen from './animalPen.js';
import Furniture from './furniture.js';

export default class Map {
    constructor(width, height, tileSize, spriteManager) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.spriteManager = spriteManager;
        this.tiles = this.createEmptyMap();
        this.resourcePiles = [];
        this.buildings = [];
        this.tileColors = {
            0: '#2c9f45', // grass
            1: '#8b4513', // dirt
            2: '#006400', // tree
            3: '#808080', // stone
            4: '#FF0000', // berries
            5: '#A9A9A9', // iron ore
            6: '#8B4513', // wild food
            7: '#800000'  // animal
        };
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
        const treeSprite = this.spriteManager.getSprite('tree');
        const grassSprite = this.spriteManager.getSprite('grass');
        const berryBushSprite = this.spriteManager.getSprite('berry_bush');
        const stoneSprite = this.spriteManager.getSprite('stone');
        const ironOreSprite = this.spriteManager.getSprite('iron_ore');
        const deerSprite = this.spriteManager.getSprite('deer');

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.tiles[y][x];

                if (grassSprite) {
                    ctx.drawImage(grassSprite, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                } else {
                    ctx.fillStyle = this.tileColors[0];
                    ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }

                if (tile === 2 && treeSprite) {
                    ctx.drawImage(treeSprite, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                } else if (tile === 4 && berryBushSprite) {
                    ctx.drawImage(berryBushSprite, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                } else if (tile === 3 && stoneSprite) {
                    ctx.drawImage(stoneSprite, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                } else if (tile === 5 && ironOreSprite) {
                    ctx.drawImage(ironOreSprite, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                } else if (tile === 7 && deerSprite) {
                    ctx.drawImage(deerSprite, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                } else if (tile !== 0) {
                    ctx.fillStyle = this.tileColors[tile] || '#000000';
                    ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }

        for (const pile of this.resourcePiles) {
            pile.render(ctx);
        }

        for (const building of this.buildings) {
            building.render(ctx, this.tileSize);
        }
    }

    serialize() {
        return {
            width: this.width,
            height: this.height,
            tileSize: this.tileSize,
            tiles: this.tiles,
            resourcePiles: this.resourcePiles.map(pile => pile.serialize()),
            buildings: this.buildings.map(building => building.serialize())
        };
    }

    deserialize(data) {
        this.width = data.width;
        this.height = data.height;
        this.tileSize = data.tileSize;
        this.tiles = data.tiles;
        this.resourcePiles = data.resourcePiles.map(pileData => {
            const pile = new ResourcePile(pileData.type, pileData.quantity, pileData.x, pileData.y, this.tileSize);
            pile.deserialize(pileData);
            return pile;
        });
        this.buildings = data.buildings.map(buildingData => {
            // Re-instantiate based on type if needed, otherwise use base Building
            let building;
            if (buildingData.type === 'crafting_station') {
                building = new CraftingStation(buildingData.x, buildingData.y);
            } else if (buildingData.type === 'farm_plot') {
                building = new FarmPlot(buildingData.x, buildingData.y);
            } else if (buildingData.type === 'animal_pen') {
                building = new AnimalPen(buildingData.x, buildingData.y);
            } else if (buildingData.type === 'bed' || buildingData.type === 'table') {
                building = new Furniture(buildingData.type, buildingData.x, buildingData.y, buildingData.width, buildingData.height, buildingData.material, buildingData.health);
            } else {
                building = new Building(buildingData.type, buildingData.x, buildingData.y, buildingData.width, buildingData.height, buildingData.material, buildingData.health);
            }
            building.deserialize(buildingData);
            return building;
        });
    }
}