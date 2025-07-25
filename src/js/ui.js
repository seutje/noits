
export default class UI {
    constructor() {
        this.uiContainer = document.createElement('div');
        this.uiContainer.id = 'ui-container';
        this.uiContainer.style.position = 'absolute';
        this.uiContainer.style.top = '0';
        this.uiContainer.style.left = '0';
        this.uiContainer.style.width = '100%';
        this.uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        this.uiContainer.style.color = 'white';
        this.uiContainer.style.padding = '10px';
        this.uiContainer.style.boxSizing = 'border-box';
        document.body.appendChild(this.uiContainer);

        this.timeElement = document.createElement('span');
        this.timeElement.id = 'time-display';
        this.uiContainer.appendChild(this.timeElement);

        this.resourcesElement = document.createElement('span');
        this.resourcesElement.id = 'resources-display';
        this.resourcesElement.style.marginLeft = '20px';
        this.uiContainer.appendChild(this.resourcesElement);
    }

    update(gameTime, resourceString, settlerHunger, settlerSleep) {
        this.ctx.fillText(`Time: ${gameTime.toFixed(1)}s`, 10, 20);
        this.ctx.fillText(`Resources: ${resourceString}`, 10, 40);
        this.ctx.fillText(`Settler Hunger: ${settlerHunger.toFixed(1)}`, 10, 60);
        this.ctx.fillText(`Settler Sleep: ${settlerSleep.toFixed(1)}`, 10, 80);
    }
}
