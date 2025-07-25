import ResourceManager from '../src/js/resourceManager.js';
import Resource from '../src/js/resource.js';

describe('ResourceManager', () => {
    let resourceManager;

    beforeEach(() => {
        resourceManager = new ResourceManager();
    });

    test('should add a new resource', () => {
        resourceManager.addResource('wood', 100);
        expect(resourceManager.getResourceQuantity('wood')).toBe(100);
    });

    test('should add quantity to an existing resource', () => {
        resourceManager.addResource('wood', 100);
        resourceManager.addResource('wood', 50);
        expect(resourceManager.getResourceQuantity('wood')).toBe(150);
    });

    test('should remove quantity from an existing resource', () => {
        resourceManager.addResource('stone', 200);
        const result = resourceManager.removeResource('stone', 50);
        expect(resourceManager.getResourceQuantity('stone')).toBe(150);
        expect(result).toBe(true);
    });

    test('should not remove more quantity than available', () => {
        resourceManager.addResource('food', 30);
        const result = resourceManager.removeResource('food', 40);
        expect(resourceManager.getResourceQuantity('food')).toBe(30);
        expect(result).toBe(false);
    });

    test('should return 0 for non-existent resource', () => {
        expect(resourceManager.getResourceQuantity('gold')).toBe(0);
    });

    test('should get all resources', () => {
        resourceManager.addResource('wood', 100);
        resourceManager.addResource('stone', 50);
        const allResources = resourceManager.getAllResources();
        expect(Object.keys(allResources).length).toBe(2);
        expect(allResources.wood.quantity).toBe(100);
        expect(allResources.stone.quantity).toBe(50);
    });
});