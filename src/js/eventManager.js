
export default class EventManager {
    constructor(game) {
        this.game = game;
        this.events = [];
        this.lastEventTime = 0;
        this.eventInterval = 60; // seconds between events

        this.defineEvents();
    }

    defineEvents() {
        this.events = [
            {
                name: "Wild Animal Attack",
                description: "A wild animal is attacking your colony!",
                condition: () => true, // Always possible for now
                action: () => {
                    console.log("Event: Wild Animal Attack!");
                    this.game.notificationManager.addNotification("A wild animal is attacking your colony!", 'warning');
                    // Spawn a new enemy
                    if (this.game.settlers.length > 0) {
                        const targetSettler = this.game.settlers[Math.floor(Math.random() * this.game.settlers.length)];
                        this.game.enemies.push(new this.game.Enemy("Wild Boar", targetSettler.x + 2, targetSettler.y + 2, targetSettler));
                        console.log("A wild boar has appeared!");
                    this.game.notificationManager.addNotification("A wild boar has appeared!", 'warning');
                    }
                }
            },
            {
                name: "Resource Discovery",
                description: "You discovered a new resource node!",
                condition: () => true, // Always possible for now
                action: () => {
                    console.log("Event: Resource Discovery!");
                    this.game.notificationManager.addNotification("You discovered a new resource node!", 'info');
                    const resourceTypes = ["wood", "stone", "iron_ore"];
                    const randomResource = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
                    const quantity = Math.floor(Math.random() * 50) + 20; // 20-70 units
                    this.game.resourceManager.addResource(randomResource, quantity);
                    console.log(`Discovered ${quantity} units of ${randomResource}!`);
                    this.game.notificationManager.addNotification(`Discovered ${quantity} units of ${randomResource}!`, 'info');
                }
            },
            {
                name: "Settler Sickness",
                description: "One of your settlers has fallen ill.",
                condition: () => this.game.settlers.length > 0, // Only if there are settlers
                action: () => {
                    console.log("Event: Settler Sickness!");
                    this.game.notificationManager.addNotification("One of your settlers has fallen ill.", 'warning');
                    const sickSettler = this.game.settlers[Math.floor(Math.random() * this.game.settlers.length)];
                    sickSettler.takeDamage('torso', 30, false); // Make them sick, not bleeding
                    console.log(`${sickSettler.name} has fallen ill.`);
                    this.game.notificationManager.addNotification(`${sickSettler.name} has fallen ill.`, 'warning');
                }
            },
            {
                name: "Good Harvest",
                description: "Your crops yielded an abundant harvest!",
                condition: () => this.game.map.buildings.some(b => b.type === 'farm_plot' && b.growthStage === 3), // Only if there are mature farm plots
                action: () => {
                    console.log("Event: Good Harvest!");
                    this.game.notificationManager.addNotification("Your crops yielded an abundant harvest!", 'success');
                    const farmPlots = this.game.map.buildings.filter(b => b.type === 'farm_plot' && b.growthStage === 3);
                    if (farmPlots.length > 0) {
                        farmPlots.forEach(plot => {
                            const harvestedCrop = plot.harvest();
                            if (harvestedCrop) {
                                this.game.resourceManager.addResource(harvestedCrop, 2); // Double the harvest
                                console.log(`Doubled harvest from a farm plot: ${harvestedCrop}!`);
                                this.game.notificationManager.addNotification(`Doubled harvest from a farm plot: ${harvestedCrop}!`, 'success');
                            }
                        });
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
            console.log(`Triggering event: ${eventToTrigger.name}`);
            eventToTrigger.action();
        }
    }
}
