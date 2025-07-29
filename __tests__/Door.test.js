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

describe('door passability', () => {
    test('settlers can pass through doors', () => {
        const tiles = [[0,0,0]];
        const buildings = [{ x: 1, y: 0, type: BUILDING_TYPES.DOOR }];
        const map = new MockMap(tiles, buildings);
        const path = findPath({ x: 0, y: 0 }, { x: 2, y: 0 }, map);
        expect(path).toEqual([
            { x: 1, y: 0 },
            { x: 2, y: 0 }
        ]);
    });

    test('enemies cannot pass through doors', () => {
        const tiles = [[0,0,0]];
        const buildings = [{ x: 1, y: 0, type: BUILDING_TYPES.DOOR }];
        const map = new MockMap(tiles, buildings);
        const path = findPath({ x: 0, y: 0 }, { x: 2, y: 0 }, map, true);
        expect(path).toBeNull();
    });
});
