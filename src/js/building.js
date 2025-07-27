import ResourcePile from './resourcePile.js';
import { RESOURCE_TYPES } from './constants.js';

export default class Building {
    constructor(type, x, y, width, height, material, buildProgress, resourcesRequired = 1) {
        this.type = type; // e.g., "wall", "floor", "house"
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.material = material;
        this.buildProgress = buildProgress; // 0-100, 100 means built
        this.maxHealth = 100; // Max health for destruction
        this.health = this.maxHealth; // Current health

        // New properties for resource delivery
        this.resourcesRequired = resourcesRequired;
        this.resourcesDelivered = 0;

        // Inventory to hold delivered materials
        this.inventory = {};
    }

    addToInventory(type, quantity) {
        if (!this.inventory[type]) {
            this.inventory[type] = 0;
        }
        this.inventory[type] += quantity;
        if (type === this.material) {
            this.resourcesDelivered = this.inventory[type];
        }
    }

    removeFromInventory(type, quantity) {
        if (this.inventory[type] && this.inventory[type] >= quantity) {
            this.inventory[type] -= quantity;
            if (type === this.material) {
                this.resourcesDelivered = this.inventory[type];
            }
            return true;
        }
        return false;
    }

    getResourceQuantity(type) {
        return this.inventory[type] || 0;
    }

    spillInventory(map) {
        for (const type in this.inventory) {
            const quantity = this.inventory[type];
            if (quantity > 0) {
                const pile = new ResourcePile(type, quantity, this.x, this.y, map.tileSize, map.spriteManager);
                map.addResourcePile(pile);
            }
        }
        this.inventory = {};
        this.resourcesDelivered = 0;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }

    render(ctx, tileSize) {
        if (this.buildProgress < 100) {
            ctx.fillStyle = `rgba(169, 169, 169, ${this.buildProgress / 100})`; // Grey, transparent based on progress
        } else {
            // Render based on health
            const healthOpacity = this.health / this.maxHealth;
            ctx.fillStyle = this.material === RESOURCE_TYPES.WOOD ? `rgba(139, 69, 19, ${healthOpacity})` : `rgba(128, 128, 128, ${healthOpacity})`;
        }
        ctx.fillRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
    }

    serialize() {
        return {
            type: this.type,
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            material: this.material,
            buildProgress: this.buildProgress,
            resourcesRequired: this.resourcesRequired,
            resourcesDelivered: this.resourcesDelivered,
            maxHealth: this.maxHealth,
            health: this.health,
            inventory: this.inventory
        };
    }

    deserialize(data) {
        this.type = data.type;
        this.x = data.x;
        this.y = data.y;
        this.width = data.width;
        this.height = data.height;
        this.material = data.material;
        this.buildProgress = data.buildProgress;
        this.resourcesRequired = data.resourcesRequired ?? 10;
        this.resourcesDelivered = data.resourcesDelivered ?? 0;
        this.maxHealth = data.maxHealth;
        this.health = data.health;
        this.inventory = data.inventory || {};
    }
}