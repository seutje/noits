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

    test('remove should notify map when empty', () => {
        const mockMap = { removeResourcePile: jest.fn() };
        const pile = new ResourcePile('wood', 5, 0, 0, 32, {});
        pile.map = mockMap;
        const result = pile.remove(5);
        expect(result).toBe(true);
        expect(pile.quantity).toBe(0);
        expect(mockMap.removeResourcePile).toHaveBeenCalledWith(pile);
    });
});
