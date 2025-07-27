import { debugLog } from './debug.js';
export default class Faction {
    constructor(name, initialRelation = 0) {
        this.name = name;
        this.relation = initialRelation; // -100 (hostile) to 100 (friendly)
    }

    changeRelation(amount) {
        this.relation += amount;
        if (this.relation > 100) this.relation = 100;
        if (this.relation < -100) this.relation = -100;
        debugLog(`Faction ${this.name} relation changed by ${amount}. New relation: ${this.relation}`);
    }

    getRelationStatus() {
        if (this.relation >= 75) return "Allied";
        if (this.relation >= 25) return "Friendly";
        if (this.relation > -25) return "Neutral";
        if (this.relation > -75) return "Unfriendly";
        return "Hostile";
    }
}