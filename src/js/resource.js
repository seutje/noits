
import { RESOURCE_CATEGORIES } from './constants.js';

export default class Resource {
    constructor(type, quantity, quality = 1, categories = null) {
        this.type = type; // e.g., "wood", "stone", "food"
        this.quantity = quantity;
        this.quality = quality; // 1-100 scale, affects efficiency/value
        // Use provided categories or fall back to defaults for the resource type
        this.categories = categories ?? (RESOURCE_CATEGORIES[type] || []);
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
            categories: this.categories
        };
    }

    deserialize(data) {
        this.type = data.type;
        this.quantity = data.quantity;
        this.quality = data.quality;
        this.categories = data.categories ?? (RESOURCE_CATEGORIES[this.type] || []);
    }
}