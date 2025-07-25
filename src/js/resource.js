
export default class Resource {
    constructor(type, quantity, quality = 1) {
        this.type = type; // e.g., "wood", "stone", "food"
        this.quantity = quantity;
        this.quality = quality; // 1-100 scale, affects efficiency/value
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
}
