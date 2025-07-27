import { debugLog } from './debug.js';
export default class TradeManager {
    constructor(resourceManager, factions) {
        this.resourceManager = resourceManager;
        this.factions = factions;
    }

    /**
     * Simulates a trade event with a faction.
     * @param {string} factionId - The ID of the faction to trade with.
     * @param {Array} offers - An array of trade offers. Each offer is { type: 'buy'|'sell', resource: 'wood'|'food', quantity: 10, price: 5 }.
     */
    initiateTrade(factionId, offers) {
        const faction = this.factions[factionId];
        if (!faction) {
            console.warn(`Faction ${factionId} not found.`);
            return;
        }

        debugLog(`Initiating trade with ${faction.name} (Relation: ${faction.getRelationStatus()}).`);

        for (const offer of offers) {
            if (offer.type === 'buy') {
                // Player buys from faction
                if (this.resourceManager.removeResource('gold', offer.price)) {
                    this.resourceManager.addResource(offer.resource, offer.quantity);
                    debugLog(`Bought ${offer.quantity} ${offer.resource} for ${offer.price} gold.`);
                    faction.changeRelation(1); // Small relation boost for successful trade
                } else {
                    debugLog(`Not enough gold to buy ${offer.quantity} ${offer.resource}.`);
                    faction.changeRelation(-1); // Small relation drop for failed trade
                }
            } else if (offer.type === 'sell') {
                // Player sells to faction
                if (this.resourceManager.removeResource(offer.resource, offer.quantity)) {
                    this.resourceManager.addResource('gold', offer.price);
                    debugLog(`Sold ${offer.quantity} ${offer.resource} for ${offer.price} gold.`);
                    faction.changeRelation(1); // Small relation boost for successful trade
                } else {
                    debugLog(`Not enough ${offer.resource} to sell.`);
                    faction.changeRelation(-1); // Small relation drop for failed trade
                }
            }
        }
    }

    // Future: generate random trade offers, traveling merchant events, etc.
}