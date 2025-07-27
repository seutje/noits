import Resource from '../src/js/resource.js';
import { RESOURCE_CATEGORIES } from '../src/js/constants.js';

describe('Resource', () => {
    test('should create a resource with correct properties and default quality', () => {
        const wood = new Resource('wood', 100);
        expect(wood.type).toBe('wood');
        expect(wood.quantity).toBe(100);
        expect(wood.quality).toBe(1);
        expect(wood.categories).toEqual(RESOURCE_CATEGORIES.wood);
    });

    test('should create a resource with specified quality', () => {
        const stone = new Resource('stone', 50, 0.5);
        expect(stone.type).toBe('stone');
        expect(stone.quantity).toBe(50);
        expect(stone.quality).toBe(0.5);
        expect(stone.categories).toEqual(RESOURCE_CATEGORIES.stone);
    });

    test('should add quantity correctly', () => {
        const stone = new Resource('stone', 50);
        stone.add(25);
        expect(stone.quantity).toBe(75);
    });

    test('should remove quantity correctly', () => {
        const food = new Resource('food', 200);
        food.remove(50);
        expect(food.quantity).toBe(150);
    });

    test('should not remove more quantity than available', () => {
        const water = new Resource('water', 30);
        const result = water.remove(40);
        expect(water.quantity).toBe(30);
        expect(result).toBe(false);
    });

    test('should allow overriding categories', () => {
        const custom = new Resource('custom', 5, 1, ['material', 'food']);
        expect(custom.categories).toContain('material');
        expect(custom.categories).toContain('food');
    });
});