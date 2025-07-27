import Enemy from '../src/js/enemy.js';
import Settler from '../src/js/settler.js';
import Armor from '../src/js/armor.js';

describe('Enemy', () => {
    let mockResourceManager;
    let mockMap;
    let mockRoomManager;

    beforeEach(() => {
        mockResourceManager = {
            addResource: jest.fn(),
            removeResource: jest.fn(),
            getResourceQuantity: jest.fn().mockReturnValue(0)
        };
        mockMap = { removeResourceNode: jest.fn() };
        mockRoomManager = { rooms: [], getRoomAt: jest.fn(), addResourceToStorage: jest.fn() };
    });

    test('dealDamage considers target armor', () => {
        const target = new Settler('Target', 0, 0, mockResourceManager, mockMap, mockRoomManager);
        const helmet = new Armor('Helmet', 'light', 2, 'head');
        target.equipArmor(helmet);
        jest.spyOn(target, 'takeDamage');

        const enemy = new Enemy('Raider', 0, 0, target, mockMap);
        const originalRandom = Math.random;
        Math.random = () => 0; // Hit head
        enemy.dealDamage(target);
        Math.random = originalRandom;

        expect(target.takeDamage).toHaveBeenCalledWith('head', 8, true, enemy);
    });

    test('update attacks target when in range', () => {
        const target = new Settler('Target', 0, 0, mockResourceManager, mockMap, mockRoomManager);
        const enemy = new Enemy('Raider', 0, 0, target, mockMap);
        enemy.attackCooldown = 0;
        jest.spyOn(enemy, 'dealDamage').mockImplementation(() => {});

        enemy.update(1000, [target]);
        expect(enemy.dealDamage).toHaveBeenCalledWith(target);
    });
});
