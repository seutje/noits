import { findPath } from '../src/js/pathfinding.js';
import { BUILDING_TYPES } from '../src/js/constants.js';

class MockMap {
    constructor(tiles, buildings = []) {
        this.tiles = tiles;
        this.buildings = buildings;
        this.width = tiles[0].length;
        this.height = tiles.length;
    }
    getTile(x, y) {
        return this.tiles[y][x];
    }
    getBuildingAt(x, y) {
        return this.buildings.find(b => b.x === x && b.y === y) || null;
    }
}

describe('findPath with water start', () => {
    test('allows exiting water but not entering it', () => {
        const tiles = [
            [0, 0, 0],
            [0, 8, 0],
            [0, 0, 0],
        ];
        const map = new MockMap(tiles);
        // Start in water and move to dry land
        const path1 = findPath({ x: 1, y: 1 }, { x: 0, y: 1 }, map);
        expect(path1).toEqual([{ x: 0, y: 1 }]);
        // Moving from land into water should fail
        const path2 = findPath({ x: 0, y: 1 }, { x: 1, y: 1 }, map);
        expect(path2).toBeNull();
    });
});

describe('findPath with buildings', () => {
    test('walls block movement', () => {
        const tiles = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];
        const buildings = [{ x: 1, y: 1, type: BUILDING_TYPES.WALL }];
        const map = new MockMap(tiles, buildings);
        const path = findPath({ x: 0, y: 1 }, { x: 2, y: 1 }, map);
        expect(path).not.toBeNull();
        expect(path.some(p => p.x === 1 && p.y === 1)).toBe(false);
    });
});
