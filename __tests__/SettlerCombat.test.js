import Settler from '../src/js/settler.js';
import Weapon from '../src/js/weapon.js';
import Armor from '../src/js/armor.js';

describe('Settler Health and Combat', () => {
    let settler;
    let mockResourceManager;
    let mockMap;
    let mockRoomManager;

    beforeEach(() => {
        mockResourceManager = {
            addResource: jest.fn(),
            removeResource: jest.fn(),
            getResourceQuantity: jest.fn().mockReturnValue(0)
        };
        mockMap = { removeResourceNode: jest.fn(), worldMap: { discoverLocation: jest.fn() } };
        mockRoomManager = { rooms: [], getRoomAt: jest.fn(), addResourceToStorage: jest.fn() };
        settler = new Settler('TestSettler', 0, 0, mockResourceManager, mockMap, mockRoomManager);
    });

    test('takeDamage sets body part health and bleeding', () => {
        settler.takeDamage('head', 10, true);
        expect(settler.bodyParts.head.health).toBe(90);
        expect(settler.bodyParts.head.bleeding).toBe(true);
    });

    test('needsTreatment and stopBleeding work correctly', () => {
        settler.takeDamage('torso', 5, true);
        expect(settler.needsTreatment()).toBe(true);
        settler.stopBleeding();
        expect(settler.needsTreatment()).toBe(false);
        expect(settler.bodyParts.torso.bleeding).toBe(false);
    });

    test('equip and unequip weapon and armor', () => {
        const sword = new Weapon('Sword', 'melee', 10, 1);
        settler.equipWeapon(sword);
        expect(settler.equippedWeapon).toBe(sword);
        settler.unequipWeapon();
        expect(settler.equippedWeapon).toBe(null);

        const helmet = new Armor('Helmet', 'light', 1, 'head');
        settler.equipArmor(helmet);
        expect(settler.equippedArmor.head).toBe(helmet);
        settler.unequipArmor('head');
        expect(settler.equippedArmor.head).toBeUndefined();
    });

    test('dealDamage uses weapon, combat skill and target armor', () => {
        const attacker = new Settler('Attacker', 0, 0, mockResourceManager, mockMap, mockRoomManager);
        attacker.skills.combat = 2; // +1 damage
        const sword = new Weapon('Sword', 'melee', 10, 1);
        attacker.equipWeapon(sword);

        const defender = new Settler('Defender', 0, 0, mockResourceManager, mockMap, mockRoomManager);
        const helmet = new Armor('Helmet', 'light', 1, 'head');
        defender.equipArmor(helmet);

        const originalRandom = Math.random;
        Math.random = () => 0; // Always hit head
        attacker.dealDamage(defender);
        Math.random = originalRandom;

        expect(defender.bodyParts.head.health).toBe(90); // 10 +1 -1 = 10 damage
        expect(defender.bodyParts.head.bleeding).toBe(true);
    });
});
