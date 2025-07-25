export default class Building {
    constructor(type, x, y, width, height, material, buildProgress) {
        this.type = type; // e.g., "wall", "floor", "house"
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.material = material;
        this.buildProgress = buildProgress; // 0-100, 100 means built
        this.health = 100; // Once built, this is the health for destruction
    }

    render(ctx, tileSize) {
        if (this.buildProgress < 100) {
            ctx.fillStyle = `rgba(169, 169, 169, ${this.buildProgress / 100})`; // Grey, transparent based on progress
        } else {
            ctx.fillStyle = this.material === "wood" ? "brown" : "gray";
        }
        ctx.fillRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
    }
}