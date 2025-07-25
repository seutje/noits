export default class Building {
    constructor(type, x, y, width, height, material, health) {
        this.type = type; // e.g., "wall", "floor", "house"
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.material = material;
        this.health = health;
    }

    render(ctx, tileSize) {
        ctx.fillStyle = this.material === "wood" ? "brown" : "gray";
        ctx.fillRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.x * tileSize, this.y * tileSize, this.width * tileSize, this.height * tileSize);
    }
}