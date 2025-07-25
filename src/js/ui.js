
export default class UI {
    constructor(ctx) {
        this.ctx = ctx;
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

        this.settlerHungerElement = document.createElement('span');
        this.settlerHungerElement.id = 'settler-hunger-display';
        this.settlerHungerElement.style.marginLeft = '20px';
        this.uiContainer.appendChild(this.settlerHungerElement);

        this.settlerSleepElement = document.createElement('span');
        this.settlerSleepElement.id = 'settler-sleep-display';
        this.settlerSleepElement.style.marginLeft = '20px';
        this.uiContainer.appendChild(this.settlerSleepElement);

        // Speed slider
        this.speedLabel = document.createElement('span');
        this.speedLabel.textContent = 'Speed: ';
        this.speedLabel.style.marginLeft = '20px';
        this.uiContainer.appendChild(this.speedLabel);

        this.speedSlider = document.createElement('input');
        this.speedSlider.type = 'range';
        this.speedSlider.min = '1';
        this.speedSlider.max = '50';
        this.speedSlider.value = '1';
        this.speedSlider.id = 'speed-slider';
        this.uiContainer.appendChild(this.speedSlider);

        this.speedValueDisplay = document.createElement('span');
        this.speedValueDisplay.textContent = '1x';
        this.uiContainer.appendChild(this.speedValueDisplay);

        this.speedSlider.addEventListener('input', (event) => {
            this.speedValueDisplay.textContent = `${event.target.value}x`;
            if (this.gameInstance) {
                this.gameInstance.setGameSpeed(parseInt(event.target.value));
            }
        });
    }

    setGameInstance(gameInstance) {
        this.gameInstance = gameInstance;
    }

    update(gameTime, resourceString, settlerHunger, settlerSleep) {
        this.timeElement.textContent = `Time: ${gameTime.toFixed(1)}s`;
        this.resourcesElement.textContent = `Resources: ${resourceString}`;
        this.settlerHungerElement.textContent = `Settler Hunger: ${settlerHunger.toFixed(1)}`;
        this.settlerSleepElement.textContent = `Settler Sleep: ${settlerSleep.toFixed(1)}`;
    }
}
