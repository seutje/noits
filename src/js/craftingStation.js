import Building from './building.js';
import Recipe from './recipe.js';
import { RESOURCE_TYPES } from './constants.js';

export default class CraftingStation extends Building {
    constructor(x, y) {
        super("crafting_station", x, y, 1, 1, RESOURCE_TYPES.WOOD, 0);
        this.recipes = []; // List of recipes this station can craft

        // Add example recipes
        this.addRecipe(new Recipe("plank_from_wood", [{ resourceType: RESOURCE_TYPES.WOOD, quantity: 1 }], [{ resourceType: RESOURCE_TYPES.PLANK, quantity: 1, quality: 1 }], 5));
        this.addRecipe(new Recipe("block_from_stone", [{ resourceType: RESOURCE_TYPES.STONE, quantity: 1 }], [{ resourceType: RESOURCE_TYPES.BLOCK, quantity: 1, quality: 1 }], 7));
    }

    addRecipe(recipe) {
        this.recipes.push(recipe);
    }

    // Crafting logic will be implemented later
    craft(recipeName, resourceManager) {
        // Placeholder for crafting logic
        console.log(`Crafting ${recipeName} at ${this.type} station.`);
    }

    render(ctx, tileSize) {
        super.render(ctx, tileSize);
        ctx.fillStyle = "purple"; // Example color for crafting station
        ctx.fillRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
    }
}