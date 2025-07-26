import Armor from '../src/js/armor.js';

describe('Armor', () => {
    test('should initialize with correct properties', () => {
        const helmet = new Armor('Helmet', 'light', 2, 'head');
        expect(helmet.name).toBe('Helmet');
        expect(helmet.type).toBe('light');
        expect(helmet.defense).toBe(2);
        expect(helmet.bodyPart).toBe('head');
    });
});
