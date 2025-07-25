
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

        this.settlerMoodElement = document.createElement('span');
        this.settlerMoodElement.id = 'settler-mood-display';
        this.settlerMoodElement.style.marginLeft = '20px';
        this.uiContainer.appendChild(this.settlerMoodElement);

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

        // Build menu
        this.buildMenu = document.createElement('div');
        this.buildMenu.id = 'build-menu';
        this.buildMenu.style.position = 'absolute';
        this.buildMenu.style.top = '10px';
        this.buildMenu.style.right = '10px';
        this.buildMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.buildMenu.style.padding = '10px';
        this.buildMenu.style.borderRadius = '5px';
        document.body.appendChild(this.buildMenu);

        const wallButton = document.createElement('button');
        wallButton.textContent = 'Build Wall';
        wallButton.onclick = () => {
            if (this.gameInstance) {
                this.gameInstance.toggleBuildMode('wall');
            }
        };
        this.buildMenu.appendChild(wallButton);

        const floorButton = document.createElement('button');
        floorButton.textContent = 'Build Floor';
        floorButton.onclick = (event) => {
            event.stopPropagation();
            if (this.gameInstance) {
                this.gameInstance.toggleBuildMode('floor');
            }
        };
        this.buildMenu.appendChild(floorButton);

        const craftingStationButton = document.createElement('button');
        craftingStationButton.textContent = 'Build Crafting Station';
        craftingStationButton.onclick = (event) => {
            event.stopPropagation();
            if (this.gameInstance) {
                this.gameInstance.toggleBuildMode('crafting_station');
            }
        };
        this.buildMenu.appendChild(craftingStationButton);

        const farmPlotButton = document.createElement('button');
        farmPlotButton.textContent = 'Build Farm Plot';
        farmPlotButton.onclick = (event) => {
            event.stopPropagation();
            if (this.gameInstance) {
                this.gameInstance.toggleBuildMode('farm_plot');
            }
        };
        this.buildMenu.appendChild(farmPlotButton);

        const animalPenButton = document.createElement('button');
        animalPenButton.textContent = 'Build Animal Pen';
        animalPenButton.onclick = (event) => {
            event.stopPropagation();
            if (this.gameInstance) {
                this.gameInstance.toggleBuildMode('animal_pen');
            }
        };
        this.buildMenu.appendChild(animalPenButton);

        const designateBedroomButton = document.createElement('button');
        designateBedroomButton.textContent = 'Designate Bedroom';
        designateBedroomButton.onclick = (event) => {
            event.stopPropagation();
            if (this.gameInstance) {
                this.gameInstance.startRoomDesignation('bedroom');
            }
        };
        this.buildMenu.appendChild(designateBedroomButton);

        const designateStorageButton = document.createElement('button');
        designateStorageButton.textContent = 'Designate Storage';
        designateStorageButton.onclick = (event) => {
            event.stopPropagation();
            if (this.gameInstance) {
                this.gameInstance.startRoomDesignation('storage');
            }
        };
        this.buildMenu.appendChild(designateStorageButton);
    }

    setGameInstance(gameInstance) {
        this.gameInstance = gameInstance;
    }

    update(gameTime, resourceString, settlerHunger, settlerSleep, settlerMood) {
        this.timeElement.textContent = `Time: ${gameTime.toFixed(1)}s`;
        this.resourcesElement.textContent = `Resources: ${resourceString}`;
        this.settlerHungerElement.textContent = `Settler Hunger: ${settlerHunger.toFixed(1)}`;
        this.settlerSleepElement.textContent = `Settler Sleep: ${settlerSleep.toFixed(1)}`;
        this.settlerMoodElement.textContent = `Settler Mood: ${settlerMood.toFixed(1)}`;
    }
}
