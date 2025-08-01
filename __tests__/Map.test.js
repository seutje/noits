import Map from '../src/js/map.js';
import ResourcePile from '../src/js/resourcePile.js';
import Building from '../src/js/building.js';
import Furniture from '../src/js/furniture.js';
import { BUILDING_TYPES } from '../src/js/constants.js';

describe('Map resource piles', () => {
    test('should not allow multiple piles on same tile', () => {
        const map = new Map(10, 10, 32, { getSprite: jest.fn() });
        const pile1 = new ResourcePile('wood', 10, 1, 1, 32, {});
        const pile2 = new ResourcePile('stone', 5, 1, 1, 32, {});
        expect(map.addResourcePile(pile1)).toBe(true);
        expect(map.addResourcePile(pile2)).toBe(false);
        expect(map.resourcePiles.length).toBe(1);
    });

    test('should merge piles of same type on same tile', () => {
        const map = new Map(10, 10, 32, { getSprite: jest.fn() });
        const pile1 = new ResourcePile('wood', 10, 2, 2, 32, {});
        const pile2 = new ResourcePile('wood', 5, 2, 2, 32, {});
        map.addResourcePile(pile1);
        map.addResourcePile(pile2);
        expect(map.resourcePiles.length).toBe(1);
        expect(map.resourcePiles[0].quantity).toBe(15);
    });

    test('should remove pile when quantity reaches zero', () => {
        const map = new Map(10, 10, 32, { getSprite: jest.fn() });
        const pile = new ResourcePile('wood', 5, 3, 3, 32, {});
        map.addResourcePile(pile);
        expect(map.resourcePiles.length).toBe(1);
        pile.remove(5);
        expect(map.resourcePiles.length).toBe(0);
    });

    test('should create clusters of water tiles', () => {
        const map = new Map(50, 30, 32, { getSprite: jest.fn() });
        const waterTiles = [];
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                if (map.tiles[y][x] === 8) {
                    waterTiles.push({ x, y });
                }
            }
        }
        expect(waterTiles.length).toBeGreaterThan(0);
        const hasCluster = waterTiles.some(tile => {
            const { x, y } = tile;
            const neighbors = [
                [x + 1, y],
                [x - 1, y],
                [x, y + 1],
                [x, y - 1],
            ];
            return neighbors.some(([nx, ny]) =>
                nx >= 0 && nx < map.width && ny >= 0 && ny < map.height && map.tiles[ny][nx] === 8
            );
        });
        expect(hasCluster).toBe(true);
    });
});

describe('findAdjacentFreeTile', () => {
    test('returns passable floor tile on water', () => {
        const map = new Map(3, 3, 32, { getSprite: jest.fn() });
        map.tiles = [
            [0, 0, 0],
            [0, 8, 8],
            [0, 0, 0],
        ];
        const floor = new Building(BUILDING_TYPES.FLOOR, 1, 1, 1, 1, 'wood', 100);
        map.addBuilding(floor);

        const pos = map.findAdjacentFreeTile(2, 1);
        expect(pos).toEqual({ x: 1, y: 1 });
    });
});

describe('building placement rules', () => {
    test('cannot place building on top of another building', () => {
        const map = new Map(5, 5, 32, { getSprite: jest.fn() });
        const wall = new Building(BUILDING_TYPES.WALL, 2, 2, 1, 1, 'stone', 0);
        const other = new Building(BUILDING_TYPES.BARRICADE, 2, 2, 1, 1, 'wood', 0);
        expect(map.addBuilding(wall)).toBe(true);
        expect(map.addBuilding(other)).toBe(false);
        expect(map.buildings.length).toBe(1);
    });

    test('can place building on top of floor', () => {
        const map = new Map(5, 5, 32, { getSprite: jest.fn() });
        const floor = new Building(BUILDING_TYPES.FLOOR, 1, 1, 1, 1, 'wood', 100);
        const wall = new Building(BUILDING_TYPES.WALL, 1, 1, 1, 1, 'stone', 0);
        expect(map.addBuilding(floor)).toBe(true);
        expect(map.addBuilding(wall)).toBe(true);
        expect(map.buildings.length).toBe(2);
    });

    test('cannot place floor on non-furniture building', () => {
        const map = new Map(5, 5, 32, { getSprite: jest.fn() });
        const wall = new Building(BUILDING_TYPES.WALL, 0, 0, 1, 1, 'stone', 0);
        const floor = new Building(BUILDING_TYPES.FLOOR, 0, 0, 1, 1, 'wood', 100);
        expect(map.addBuilding(wall)).toBe(true);
        expect(map.addBuilding(floor)).toBe(false);
        expect(map.buildings.length).toBe(1);
    });

    test('can place floor under furniture', () => {
        const map = new Map(5, 5, 32, { getSprite: jest.fn() });
        const bed = new Furniture(BUILDING_TYPES.BED, 2, 2, 1, 1, 'wood', 0);
        const floor = new Building(BUILDING_TYPES.FLOOR, 2, 2, 1, 1, 'wood', 100);
        expect(map.addBuilding(bed)).toBe(true);
        expect(map.addBuilding(floor)).toBe(true);
        expect(map.buildings.length).toBe(2);
    });
});
