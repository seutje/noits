
import Settler from './settler.js';

let enemyIdCounter = 0;

export default class Enemy {
    constructor(name, x, y, targetSettler, spriteManager) {
        this.id = enemyIdCounter++;
        this.name = name;
        this.x = x;
        this.y = y;
        this.health = 100;
        this.damage = 10; // Base damage
        this.attackSpeed = 1; // attacks per second
        this.attackCooldown = 0;
        this.targetSettler = targetSettler; // The settler this enemy is targeting
        this.state = "attacking"; // For now, always attacking
        this.spriteManager = spriteManager;
    }

    update(deltaTime, settlers) {
        this.attackCooldown -= deltaTime / 1000;

        if (this.targetSettler) {
            // Move towards the target settler
            const speed = 0.03; // tiles per second
            if (this.x < this.targetSettler.x) {
                this.x += speed * (deltaTime / 1000);
            } else if (this.x > this.targetSettler.x) {
                this.x -= speed * (deltaTime / 1000);
            }
            if (this.y < this.targetSettler.y) {
                this.y += speed * (deltaTime / 1000);
            } else if (this.y > this.targetSettler.y) {
                this.y -= speed * (deltaTime / 1000);
            }

            // Check if within attack range (simple distance check)
            const distance = Math.sqrt(Math.pow(this.x - this.targetSettler.x, 2) + Math.pow(this.y - this.targetSettler.y, 2));
            if (distance < 1.5) { // Within 1.5 tiles, consider it melee range
                if (this.attackCooldown <= 0) {
                    this.dealDamage(this.targetSettler);
                    this.attackCooldown = 1 / this.attackSpeed; // Reset cooldown
                }
            }
        } else {
            // If no target, find the closest settler
            if (settlers.length > 0) {
                let closestSettler = null;
                let minDistance = Infinity;
                for (const settler of settlers) {
                    const dist = Math.sqrt(Math.pow(this.x - settler.x, 2) + Math.pow(this.y - settler.y, 2));
                    if (dist < minDistance) {
                        minDistance = dist;
                        closestSettler = settler;
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
        console.log(`${this.name} attacked ${targetSettler.name} dealing ${finalDamage.toFixed(1)} damage to ${randomBodyPart}.`);
    }

    render(ctx) {
        let enemySprite;
        if (this.name === "Wild Boar") {
            enemySprite = this.spriteManager.getSprite('wild_boar');
        } else {
            enemySprite = this.spriteManager.getSprite('goblin'); // Default to goblin sprite for other enemies
        }

        if (enemySprite) {
            ctx.drawImage(enemySprite, this.x * 32, this.y * 32, 32, 32);
        } else {
            ctx.fillStyle = 'red';
            ctx.fillRect(this.x * 32, this.y * 32, 32, 32);
        }
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(this.name, this.x * 32, this.y * 32 - 5);
        ctx.fillText(`Health: ${this.health.toFixed(1)}`, this.x * 32, this.y * 32 + 40);
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
            id: this.id
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
    }
}
