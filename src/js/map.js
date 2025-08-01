import ResourcePile from './resourcePile.js';
import Building from './building.js';
import CraftingStation from './craftingStation.js';
import Oven from './oven.js';
import Well from './well.js';
import FarmPlot from './farmPlot.js';
import AnimalPen from './animalPen.js';
import Furniture from './furniture.js';
import Wall from './wall.js';
import { BUILDING_TYPES, BUILDING_TYPE_PROPERTIES } from './constants.js';
import { debugWarn } from './debug.js';

function mulberry32(a) {
    return function () {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export default class Map {
    constructor(width, height, tileSize, spriteManager, seed = null) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.spriteManager = spriteManager;
        this.random = seed === null ? Math.random : mulberry32(seed);
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
            7: '#800000', // animal
            8: '#0000FF'  // water
        };
    }

    createEmptyMap() {
        const tiles = [];
        for (let y = 0; y < this.height; y++) {
            tiles[y] = [];
            for (let x = 0; x < this.width; x++) {
                const rand = this.random();
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
                } else if (rand < 0.25) {
                    tiles[y][x] = 1; // 1 for dirt
                } else {
                    tiles[y][x] = 0; // 0 for grass
                }
            }
        }

        const puddleChance = 0.005;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.random() < puddleChance) {
                    const patchWidth = Math.floor(this.random() * 2) + 2; // 2-3
                    const patchHeight = Math.floor(this.random() * 2) + 2; // 2-3
                    for (let py = 0; py < patchHeight; py++) {
                        for (let px = 0; px < patchWidth; px++) {
                            const nx = x + px;
                            const ny = y + py;
                            if (nx < this.width && ny < this.height) {
                                tiles[ny][nx] = 8; // water tile
                            }
                        }
                    }
                }
            }
        }

        return tiles;
    }

    addResourcePile(resourcePile) {
        resourcePile.spriteManager = this.spriteManager; // Assign spriteManager to the resource pile
        resourcePile.map = this;
        const existing = this.resourcePiles.find(p => p.x === resourcePile.x && p.y === resourcePile.y);
        if (existing) {
            if (existing.type === resourcePile.type) {
                existing.add(resourcePile.quantity);
            } else {
                debugWarn(`Tile ${resourcePile.x},${resourcePile.y} already has a pile.`);
                return false;
            }
        } else {
            this.resourcePiles.push(resourcePile);
        }
        return true;
    }

    removeResourcePile(pile) {
        this.resourcePiles = this.resourcePiles.filter(p => p !== pile);
    }

    addBuilding(building) {
        building.spriteManager = this.spriteManager;
        building.map = this;

        const existing = this.getBuildingsAt(building.x, building.y);
        const hasFloor = existing.some(b => b.type === BUILDING_TYPES.FLOOR);
        const hasNonFloor = existing.some(b => b.type !== BUILDING_TYPES.FLOOR);
        const hasNonFurniture = existing.some(
            b => b.type !== BUILDING_TYPES.FLOOR && !b.isFurniture,
        );

        if (building.type === BUILDING_TYPES.FLOOR) {
            if (hasFloor || hasNonFurniture) {
                debugWarn(`Tile ${building.x},${building.y} already has a building.`);
                return false;
            }
        } else if (hasNonFloor) {
            debugWarn(`Tile ${building.x},${building.y} already has a building.`);
            return false;
        }

        this.buildings.push(building);
        if (building.type === BUILDING_TYPES.WALL && typeof building.updateConnections === 'function') {
            this.updateWallConnections(building.x, building.y);
            const dirs = [
                { dx: 0, dy: -1 },
                { dx: 1, dy: 0 },
                { dx: 0, dy: 1 },
                { dx: -1, dy: 0 },
            ];
            for (const { dx, dy } of dirs) {
                const neighbor = this.getBuildingAt(building.x + dx, building.y + dy);
                if (neighbor && neighbor.type === BUILDING_TYPES.WALL) {
                    this.updateWallConnections(neighbor.x, neighbor.y);
                }
            }
        }
        return true;
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
        const buildingsAtTile = this.buildings.filter(
            building => building.x === x && building.y === y,
        );
        if (buildingsAtTile.length === 0) {
            return undefined;
        }
        // Prefer non-floor buildings when multiple occupy the same tile
        for (let i = buildingsAtTile.length - 1; i >= 0; i--) {
            if (buildingsAtTile[i].type !== BUILDING_TYPES.FLOOR) {
                return buildingsAtTile[i];
            }
        }
        // If only floors exist, return the last one
        return buildingsAtTile[buildingsAtTile.length - 1];
    }

    getBuildingsAt(x, y) {
        return this.buildings.filter(b => b.x === x && b.y === y);
    }

    removeBuilding(buildingToRemove) {
        this.buildings = this.buildings.filter(building => building !== buildingToRemove);
        if (buildingToRemove.type === BUILDING_TYPES.WALL) {
            const dirs = [
                { dx: 0, dy: -1 },
                { dx: 1, dy: 0 },
                { dx: 0, dy: 1 },
                { dx: -1, dy: 0 },
            ];
            for (const { dx, dy } of dirs) {
                const neighbor = this.getBuildingAt(buildingToRemove.x + dx, buildingToRemove.y + dy);
                if (neighbor && neighbor.type === BUILDING_TYPES.WALL && typeof neighbor.updateConnections === 'function') {
                    this.updateWallConnections(neighbor.x, neighbor.y);
                }
            }
        }
    }

    getAllBuildings() {
        return this.buildings;
    }

    findAdjacentFreeTile(x, y, fromX = null, fromY = null) {
        const directions = [
            { dx: 1, dy: 0 },
            { dx: -1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: 0, dy: -1 },
        ];

        let best = null;
        let bestDist = Infinity;

        for (const { dx, dy } of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
                const tile = this.getTile(nx, ny);
                const b = this.getBuildingAt(nx, ny);
                const buildingPassable = b
                    ? BUILDING_TYPE_PROPERTIES[b.type]?.passable !== false
                    : true;

                if (tile !== 8 || buildingPassable) {
                    if (!b || buildingPassable) {
                        if (fromX !== null && fromY !== null) {
                            const dist = (fromX - nx) ** 2 + (fromY - ny) ** 2;
                            if (dist < bestDist) {
                                bestDist = dist;
                                best = { x: nx, y: ny };
                            }
                        } else {
                            return { x: nx, y: ny };
                        }
                    }
                }
            }
        }

        if (best) return best;
        return { x, y };
    }

    render(ctx) {
        const treeSprite = this.spriteManager.getSprite('tree');
        const grassSprite = this.spriteManager.getSprite('grass');
        const berryBushSprite = this.spriteManager.getSprite('berry_bush');
        const stoneSprite = this.spriteManager.getSprite('stone');
        const ironOreSprite = this.spriteManager.getSprite('iron_ore');
        const deerSprite = this.spriteManager.getSprite('deer');
        const dirtSprite = this.spriteManager.getSprite('dirt');
        const forageFoodSprite = this.spriteManager.getSprite('mushroom');
        const waterSprite = this.spriteManager.getSprite('water');

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
                } else if (tile === 1 && dirtSprite) {
                    ctx.drawImage(dirtSprite, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                } else if (tile === 6 && forageFoodSprite) {
                    ctx.drawImage(forageFoodSprite, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                } else if (tile === 8 && waterSprite) {
                    ctx.drawImage(waterSprite, x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                } else if (tile !== 0) {
                    ctx.fillStyle = this.tileColors[tile] || '#000000';
                    ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }

        for (const pile of this.resourcePiles) {
            pile.render(ctx);
        }

        // Draw floors first so they appear beneath furniture and other buildings
        const floors = [];
        const nonFloors = [];
        for (const building of this.buildings) {
            if (building.type === BUILDING_TYPES.FLOOR) {
                floors.push(building);
            } else {
                nonFloors.push(building);
            }
        }

        for (const floor of floors) {
            floor.render(ctx, this.tileSize);
        }

        for (const building of nonFloors) {
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
            const pile = new ResourcePile(pileData.type, pileData.quantity, pileData.x, pileData.y, this.tileSize, this.spriteManager);
            pile.deserialize(pileData);
            pile.map = this;
            return pile;
        });
        this.buildings = data.buildings.map(buildingData => {
            // Re-instantiate based on type if needed, otherwise use base Building
            let building;
            if (buildingData.type === BUILDING_TYPES.CRAFTING_STATION) {
                building = new CraftingStation(buildingData.x, buildingData.y, this.spriteManager);
            } else if (buildingData.type === BUILDING_TYPES.OVEN) {
                building = new Oven(buildingData.x, buildingData.y, this.spriteManager);
            } else if (buildingData.type === BUILDING_TYPES.WELL) {
                building = new Well(buildingData.x, buildingData.y, this.spriteManager);
            } else if (buildingData.type === BUILDING_TYPES.FARM_PLOT) {
                building = new FarmPlot(buildingData.x, buildingData.y, this.spriteManager);
            } else if (buildingData.type === BUILDING_TYPES.ANIMAL_PEN) {
                building = new AnimalPen(buildingData.x, buildingData.y);
            } else if (buildingData.type === BUILDING_TYPES.WALL) {
                building = new Wall(buildingData.x, buildingData.y, this.spriteManager);
            } else if (buildingData.type === BUILDING_TYPES.BED || buildingData.type === BUILDING_TYPES.TABLE) {
                building = new Furniture(buildingData.type, buildingData.x, buildingData.y, 1, 1, buildingData.material, buildingData.health, this.spriteManager);
            } else {
                building = new Building(buildingData.type, buildingData.x, buildingData.y, buildingData.width, buildingData.height, buildingData.material, buildingData.health);
            }
            building.deserialize(buildingData);
            if (building.type === BUILDING_TYPES.BED || building.type === BUILDING_TYPES.TABLE) {
                building.width = 1;
                building.height = 1;
            }
            building.spriteManager = this.spriteManager;
            building.map = this;
            return building;
        });
        this.updateAllWallConnections();
    }

    updateWallConnections(x, y) {
        const wall = this.getBuildingAt(x, y);
        if (!wall || wall.type !== BUILDING_TYPES.WALL || typeof wall.updateConnections !== 'function') return;
        wall.updateConnections();
    }

    updateAllWallConnections() {
        for (const building of this.buildings) {
            if (building.type === BUILDING_TYPES.WALL) {
                this.updateWallConnections(building.x, building.y);
            }
        }
    }
}