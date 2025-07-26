
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

        this.settlersElement = document.createElement('div');
        this.settlersElement.id = 'settlers-display';
        this.settlersElement.style.marginLeft = '20px';
        this.uiContainer.appendChild(this.settlersElement);

        this.temperatureElement = document.createElement('span');
        this.temperatureElement.id = 'temperature-display';
        this.temperatureElement.style.marginLeft = '20px';
        this.uiContainer.appendChild(this.temperatureElement);

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
        this.buildMenu.style.bottom = '10px';
        this.buildMenu.style.left = '10px';
        this.buildMenu.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.buildMenu.style.padding = '10px';
        this.buildMenu.style.borderRadius = '5px';
        document.body.appendChild(this.buildMenu);

        this.buildMenuTabs = document.createElement('div');
        this.buildMenuTabs.id = 'build-menu-tabs';
        this.buildMenu.appendChild(this.buildMenuTabs);

        this.buildMenuContent = document.createElement('div');
        this.buildMenuContent.id = 'build-menu-content';
        this.buildMenu.appendChild(this.buildMenuContent);

        this.createBuildMenuTabs();
        this.showBuildCategory('buildings'); // Default category

        const exploreButton = document.createElement('button');
        exploreButton.textContent = 'Explore';
        exploreButton.onclick = (event) => {
            event.stopPropagation();
            if (this.gameInstance) {
                this.gameInstance.startExploration();
            }
        };
        this.buildMenu.appendChild(exploreButton);

        const merchantButton = document.createElement('button');
        merchantButton.textContent = 'Traveling Merchant';
        merchantButton.onclick = (event) => {
            event.stopPropagation();
            if (this.gameInstance) {
                this.gameInstance.spawnTravelingMerchant();
            }
        };
        this.buildMenu.appendChild(merchantButton);

        const addBandageButton = document.createElement('button');
        addBandageButton.textContent = 'Add Bandage';
        addBandageButton.onclick = () => {
            if (this.gameInstance) {
                this.gameInstance.resourceManager.addResource('bandage', 1);
            }
        };
        this.buildMenu.appendChild(addBandageButton);

        const injureSettlerButton = document.createElement('button');
        injureSettlerButton.textContent = 'Injure Settler';
        injureSettlerButton.onclick = () => {
            if (this.gameInstance && this.gameInstance.settlers.length > 0) {
                this.gameInstance.settlers[0].takeDamage('torso', 20, true);
            }
        };
        this.buildMenu.appendChild(injureSettlerButton);

        const saveGameButton = document.createElement('button');
        saveGameButton.textContent = 'Save Game';
        saveGameButton.onclick = (event) => {
            event.stopPropagation();
            if (this.gameInstance) {
                this.gameInstance.saveGame();
            }
        };
        this.buildMenu.appendChild(saveGameButton);

        const loadGameButton = document.createElement('button');
        loadGameButton.textContent = 'Load Game';
        loadGameButton.onclick = (event) => {
            event.stopPropagation();
            if (this.gameInstance) {
                this.gameInstance.loadGame();
            }
        };
        this.buildMenu.appendChild(loadGameButton);

        this.tooltip = document.createElement('div');
        this.tooltip.id = 'tooltip';
        this.tooltip.style.position = 'absolute';
        this.tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.tooltip.style.color = 'white';
        this.tooltip.style.padding = '5px';
        this.tooltip.style.borderRadius = '3px';
        this.tooltip.style.pointerEvents = 'none'; // Allow clicks to pass through
        this.tooltip.style.display = 'none';
        document.body.appendChild(this.tooltip);

        // Global mouse move listener for tooltip positioning
        document.addEventListener('mousemove', (event) => {
            if (this.tooltip.style.display === 'block') {
                this.tooltip.style.left = `${event.clientX + 10}px`;
                this.tooltip.style.top = `${event.clientY + 10}px`;
            }
        });
    }

    showTooltip(text) {
        this.tooltip.innerHTML = text;
        this.tooltip.style.display = 'block';
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
    }

    createBuildMenuTabs() {
        const categories = [
            { id: 'buildings', name: 'Buildings' },
            { id: 'furniture', name: 'Furniture' },
            { id: 'zones', name: 'Zones' }
        ];

        categories.forEach(category => {
            const tabButton = document.createElement('button');
            tabButton.textContent = category.name;
            tabButton.onclick = () => this.showBuildCategory(category.id);
            this.buildMenuTabs.appendChild(tabButton);
        });
    }

    showBuildCategory(categoryId) {
        this.buildMenuContent.innerHTML = ''; // Clear previous content

        const createButton = (text, buildModeType, isRoomDesignation = false, tooltipText = '') => {
            const button = document.createElement('button');
            button.textContent = text;
            button.addEventListener('mouseover', () => this.showTooltip(tooltipText));
            button.addEventListener('mouseout', () => this.hideTooltip());
            button.onclick = (event) => {
                event.stopPropagation();
                if (this.gameInstance) {
                    if (isRoomDesignation) {
                        this.gameInstance.startRoomDesignation(buildModeType);
                    } else {
                        this.gameInstance.toggleBuildMode(buildModeType);
                    }
                }
            };
            this.buildMenuContent.appendChild(button);
        };

        switch (categoryId) {
            case 'buildings':
                createButton('Build Wall', 'wall', false, 'Builds a defensive wall.');
                createButton('Build Floor', 'floor', false, 'Lays down a floor tile.');
                createButton('Build Crafting Station', 'crafting_station', false, 'Allows settlers to craft items.');
                createButton('Build Farm Plot', 'farm_plot', false, 'Used for growing crops.');
                createButton('Build Animal Pen', 'animal_pen', false, 'Houses livestock.');
                createButton('Build Barricade', 'barricade', false, 'A simple defensive barrier.');
                break;
            case 'furniture':
                createButton('Place Bed', 'bed', false, 'Provides a place for settlers to sleep.');
                createButton('Place Table', 'table', false, 'A surface for various activities.');
                break;
            case 'zones':
                createButton('Designate Bedroom', 'bedroom', true, 'Designates an area as a bedroom.');
                createButton('Designate Storage', 'storage', true, 'Designates an area for resource storage.');
                break;
        }
    }

    setGameInstance(gameInstance) {
        this.gameInstance = gameInstance;
    }

    update(gameTime, resourceString, settlers, temperature) {
        this.timeElement.textContent = `Time: ${gameTime.toFixed(1)}s`;
        this.resourcesElement.textContent = `Resources: ${resourceString}`;
        this.temperatureElement.textContent = `Temperature: ${temperature.toFixed(1)}°C`;
        this.settlersElement.innerHTML = '';
        settlers.forEach(settler => {
            const settlerDiv = document.createElement('div');
            settlerDiv.innerHTML = `<strong>${settler.name}</strong> - 
                Health: <span class="tooltip-trigger" data-tooltip-text="Current Health: ${settler.health.toFixed(1)} / 100">${settler.health.toFixed(1)}</span> | 
                Hunger: <span class="tooltip-trigger" data-tooltip-text="Hunger: ${settler.hunger.toFixed(1)}%">${settler.hunger.toFixed(1)}</span> | 
                Sleep: <span class="tooltip-trigger" data-tooltip-text="Sleep: ${settler.sleep.toFixed(1)}%">${settler.sleep.toFixed(1)}</span> | 
                Mood: <span class="tooltip-trigger" data-tooltip-text="Mood: ${settler.mood.toFixed(1)}%">${settler.mood.toFixed(1)}</span> | 
                Status: <span class="tooltip-trigger" data-tooltip-text="Current Status: ${settler.getStatus()}">${settler.getStatus()}</span>`;
            
            // Attach event listeners to tooltip triggers
            settlerDiv.querySelectorAll('.tooltip-trigger').forEach(span => {
                span.addEventListener('mouseover', (event) => this.showTooltip(event.target.dataset.tooltipText));
                span.addEventListener('mouseout', () => this.hideTooltip());
            });
            this.settlersElement.appendChild(settlerDiv);
        });
    }
}
