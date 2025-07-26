import ResourcePile from '../src/js/resourcePile.js';

describe('ResourcePile', () => {
    test('should cap quantity at 999 when adding', () => {
        const pile = new ResourcePile('wood', 990, 0, 0, 32, {});
        pile.add(20);
        expect(pile.quantity).toBe(999);
    });

    test('constructor should not exceed max quantity', () => {
        const pile = new ResourcePile('stone', 1200, 0, 0, 32, {});
        expect(pile.quantity).toBe(999);
    });
});
