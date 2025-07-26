import Building from '../src/js/building.js';

describe('Building', () => {
    test('takeDamage reduces health and does not go below zero', () => {
        const building = new Building('barricade', 0, 0, 1, 1, 'wood', 100);
        building.takeDamage(30);
        expect(building.health).toBe(70);
        building.takeDamage(100);
        expect(building.health).toBe(0);
    });
});
