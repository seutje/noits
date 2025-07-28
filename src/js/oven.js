import CraftingStation from './craftingStation.js';
import Recipe from './recipe.js';
import { RESOURCE_TYPES, BUILDING_TYPES, BUILDING_TYPE_PROPERTIES } from './constants.js';

export default class Oven extends CraftingStation {
    constructor(x, y, spriteManager = null) {
        super(x, y, spriteManager);
        this.type = BUILDING_TYPES.OVEN;
        this.material = RESOURCE_TYPES.STONE;
        this.resourcesRequired = 1;
        this.passable = BUILDING_TYPE_PROPERTIES[this.type]?.passable ?? true;
        this.stationSprite = spriteManager ? spriteManager.getSprite(BUILDING_TYPES.OVEN) : null;
        this.recipes = [];
        this.autoCraft = false;
        this.desiredRecipe = null;
        this.addRecipe(
            new Recipe(
                'bread',
                [{ resourceType: RESOURCE_TYPES.WHEAT, quantity: 1 }],
                [
                    {
                        resourceType: RESOURCE_TYPES.BREAD,
                        quantity: 1,
                        quality: 1,
                    },
                ],
                3,
            ),
        );
    }
}
