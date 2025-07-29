import Deer from '../src/js/deer.js';

// Minimal map stub
const mapStub = {
    width: 10,
    height: 10,
    getTile: jest.fn().mockReturnValue(0),
    removeResourceNode: jest.fn(),
};

describe('Deer', () => {
    test('initialises with weak damage and no target', () => {
        const deer = new Deer(0, 0, mapStub, null);
        expect(deer.damage).toBe(2);
        expect(deer.targetSettler).toBe(null);
    });

    test('roaming does not assign target', () => {
        const deer = new Deer(0, 0, mapStub, null);
        deer.update(1000, []);
        expect(deer.targetSettler).toBe(null);
    });
});
