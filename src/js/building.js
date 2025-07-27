import ResourcePile from './resourcePile.js';
import { RESOURCE_TYPES, BUILDING_TYPE_PROPERTIES } from './constants.js';

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
        this.passable = BUILDING_TYPE_PROPERTIES[this.type]?.passable ?? true;

        // New properties for resource delivery
        this.resourcesRequired = resourcesRequired;
        this.resourcesDelivered = 0;

        // Inventory to hold delivered materials
        this.inventory = {};

        // Settler currently using this building (e.g., crafting station)
        this.occupant = null;
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
        const x = this.x * tileSize;
        const y = this.y * tileSize;
        const width = this.width * tileSize;
        const height = this.height * tileSize;

        if (this.buildProgress < 100) {
            ctx.fillStyle = `rgba(169, 169, 169, ${this.buildProgress / 100})`;
            ctx.fillRect(x, y, width, height);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(x, y, width, height);
            return;
        }

        if (this.drawBase !== false) {
            const inset = tileSize * 0.1;
            const healthOpacity = this.health / this.maxHealth;
            ctx.fillStyle = this.material === RESOURCE_TYPES.WOOD ?
                `rgba(139, 69, 19, ${healthOpacity})` :
                `rgba(128, 128, 128, ${healthOpacity})`;
            ctx.fillRect(x + inset, y + inset, width - inset * 2, height - inset * 2);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(x + inset, y + inset, width - inset * 2, height - inset * 2);
        }
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
            inventory: this.inventory,
            passable: this.passable
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
        this.passable = data.passable ?? BUILDING_TYPE_PROPERTIES[this.type]?.passable ?? true;
    }
}