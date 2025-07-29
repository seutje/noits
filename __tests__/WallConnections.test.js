import Map from '../src/js/map.js';
import Wall from '../src/js/wall.js';
import { BUILDING_TYPES } from '../src/js/constants.js';

describe('Wall connections', () => {
    test('adjacent walls connect to each other', () => {
        const map = new Map(5, 5, 32, { getSprite: jest.fn() });
        const wall1 = new Wall(1, 1);
        const wall2 = new Wall(2, 1);
        map.addBuilding(wall1);
        map.addBuilding(wall2);
        expect(wall1.connections.e).toBe(true);
        expect(wall2.connections.w).toBe(true);
    });
});
