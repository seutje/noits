
export default class Weapon {
    constructor(name, type, damage, attackSpeed) {
        this.name = name;
        this.type = type; // e.g., "melee", "ranged"
        this.damage = damage;
        this.attackSpeed = attackSpeed; // attacks per second
    }
}
