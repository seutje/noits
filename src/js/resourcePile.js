
import Resource from './resource.js';
import { RESOURCE_TYPES } from './constants.js';

export default class ResourcePile extends Resource {
    static MAX_QUANTITY = 999;

    constructor(type, quantity, x, y, tileSize, spriteManager, quality = 1) {
        super(type, Math.min(quantity, ResourcePile.MAX_QUANTITY), quality);
        this.x = x;
        this.y = y;
        this.tileSize = tileSize;
        this.spriteManager = spriteManager;
        this.map = null;
    }

    add(amount) {
        this.quantity = Math.min(this.quantity + amount, ResourcePile.MAX_QUANTITY);
    }

    remove(amount) {
        const success = super.remove(amount);
        if (success && this.quantity <= 0 && this.map) {
            this.map.removeResourcePile(this);
        }
        return success;
    }

    render(ctx) {
        const woodSprite = this.spriteManager.getSprite(RESOURCE_TYPES.WOOD);
        const stonePileSprite = this.spriteManager.getSprite('stone_pile');
        const berriesSprite = this.spriteManager.getSprite(RESOURCE_TYPES.BERRIES);
        const meatSprite = this.spriteManager.getSprite(RESOURCE_TYPES.MEAT);
        const mushroomsSprite = this.spriteManager.getSprite(RESOURCE_TYPES.MUSHROOMS);
        const bandageSprite = this.spriteManager.getSprite(RESOURCE_TYPES.BANDAGE);
        const breadSprite = this.spriteManager.getSprite(RESOURCE_TYPES.BREAD);
        const dirtPileSprite = this.spriteManager.getSprite('dirt_pile');
        const wheatPileSprite = this.spriteManager.getSprite('wheat_pile');
        const cottonPileSprite = this.spriteManager.getSprite('cotton_pile');
        const ironOrePileSprite = this.spriteManager.getSprite('iron_ore_pile');
        const plankSprite = this.spriteManager.getSprite(RESOURCE_TYPES.PLANK);
        const bucketSprite = this.spriteManager.getSprite(RESOURCE_TYPES.BUCKET);
        if (this.type === RESOURCE_TYPES.WOOD && woodSprite) {
            ctx.drawImage(woodSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === RESOURCE_TYPES.STONE && stonePileSprite) {
            ctx.drawImage(stonePileSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === RESOURCE_TYPES.BERRIES && berriesSprite) {
            ctx.drawImage(berriesSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === RESOURCE_TYPES.MEAT && meatSprite) {
            ctx.drawImage(meatSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === RESOURCE_TYPES.MUSHROOMS && mushroomsSprite) {
            ctx.drawImage(mushroomsSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === RESOURCE_TYPES.BANDAGE && bandageSprite) {
            ctx.drawImage(bandageSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === RESOURCE_TYPES.BREAD && breadSprite) {
            ctx.drawImage(breadSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === RESOURCE_TYPES.DIRT && dirtPileSprite) {
            ctx.drawImage(dirtPileSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === RESOURCE_TYPES.WHEAT && wheatPileSprite) {
            ctx.drawImage(wheatPileSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === RESOURCE_TYPES.COTTON && cottonPileSprite) {
            ctx.drawImage(cottonPileSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === RESOURCE_TYPES.IRON_ORE && ironOrePileSprite) {
            ctx.drawImage(ironOrePileSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === RESOURCE_TYPES.PLANK && plankSprite) {
            ctx.drawImage(plankSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        } else if (this.type === RESOURCE_TYPES.BUCKET && bucketSprite) {
            ctx.drawImage(bucketSprite, this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        }
        else {
            ctx.fillStyle = 'brown'; // Placeholder color for wood piles
            ctx.fillRect(this.x * this.tileSize, this.y * this.tileSize, this.tileSize, this.tileSize);
        }
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(this.quantity, this.x * this.tileSize + 5, this.y * this.tileSize + this.tileSize / 2);
    }

    serialize() {
        return {
            ...super.serialize(),
            x: this.x,
            y: this.y,
            tileSize: this.tileSize
        };
    }

    deserialize(data) {
        super.deserialize(data);
        this.quantity = Math.min(this.quantity, ResourcePile.MAX_QUANTITY);
        this.x = data.x;
        this.y = data.y;
        this.tileSize = data.tileSize;
    }
}
