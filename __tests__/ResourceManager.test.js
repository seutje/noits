import ResourceManager from '../src/js/resourceManager.js';
import Resource from '../src/js/resource.js';

describe('ResourceManager', () => {
    let resourceManager;

    beforeEach(() => {
        resourceManager = new ResourceManager();
    });

    test('should add a new resource with specified quality', () => {
        resourceManager.addResource('iron', 10, 0.8);
        const ironResource = resourceManager.getAllResources().iron;
        expect(ironResource.quantity).toBe(10);
        expect(ironResource.quality).toBe(0.8);
    });

    test('should add quantity to an existing resource and maintain quality', () => {
        resourceManager.addResource('wood', 100, 0.9);
        resourceManager.addResource('wood', 50, 0.7); // Adding more wood, quality should average or be handled as per logic
        const woodResource = resourceManager.getAllResources().wood;
        expect(woodResource.quantity).toBe(150);
        // For now, we assume quality is not averaged on add, but rather the initial quality is kept.
        // This might need adjustment based on game design.
        expect(woodResource.quality).toBe(0.9);
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