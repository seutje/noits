import Map from '../src/js/map.js';
import ResourcePile from '../src/js/resourcePile.js';

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
});
