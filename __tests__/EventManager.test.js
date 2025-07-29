import EventManager from '../src/js/eventManager.js';
import Deer from '../src/js/deer.js';

// Simple Enemy stub
class EnemyStub {
    constructor(name, x, y, target) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.target = target;
    }
}

describe('EventManager', () => {
    let game;
    beforeEach(() => {
        game = {
            settlers: [{ name: 'Alice', x: 1, y: 1, takeDamage: jest.fn() }],
            enemies: [],
            map: { buildings: [], addResourcePile: jest.fn(), tileSize: 1 },
            resourceManager: { addResource: jest.fn() },
            notificationManager: { addNotification: jest.fn() }
        };
    });

    test('update triggers random event when interval reached', () => {
        const manager = new EventManager(game, EnemyStub);
        jest.spyOn(manager, 'triggerRandomEvent').mockImplementation(() => {});
        manager.update(1201000); // exceed eventInterval of 1200s
        expect(manager.triggerRandomEvent).toHaveBeenCalled();
    });

    test('Wild Animal Attack spawns enemy and adds notification', () => {
        const manager = new EventManager(game, EnemyStub);
        jest.spyOn(Math, 'random').mockReturnValue(0); // always pick first options
        manager.triggerRandomEvent();
        Math.random.mockRestore();
        expect(game.enemies.length).toBe(1);
        expect(game.enemies[0]).toBeInstanceOf(EnemyStub);
        expect(game.notificationManager.addNotification).toHaveBeenCalledWith(
            'A wild animal is attacking your colony!',
            'warning'
        );
    });

    test('Resource Discovery creates pile and adds notification', () => {
        const manager = new EventManager(game, EnemyStub);
        jest.spyOn(Math, 'random')
            .mockReturnValueOnce(0.3) // pick Resource Discovery event
            .mockReturnValueOnce(0)    // pick resource index 0 -> wood
            .mockReturnValueOnce(0);    // quantity -> 20
        manager.triggerRandomEvent();
        Math.random.mockRestore();
        expect(game.map.addResourcePile).toHaveBeenCalled();
        const createdPile = game.map.addResourcePile.mock.calls[0][0];
        expect(createdPile.type).toBe('wood');
        expect(createdPile.quantity).toBe(20);
        expect(createdPile.x).toBe(0);
        expect(createdPile.y).toBe(0);
        expect(game.notificationManager.addNotification).toHaveBeenCalledWith(
            'You discovered a new resource node!',
            'info'
        );
    });

    test('Wild Deer event spawns deer', () => {
        const manager = new EventManager(game, EnemyStub);
        jest.spyOn(Math, 'random').mockReturnValue(0.99); // pick last event
        manager.triggerRandomEvent();
        Math.random.mockRestore();
        expect(game.enemies[0]).toBeInstanceOf(Deer);
        expect(game.notificationManager.addNotification).toHaveBeenCalledWith(
            'A wild deer has appeared!',
            'info'
        );
    });
});
