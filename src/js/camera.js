
export default class Camera {
    constructor(ctx) {
        this.ctx = ctx;
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
    }

    applyTransform() {
        this.ctx.save();
        this.ctx.translate(this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.x, -this.y);
    }

    resetTransform() {
        this.ctx.restore();
    }
}
