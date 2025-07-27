import { findPath } from '../src/js/pathfinding.js';

class MockMap {
    constructor(tiles) {
        this.tiles = tiles;
        this.width = tiles[0].length;
        this.height = tiles.length;
    }
    getTile(x, y) {
        return this.tiles[y][x];
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
