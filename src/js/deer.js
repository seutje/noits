import Enemy from './enemy.js';
import { ENEMY_RUN_SPEED, RESOURCE_TYPES } from './constants.js';

export default class Deer extends Enemy {
    constructor(x, y, map, spriteManager) {
        super('Deer', x, y, null, map, spriteManager, RESOURCE_TYPES.MEAT);
        this.damage = 2; // very weak attacks
        this.roamCooldown = 0;
    }

    update(deltaTime, settlers) {
        if (this.isDead) {
            super.update(deltaTime, settlers);
            return;
        }

        // Only aggressive if already has a target (e.g., attacked)
        if (this.targetSettler) {
            super.update(deltaTime, settlers);
            return;
        }

        // Random roaming behaviour
        this.roamCooldown -= deltaTime / 1000;
        if (this.roamCooldown <= 0) {
            const offsetX = Math.floor(Math.random() * 3) - 1;
            const offsetY = Math.floor(Math.random() * 3) - 1;
            const targetX = Math.max(0, Math.min(this.map.width - 1, Math.floor(this.x) + offsetX));
            const targetY = Math.max(0, Math.min(this.map.height - 1, Math.floor(this.y) + offsetY));
            this.path = [{ x: targetX, y: targetY }];
            this.roamCooldown = 2 + Math.random() * 3;
        }

        if (this.path && this.path.length > 0) {
            const targetNode = this.path[0];
            const speed = ENEMY_RUN_SPEED;
            const delta = speed * (deltaTime / 1000);
            if (this.x < targetNode.x) {
                this.x = Math.min(this.x + delta, targetNode.x);
            } else if (this.x > targetNode.x) {
                this.x = Math.max(this.x - delta, targetNode.x);
            }
            if (this.y < targetNode.y) {
                this.y = Math.min(this.y + delta, targetNode.y);
            } else if (this.y > targetNode.y) {
                this.y = Math.max(this.y - delta, targetNode.y);
            }
            if (Math.abs(this.x - targetNode.x) < 0.1 && Math.abs(this.y - targetNode.y) < 0.1) {
                this.x = targetNode.x;
                this.y = targetNode.y;
                this.path.shift();
                this.path = null;
            }
        }

        // Occasionally eat berries or mushrooms from map
        if (Math.random() < 0.01) {
            const tx = Math.floor(this.x);
            const ty = Math.floor(this.y);
            const tile = this.map.getTile(tx, ty);
            if (tile === 4 || tile === 6) {
                this.map.removeResourceNode(tx, ty);
            }
        }
    }
}
