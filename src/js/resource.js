
import { RESOURCE_CATEGORIES, FOOD_HUNGER_VALUES } from './constants.js';

export default class Resource {
    constructor(type, quantity, quality = 1, categories = null, hungerRestoration = null) {
        this.type = type; // e.g., "wood", "stone", "food"
        this.quantity = quantity;
        this.quality = quality; // 1-100 scale, affects efficiency/value
        // Use provided categories or fall back to defaults for the resource type
        this.categories = categories ?? (RESOURCE_CATEGORIES[type] || []);
        // Amount of hunger restored when consumed (only for food resources)
        this.hungerRestoration = hungerRestoration ?? FOOD_HUNGER_VALUES[type] ?? 0;
    }

    add(amount) {
        this.quantity += amount;
    }

    remove(amount) {
        if (this.quantity >= amount) {
            this.quantity -= amount;
            return true;
        }
        return false;
    }

    serialize() {
        return {
            type: this.type,
            quantity: this.quantity,
            quality: this.quality,
            categories: this.categories,
            hungerRestoration: this.hungerRestoration
        };
    }

    deserialize(data) {
        this.type = data.type;
        this.quantity = data.quantity;
        this.quality = data.quality;
        this.categories = data.categories ?? (RESOURCE_CATEGORIES[this.type] || []);
        this.hungerRestoration = data.hungerRestoration ?? FOOD_HUNGER_VALUES[this.type] ?? 0;
    }
}