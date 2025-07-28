import Oven from '../src/js/oven.js';
import Recipe from '../src/js/recipe.js';
import SpriteManager from '../src/js/spriteManager.js';
import { BUILDING_TYPES } from '../src/js/constants.js';

jest.mock('../src/js/recipe.js');

describe('Oven', () => {
    let oven;

    beforeEach(() => {
        oven = new Oven(0, 0, new SpriteManager());
    });

    test('should initialize with bread recipe', () => {
        expect(oven.type).toBe(BUILDING_TYPES.OVEN);
        expect(oven.recipes).toEqual([expect.any(Recipe)]);
    });
});
