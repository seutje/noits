import Building from '../src/js/building.js';
import { BUILDING_TYPES } from '../src/js/constants.js';

import Map from '../src/js/map.js';

describe('Building', () => {
    test('takeDamage reduces health and does not go below zero', () => {
        const building = new Building(BUILDING_TYPES.BARRICADE, 0, 0, 1, 1, 'wood', 100);
        building.takeDamage(30);
        expect(building.health).toBe(70);
        building.takeDamage(100);
        expect(building.health).toBe(0);
    });

    test('spillInventory drops resources as piles', () => {
        const map = new Map(10, 10, 32, { getSprite: jest.fn() });
        const building = new Building(BUILDING_TYPES.WALL, 1, 1, 1, 1, 'wood', 0, 5);
        building.addToInventory('wood', 5);
        map.addBuilding(building);

        building.spillInventory(map);

        expect(map.resourcePiles.length).toBe(1);
        const pile = map.resourcePiles[0];
        expect(pile.type).toBe('wood');
        expect(pile.quantity).toBe(5);
        expect(building.getResourceQuantity('wood')).toBe(0);
    });
});
