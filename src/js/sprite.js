
export default class Sprite {
    constructor(image, x, y, width, height) {
        this.image = image;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    render(ctx, screenX, screenY) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height, screenX, screenY, this.width, this.height);
    }
}
