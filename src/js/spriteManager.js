import Sprite from './sprite.js';

export default class SpriteManager {
    constructor() {
        this.sprites = {};
    }

    loadImage(name, src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.sprites[name] = img;
                resolve(img);
            };
            img.onerror = reject;
            img.src = src;
        });
    }

    getSprite(name) {
        return this.sprites[name];
    }
}