import CraftingStation from './craftingStation.js';
import Recipe from './recipe.js';
import { RESOURCE_TYPES, BUILDING_TYPES, BUILDING_TYPE_PROPERTIES } from './constants.js';

export default class Well extends CraftingStation {
    constructor(x, y, spriteManager = null) {
        super(x, y, spriteManager);
        this.type = BUILDING_TYPES.WELL;
        this.material = RESOURCE_TYPES.STONE;
        this.resourcesRequired = 1;
        this.spriteManager = spriteManager;
        this.stationSprite = spriteManager ? spriteManager.getSprite(BUILDING_TYPES.WELL) : null;
        this.passable = BUILDING_TYPE_PROPERTIES[this.type]?.passable ?? true;
        this.recipes = [];
        this.autoCraft = false;
        this.desiredRecipe = null;

        this.addRecipe(
            new Recipe(
                'water',
                [{ resourceType: RESOURCE_TYPES.BUCKET, quantity: 1 }],
                [
                    {
                        resourceType: RESOURCE_TYPES.WATER,
                        quantity: 1,
                        quality: 1,
                    },
                ],
                1,
            ),
        );
    }
}
