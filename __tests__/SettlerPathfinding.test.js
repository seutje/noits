import Settler from '../src/js/settler.js';
import Task from '../src/js/task.js';
import { findPath } from '../src/js/pathfinding.js';

jest.mock('../src/js/pathfinding.js', () => ({
    findPath: jest.fn((start, end) => {
        const path = [];
        let x = start.x;
        while (x !== end.x) {
            x += end.x > x ? 1 : -1;
            path.push({ x, y: start.y });
        }
        return path;
    })
}));

describe('Settler pathfinding frequency', () => {
    test('findPath called once per tile moved', () => {
        const mockResourceManager = { addResource: jest.fn(), removeResource: jest.fn(), getResourceQuantity: jest.fn() };
        const mockMap = { getTile: jest.fn(() => 0), width: 10, height: 10, resourcePiles: [], addResourcePile: jest.fn(), tileSize: 1, buildings: [] };
        const mockRoomManager = { getRoomAt: jest.fn(), addResourceToStorage: jest.fn(), findStorageRoomAndTile: jest.fn(), rooms: [] };
        const defaultSkills = {
            farming: 1,
            mining: 1,
            building: 1,
            crafting: 1,
            cooking: 1,
            combat: 1,
            medical: 1,
        };
        const settler = new Settler(
            'Test',
            0,
            0,
            mockResourceManager,
            mockMap,
            mockRoomManager,
            undefined,
            undefined,
            defaultSkills,
        );
        const task = new Task('move', 2, 0);
        settler.currentTask = task;

        for (let i = 0; i < 5; i++) {
            settler.updateNeeds(1000);
        }

        expect(findPath).toHaveBeenCalledTimes(2);
        expect(settler.x).toBe(2);
        expect(settler.y).toBe(0);
    });
});
