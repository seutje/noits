import { debugLog } from './debug.js';

import ResourcePile from './resourcePile.js';
import { RESOURCE_TYPES, BUILDING_TYPES } from './constants.js';
export default class EventManager {
    constructor(game, EnemyClass) {
        this.EnemyClass = EnemyClass;
        this.game = game;
        this.events = [];
        this.lastEventTime = 0;
        this.eventInterval = 1200; // seconds between events (20x less often)

        this.defineEvents();
    }

    defineEvents() {
        this.events = [
            {
                name: "Wild Animal Attack",
                description: "A wild animal is attacking your colony!",
                condition: () => true, // Always possible for now
                action: () => {
                    debugLog("Event: Wild Animal Attack!");
                    this.game.notificationManager.addNotification("A wild animal is attacking your colony!", 'warning');
                    // Spawn a new enemy
                    if (this.game.settlers.length > 0) {
                        const targetSettler = this.game.settlers[Math.floor(Math.random() * this.game.settlers.length)];
                        this.game.enemies.push(
                            new this.EnemyClass(
                                "Wild Boar",
                                49,
                                29,
                                targetSettler,
                                this.game.map,
                                this.game.spriteManager,
                                RESOURCE_TYPES.MEAT
                            )
                        );
                        debugLog("A wild boar has appeared!");
                    this.game.notificationManager.addNotification("A wild boar has appeared!", 'warning');
                    }
                }
            },
            {
                name: "Resource Discovery",
                description: "You discovered a new resource node!",
                condition: () => true, // Always possible for now
                action: () => {
                    debugLog("Event: Resource Discovery!");
                    this.game.notificationManager.addNotification("You discovered a new resource node!", 'info');
                    const resourceTypes = [RESOURCE_TYPES.WOOD, RESOURCE_TYPES.STONE, RESOURCE_TYPES.IRON_ORE];
                    const randomResource = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
                    const quantity = Math.floor(Math.random() * 50) + 20; // 20-70 units
                    this.game.resourceManager.addResource(randomResource, quantity);
                    debugLog(`Discovered ${quantity} units of ${randomResource}!`);
                    this.game.notificationManager.addNotification(`Discovered ${quantity} units of ${randomResource}!`, 'info');
                }
            },
            {
                name: "Settler Sickness",
                description: "One of your settlers has fallen ill.",
                condition: () => this.game.settlers.length > 0, // Only if there are settlers
                action: () => {
                    debugLog("Event: Settler Sickness!");
                    this.game.notificationManager.addNotification("One of your settlers has fallen ill.", 'warning');
                    const sickSettler = this.game.settlers[Math.floor(Math.random() * this.game.settlers.length)];
                    sickSettler.takeDamage('torso', 30, false); // Make them sick, not bleeding
                    debugLog(`${sickSettler.name} has fallen ill.`);
                    this.game.notificationManager.addNotification(`${sickSettler.name} has fallen ill.`, 'warning');
                }
            },
            {
                name: "Good Harvest",
                description: "Your crops yielded an abundant harvest!",
                condition: () => this.game.map.buildings.some(b => b.type === BUILDING_TYPES.FARM_PLOT && b.growthStage === 3), // Only if there are mature farm plots
                action: () => {
                    debugLog("Event: Good Harvest!");
                    this.game.notificationManager.addNotification("Your crops yielded an abundant harvest!", 'success');
                    const farmPlots = this.game.map.buildings.filter(b => b.type === BUILDING_TYPES.FARM_PLOT && b.growthStage === 3);
                    if (farmPlots.length > 0) {
                        farmPlots.forEach(plot => {
                            const harvestedCrop = plot.harvest();
                            if (harvestedCrop) {
                                const pile = new ResourcePile(harvestedCrop, 2, plot.x, plot.y, this.game.map.tileSize, this.game.spriteManager);
                                this.game.map.addResourcePile(pile);
                                debugLog(`Doubled harvest from a farm plot: ${harvestedCrop}!`);
                                this.game.notificationManager.addNotification(`Doubled harvest from a farm plot: ${harvestedCrop}!`, 'success');
                            }
                        });
                    }
                }
            },
            {
                name: "Vile Force of Darkness",
                description: "A vile force of darkness has arrived!",
                condition: () => true,
                action: () => {
                    debugLog("Event: Vile Force of Darkness!");
                    this.game.notificationManager.addNotification("A vile force of darkness has arrived!", 'warning');
                    if (this.game.settlers.length > 0) {
                        const targetSettler = this.game.settlers[Math.floor(Math.random() * this.game.settlers.length)];
                        this.game.enemies.push(
                            new this.EnemyClass(
                                "Goblin",
                                49,
                                29,
                                targetSettler,
                                this.game.map,
                                this.game.spriteManager
                            )
                        );
                        debugLog("A goblin has appeared!");
                        this.game.notificationManager.addNotification("A goblin has appeared!", 'warning');
                    }
                }
            }
        ];
    }

    update(deltaTime) {
        this.lastEventTime += deltaTime / 1000;

        if (this.lastEventTime >= this.eventInterval) {
            this.triggerRandomEvent();
            this.lastEventTime = 0; // Reset timer
        }
    }

    triggerRandomEvent() {
        const possibleEvents = this.events.filter(event => event.condition());
        if (possibleEvents.length > 0) {
            const eventToTrigger = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
            debugLog(`Triggering event: ${eventToTrigger.name}`);
            eventToTrigger.action();
        }
    }
}
