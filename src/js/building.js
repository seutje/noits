import ResourcePile from './resourcePile.js';
import { RESOURCE_TYPES, BUILDING_TYPE_PROPERTIES, BUILDING_TYPES } from './constants.js';

export default class Building {
    constructor(
        type,
        x,
        y,
        width,
        height,
        material,
        buildProgress,
        resourcesRequired = 1,
        constructionMaterials = null,
    ) {
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
        this.constructionMaterials =
            constructionMaterials || { [material]: resourcesRequired };
        this.resourcesRequired = Object.values(this.constructionMaterials).reduce(
            (a, b) => a + b,
            0,
        );
        this.resourcesDelivered = 0;

        // Inventory to hold delivered materials
        this.inventory = {};

        // Settler currently using this building (e.g., crafting station)
        this.occupant = null;

        // Sprite manager assigned by the map
        this.spriteManager = null;

        // Pattern cache for floor texture
        this.floorPattern = null;
    }

    updateResourcesDelivered() {
        let total = 0;
        for (const mat in this.constructionMaterials) {
            const delivered = Math.min(
                this.inventory[mat] || 0,
                this.constructionMaterials[mat],
            );
            total += delivered;
        }
        this.resourcesDelivered = total;
    }

    addToInventory(type, quantity) {
        if (!this.inventory[type]) {
            this.inventory[type] = 0;
        }
        this.inventory[type] += quantity;
        this.updateResourcesDelivered();
    }

    removeFromInventory(type, quantity) {
        if (this.inventory[type] && this.inventory[type] >= quantity) {
            this.inventory[type] -= quantity;
            this.updateResourcesDelivered();
            return true;
        }
        return false;
    }

    hasAllMaterials() {
        for (const mat in this.constructionMaterials) {
            if ((this.inventory[mat] || 0) < this.constructionMaterials[mat]) {
                return false;
            }
        }
        return true;
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
            const constructionSprite = this.spriteManager?.getSprite('construction');
            if (constructionSprite) {
                ctx.save();
                ctx.globalAlpha = this.buildProgress / 100;
                ctx.drawImage(constructionSprite, x, y, width, height);
                ctx.restore();
            } else {
                ctx.fillStyle = `rgba(169, 169, 169, ${this.buildProgress / 100})`;
                ctx.fillRect(x, y, width, height);
            }
            ctx.strokeStyle = 'black';
            ctx.strokeRect(x, y, width, height);
            return;
        }

        if (this.type === BUILDING_TYPES.FLOOR && this.spriteManager) {
            const floorSprite = this.spriteManager.getSprite(BUILDING_TYPES.FLOOR);
            if (!this.floorPattern && floorSprite) {
                this.floorPattern = ctx.createPattern(floorSprite, 'repeat');
            }
            ctx.fillStyle = this.floorPattern || (this.material === RESOURCE_TYPES.WOOD ? '#8b4513' : '#808080');
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
            constructionMaterials: this.constructionMaterials,
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
        this.constructionMaterials = data.constructionMaterials || {
            [this.material]: data.resourcesRequired ?? 1,
        };
        this.resourcesRequired = Object.values(this.constructionMaterials).reduce(
            (a, b) => a + b,
            0,
        );
        this.resourcesDelivered = data.resourcesDelivered ?? 0;
        this.maxHealth = data.maxHealth;
        this.health = data.health;
        this.inventory = data.inventory || {};
        this.passable = data.passable ?? BUILDING_TYPE_PROPERTIES[this.type]?.passable ?? true;
        this.updateResourcesDelivered();
    }
}