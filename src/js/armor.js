
export default class Armor {
    constructor(name, type, defense, bodyPart) {
        this.name = name;
        this.type = type; // e.g., "light", "medium", "heavy"
        this.defense = defense;
        this.bodyPart = bodyPart; // e.g., "head", "torso", "legs"
    }
}
