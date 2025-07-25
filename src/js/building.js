export default class Building {
    constructor(type, x, y, width, height, material, buildProgress) {
        this.type = type; // e.g., "wall", "floor", "house"
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.material = material;
        this.buildProgress = buildProgress; // 0-100, 100 means built
        this.maxHealth = 100; // Max health for destruction
        this.health = this.maxHealth; // Current health
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
            ctx.fillStyle = this.material === "wood" ? `rgba(139, 69, 19, ${healthOpacity})` : `rgba(128, 128, 128, ${healthOpacity})`;
        }
        ctx.fillRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
    }
}