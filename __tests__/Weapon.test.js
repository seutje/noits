import Weapon from '../src/js/weapon.js';

describe('Weapon', () => {
    test('should initialize with correct properties', () => {
        const sword = new Weapon('Sword', 'melee', 10, 1.2);
        expect(sword.name).toBe('Sword');
        expect(sword.type).toBe('melee');
        expect(sword.damage).toBe(10);
        expect(sword.attackSpeed).toBe(1.2);
    });
});
