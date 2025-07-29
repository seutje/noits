import { debugLog } from './debug.js';

import Settler from './settler.js';
import { ENEMY_RUN_SPEED, RESOURCE_TYPES } from './constants.js';
import { findPath } from './pathfinding.js';

let enemyIdCounter = 0;

export default class Enemy {
    constructor(
        name,
        x,
        y,
        targetSettler,
        map,
        spriteManager = null,
        lootType = RESOURCE_TYPES.MEAT
    ) {
        this.id = enemyIdCounter++;
        this.name = name;
        this.x = x;
        this.y = y;
        this.health = 100;
        this.damage = 10; // Base damage
        this.attackSpeed = 1; // attacks per second
        this.attackCooldown = 0;
        this.targetSettler = targetSettler; // The settler this enemy is targeting
        this.map = map;
        this.state = "attacking"; // For now, always attacking
        this.spriteManager = spriteManager;
        this.lootType = lootType; // Resource type yielded when butchered
        this.isDead = false; // True when the enemy has been killed
        this.isButchered = false; // True when the enemy has been butchered
        this.isMarkedForButcher = false; // True when player has queued this enemy for butchering
        this.decay = 0; // 0-100 percentage of decay
        this.decayRate = 0.01; // percent per second
        this.path = null;
    }

    update(deltaTime, settlers) {
        if (this.isDead) {
            this.decay += this.decayRate * (deltaTime / 1000);
            if (this.decay > 100) this.decay = 100;
            return; // No actions when dead
        }
        this.attackCooldown -= deltaTime / 1000;

        if (this.targetSettler) {
            // If target settler is dead, clear target
            if (this.targetSettler.isDead) {
                this.targetSettler = null;
                this.path = null;
            } else {
                const targetX = Math.floor(this.targetSettler.x);
                const targetY = Math.floor(this.targetSettler.y);

                if (!this.path) {
                    if (Math.floor(this.x) === targetX && Math.floor(this.y) === targetY) {
                        this.path = [];
                    } else {
                        this.path = findPath(
                            { x: Math.floor(this.x), y: Math.floor(this.y) },
                            { x: targetX, y: targetY },
                            this.map
                        );
                        if (!this.path) {
                            this.path = [{ x: targetX, y: targetY }];
                        }
                    }
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
                        this.path = null; // recalc on next tile
                    }
                }

                // Check if within attack range (simple distance check)
                const distance = Math.sqrt(
                    Math.pow(this.x - this.targetSettler.x, 2) + Math.pow(this.y - this.targetSettler.y, 2)
                );
                if (distance < 1.5) {
                    if (this.attackCooldown <= 0) {
                        this.dealDamage(this.targetSettler);
                        this.attackCooldown = 1 / this.attackSpeed;
                    }
                }
            }
        } else {
            // If no target, find the closest living settler
            if (settlers.length > 0) {
                let closestSettler = null;
                let minDistance = Infinity;
                for (const settler of settlers) {
                    if (!settler.isDead) { // Only consider living settlers
                        const dist = Math.sqrt(Math.pow(this.x - settler.x, 2) + Math.pow(this.y - settler.y, 2));
                        if (dist < minDistance) {
                            minDistance = dist;
                            closestSettler = settler;
                        }
                    }
                }
                this.targetSettler = closestSettler;
            }
        }
    }

    dealDamage(targetSettler) {
        // Choose a random body part to hit
        const bodyParts = Object.keys(targetSettler.bodyParts);
        const randomBodyPart = bodyParts[Math.floor(Math.random() * bodyParts.length)];

        // Apply armor defense (if any)
        let finalDamage = this.damage;
        if (targetSettler.equippedArmor[randomBodyPart]) {
            finalDamage -= targetSettler.equippedArmor[randomBodyPart].defense;
            if (finalDamage < 0) finalDamage = 0;
        }

        targetSettler.takeDamage(randomBodyPart, finalDamage, true, this); // Pass enemy as attacker
        debugLog(`${this.name} attacked ${targetSettler.name} dealing ${finalDamage.toFixed(1)} damage to ${randomBodyPart}.`);
    }

    render(ctx) {
        let enemySprite;
        if (this.name === "Wild Boar") {
            enemySprite = this.spriteManager.getSprite('wild_boar');
        } else if (this.name === "Deer") {
            enemySprite = this.spriteManager.getSprite('deer');
        } else {
            enemySprite = this.spriteManager.getSprite('goblin'); // Default to goblin sprite for other enemies
        }

        if (enemySprite) {
            if (this.isDead) {
                ctx.save();
                ctx.translate(this.x * 32 + 16, this.y * 32 + 16); // Translate to center of tile
                ctx.rotate(Math.PI / 2); // Rotate 90 degrees (PI/2 radians)
                ctx.drawImage(enemySprite, -16, -16, 32, 32); // Draw image centered
                ctx.restore();
            } else {
                ctx.drawImage(enemySprite, this.x * 32, this.y * 32, 32, 32);
            }
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x * 32, this.y * 32, 32, 32);
        }
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(this.name, this.x * 32, this.y * 32 - 5);
    }

    serialize() {
        return {
            name: this.name,
            x: this.x,
            y: this.y,
            health: this.health,
            damage: this.damage,
            attackSpeed: this.attackSpeed,
            attackCooldown: this.attackCooldown,
            // targetSettler is a reference, so we save its name/ID if needed for re-linking
            // For now, we'll assume targetSettler is re-established on load based on proximity
            state: this.state,
            id: this.id,
            isDead: this.isDead,
            isButchered: this.isButchered,
            isMarkedForButcher: this.isMarkedForButcher,
            lootType: this.lootType,
            decay: this.decay
        };
    }

    deserialize(data) {
        this.name = data.name;
        this.x = data.x;
        this.y = data.y;
        this.health = data.health;
        this.damage = data.damage;
        this.attackSpeed = data.attackSpeed;
        this.attackCooldown = data.attackCooldown;
        this.state = data.state;
        this.id = data.id;
        this.isDead = data.isDead || false;
        this.isButchered = data.isButchered || false;
        this.isMarkedForButcher = data.isMarkedForButcher || false;
        this.lootType = data.lootType || RESOURCE_TYPES.MEAT;
        this.decay = data.decay || 0;
    }
}
