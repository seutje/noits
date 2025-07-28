import CraftingStation from '../src/js/craftingStation.js';
import Recipe from '../src/js/recipe.js';
import SpriteManager from '../src/js/spriteManager.js';
import { BUILDING_TYPES } from '../src/js/constants.js';


jest.mock('../src/js/recipe.js');

describe('CraftingStation', () => {
    let craftingStation;

    beforeEach(() => {
        craftingStation = new CraftingStation(0, 0, new SpriteManager());
    });

    test('should initialize with correct properties', () => {
        expect(craftingStation.type).toBe(BUILDING_TYPES.CRAFTING_STATION);
        expect(craftingStation.x).toBe(0);
        expect(craftingStation.y).toBe(0);
        expect(craftingStation.recipes).toEqual([expect.any(Recipe), expect.any(Recipe)]);
        expect(craftingStation.autoCraft).toBe(false);
        expect(craftingStation.desiredRecipe).toBe(null);
    });

    test('should add a recipe', () => {
        const newRecipe = new Recipe("test_recipe", [], [], 1);
        craftingStation.addRecipe(newRecipe);
        expect(craftingStation.recipes).toContain(newRecipe);
    });
});