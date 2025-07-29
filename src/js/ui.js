
import { TASK_TYPES, RESOURCE_TYPES, BUILDING_TYPES } from './constants.js';
import { setDebugMode } from './debug.js';

export default class UI {
    constructor(ctx) {
        this.ctx = ctx;
        this.uiContainer = document.createElement('div');
        this.uiContainer.id = 'ui-container';
        document.body.appendChild(this.uiContainer);

        // Loading screen elements
        this.loadingScreen = document.createElement('div');
        this.loadingScreen.id = 'loading-screen';
        const barContainer = document.createElement('div');
        barContainer.id = 'loading-bar-container';
        this.loadingBar = document.createElement('div');
        this.loadingBar.id = 'loading-bar';
        barContainer.appendChild(this.loadingBar);
        this.loadingScreen.appendChild(barContainer);
        this.loadingScreen.style.display = 'none';
        document.body.appendChild(this.loadingScreen);

        this.timeElement = document.createElement('span');
        this.timeElement.id = 'time-display';
        this.uiContainer.appendChild(this.timeElement);

        this.resourcesElement = document.createElement('span');
        this.resourcesElement.id = 'resources-display';
        this.uiContainer.appendChild(this.resourcesElement);

        this.settlersElement = document.createElement('div');
        this.settlersElement.id = 'settlers-display';
        this.uiContainer.appendChild(this.settlersElement);

        this.temperatureElement = document.createElement('span');
        this.temperatureElement.id = 'temperature-display';
        this.uiContainer.appendChild(this.temperatureElement);

        // Speed slider
        this.speedLabel = document.createElement('span');
        this.speedLabel.textContent = 'Speed: ';
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

        // Volume slider
        this.volumeLabel = document.createElement('span');
        this.volumeLabel.textContent = 'Volume: ';
        this.uiContainer.appendChild(this.volumeLabel);

        this.volumeSlider = document.createElement('input');
        this.volumeSlider.type = 'range';
        this.volumeSlider.min = '0';
        this.volumeSlider.max = '1';
        this.volumeSlider.step = '0.1';
        this.volumeSlider.value = '0';
        this.volumeSlider.id = 'volume-slider';
        this.uiContainer.appendChild(this.volumeSlider);

        this.volumeValueDisplay = document.createElement('span');
        this.volumeValueDisplay.textContent = '0%';
        this.uiContainer.appendChild(this.volumeValueDisplay);

        this.volumeSlider.addEventListener('input', (event) => {
            const value = parseFloat(event.target.value);
            this.volumeValueDisplay.textContent = `${Math.round(value * 100)}%`;
            if (this.gameInstance) {
                this.gameInstance.setSoundVolume(value);
            }
        });
        this.debugCheckbox = document.createElement("input");
        this.debugCheckbox.type = "checkbox";
        const debugLabel = document.createElement("label");
        debugLabel.textContent = "Debug";
        debugLabel.appendChild(this.debugCheckbox);
        this.uiContainer.appendChild(debugLabel);
        this.debugCheckbox.addEventListener("change", () => {
            setDebugMode(this.debugCheckbox.checked);
        });


        // Build menu
        this.buildMenu = document.createElement('div');
        this.buildMenu.id = 'build-menu';
        document.body.appendChild(this.buildMenu);

        this.buildMenuTabs = document.createElement('div');
        this.buildMenuTabs.id = 'build-menu-tabs';
        this.buildMenu.appendChild(this.buildMenuTabs);

        this.buildMenuContent = document.createElement('div');
        this.buildMenuContent.id = 'build-menu-content';
        this.buildMenu.appendChild(this.buildMenuContent);

        this.devMenu = document.createElement('div');
        this.devMenu.id = 'dev-menu-content';
        this.buildMenu.appendChild(this.devMenu);

        this.createBuildMenuTabs();
        this.showBuildCategory('buildings'); // Default category

        const saveGameButton = document.createElement('button');
        saveGameButton.textContent = 'Save Game';
        saveGameButton.onclick = (event) => {
            event.stopPropagation();
            if (this.gameInstance) {
                this.gameInstance.saveGame();
            }
        };
        this.devMenu.appendChild(saveGameButton);

        const loadGameButton = document.createElement('button');
        loadGameButton.textContent = 'Load Game';
        loadGameButton.onclick = (event) => {
            event.stopPropagation();
            if (this.gameInstance) {
                this.gameInstance.loadGame();
            }
        };
        this.devMenu.appendChild(loadGameButton);

        // Help button
        this.helpButton = document.createElement('button');
        this.helpButton.textContent = 'Help';
        this.helpButton.onclick = () => this.toggleHelp();
        this.uiContainer.appendChild(this.helpButton);

        this.priorityButton = document.createElement('button');
        this.priorityButton.textContent = 'Task Priorities';
        this.priorityButton.onclick = () => this.togglePriorityManager();
        this.devMenu.appendChild(this.priorityButton);

        this.taskManagerButton = document.createElement('button');
        this.taskManagerButton.textContent = 'Task Manager';
        this.taskManagerButton.onclick = () => this.toggleTaskManager();
        this.devMenu.appendChild(this.taskManagerButton);

        this.settlersButton = document.createElement('button');
        this.settlersButton.textContent = 'Settlers';
        this.settlersButton.onclick = () => this.toggleSettlerOverview();
        this.devMenu.appendChild(this.settlersButton);

        this.triggerEventButton = document.createElement('button');
        this.triggerEventButton.textContent = 'Trigger Event';
        this.triggerEventButton.onclick = (event) => {
            event.stopPropagation();
            if (this.gameInstance) {
                this.gameInstance.eventManager.triggerRandomEvent();
            }
        };
        this.devMenu.appendChild(this.triggerEventButton);

        this.helpOverlay = document.createElement('div');
        this.helpOverlay.id = 'help-overlay';
        this.helpOverlay.style.display = 'none';
        const helpContent = document.createElement('div');
        helpContent.innerHTML = `
            <h2>How to Play</h2>
            <ul>
                <li>Use WASD or arrow keys to move the camera.</li>
                <li>Click on tiles to gather resources or interact.</li>
                <li>Use the build menu to place buildings and furniture.</li>
                <li>Manage settlers via tasks automatically assigned.</li>
            </ul>
        `;
        const closeHelpButton = document.createElement('button');
        closeHelpButton.textContent = 'Close';
        closeHelpButton.onclick = () => this.hideHelp();
        helpContent.appendChild(closeHelpButton);
        this.helpOverlay.appendChild(helpContent);
        document.body.appendChild(this.helpOverlay);

        this.priorityOverlay = document.createElement('div');
        this.priorityOverlay.id = 'priority-overlay';
        this.priorityOverlay.style.display = 'none';
        // Prevent clicks inside the overlay from reaching the game canvas
        this.priorityOverlay.addEventListener('mousedown', (event) => {
            event.stopPropagation();
        });
        this.priorityOverlay.addEventListener('click', (event) => {
            event.stopPropagation();
        });
        document.body.appendChild(this.priorityOverlay);

        this.taskOverlay = document.createElement('div');
        this.taskOverlay.id = 'task-overlay';
        this.taskOverlay.style.display = 'none';
        this.taskOverlay.addEventListener('mousedown', (event) => {
            event.stopPropagation();
        });
        this.taskOverlay.addEventListener('click', (event) => {
            event.stopPropagation();
        });
        this.taskOverlay.addEventListener('wheel', (event) => {
            event.stopPropagation();
        });
        document.body.appendChild(this.taskOverlay);

        this.settlerOverlay = document.createElement('div');
        this.settlerOverlay.id = 'settler-overlay';
        this.settlerOverlay.style.display = 'none';
        this.settlerOverlay.addEventListener('mousedown', (event) => {
            event.stopPropagation();
        });
        this.settlerOverlay.addEventListener('click', (event) => {
            event.stopPropagation();
        });
        document.body.appendChild(this.settlerOverlay);

        this.farmPlotMenu = document.createElement('div');
        this.farmPlotMenu.id = 'farm-plot-menu';
        this.farmPlotMenu.style.display = 'none';

        const cropTypeContainer = document.createElement('div');
        this.wheatRadio = document.createElement('input');
        this.wheatRadio.type = 'radio';
        this.wheatRadio.name = 'crop-type';
        this.wheatRadio.value = RESOURCE_TYPES.WHEAT;
        const wheatLabel = document.createElement('label');
        wheatLabel.textContent = 'Wheat';
        wheatLabel.appendChild(this.wheatRadio);

        this.cottonRadio = document.createElement('input');
        this.cottonRadio.type = 'radio';
        this.cottonRadio.name = 'crop-type';
        this.cottonRadio.value = RESOURCE_TYPES.COTTON;
        const cottonLabel = document.createElement('label');
        cottonLabel.textContent = 'Cotton';
        cottonLabel.appendChild(this.cottonRadio);

        cropTypeContainer.appendChild(wheatLabel);
        cropTypeContainer.appendChild(cottonLabel);
        this.farmPlotMenu.appendChild(cropTypeContainer);

        this.autoSowCheckbox = document.createElement('input');
        this.autoSowCheckbox.type = 'checkbox';
        const autoSowLabel = document.createElement('label');
        autoSowLabel.textContent = 'Auto-sow';
        autoSowLabel.appendChild(this.autoSowCheckbox);
        this.farmPlotMenu.appendChild(autoSowLabel);
        this.autoSowCheckbox.addEventListener('change', () => {
            if (this.selectedFarmPlot) {
                this.selectedFarmPlot.autoSow = this.autoSowCheckbox.checked;
            }
        });

        this.autoHarvestCheckbox = document.createElement('input');
        this.autoHarvestCheckbox.type = 'checkbox';
        const autoHarvestLabel = document.createElement('label');
        autoHarvestLabel.textContent = 'Auto-harvest';
        autoHarvestLabel.appendChild(this.autoHarvestCheckbox);
        this.farmPlotMenu.appendChild(autoHarvestLabel);
        this.autoHarvestCheckbox.addEventListener('change', () => {
            if (this.selectedFarmPlot) {
                this.selectedFarmPlot.autoHarvest = this.autoHarvestCheckbox.checked;
            }
        });

        this.wheatRadio.addEventListener('change', () => {
            if (this.selectedFarmPlot && this.wheatRadio.checked) {
                this.selectedFarmPlot.desiredCrop = RESOURCE_TYPES.WHEAT;
            }
        });
        this.cottonRadio.addEventListener('change', () => {
            if (this.selectedFarmPlot && this.cottonRadio.checked) {
                this.selectedFarmPlot.desiredCrop = RESOURCE_TYPES.COTTON;
            }
        });

        this.sowButton = document.createElement('button');
        this.sowButton.textContent = 'Sow';
        this.sowButton.onclick = () => {
            if (this.gameInstance && this.selectedFarmPlot) {
                const cropType = this.wheatRadio.checked ? RESOURCE_TYPES.WHEAT : RESOURCE_TYPES.COTTON;
                this.selectedFarmPlot.desiredCrop = cropType;
                this.gameInstance.addSowCropTask(this.selectedFarmPlot, cropType);
            }
            this.hideFarmPlotMenu();
        };

        this.harvestButton = document.createElement('button');
        this.harvestButton.textContent = 'Harvest';
        this.harvestButton.onclick = () => {
            if (this.gameInstance && this.selectedFarmPlot) {
                this.gameInstance.addHarvestCropTask(this.selectedFarmPlot);
            }
            this.hideFarmPlotMenu();
        };

        this.farmPlotMenu.appendChild(this.sowButton);
        this.farmPlotMenu.appendChild(this.harvestButton);
        this.farmPlotMenu.addEventListener('mousedown', event => event.stopPropagation());
        this.farmPlotMenu.addEventListener('click', event => event.stopPropagation());
        document.addEventListener('click', () => this.hideFarmPlotMenu());
        document.body.appendChild(this.farmPlotMenu);

        // Crafting station menu
        this.craftingStationMenu = document.createElement('div');
        this.craftingStationMenu.id = 'crafting-station-menu';
        this.craftingStationMenu.style.display = 'none';

        this.recipeSelect = document.createElement('select');
        this.craftingStationMenu.appendChild(this.recipeSelect);

        this.quantityInput = document.createElement('input');
        this.quantityInput.type = 'number';
        this.quantityInput.min = '1';
        this.quantityInput.value = '1';
        this.craftingStationMenu.appendChild(this.quantityInput);

        this.autoCraftCheckbox = document.createElement('input');
        this.autoCraftCheckbox.type = 'checkbox';
        const autoCraftLabel = document.createElement('label');
        autoCraftLabel.textContent = 'Auto-craft';
        autoCraftLabel.appendChild(this.autoCraftCheckbox);
        this.craftingStationMenu.appendChild(autoCraftLabel);

        this.craftButton = document.createElement('button');
        this.craftButton.textContent = 'Craft';
        this.craftButton.onclick = () => {
            if (this.gameInstance && this.selectedCraftingStation) {
                const selectedValue = this.recipeSelect.value;
                if (
                    this.selectedCraftingStation.type === BUILDING_TYPES.OVEN &&
                    selectedValue === 'prepare_meal'
                ) {
                    this.gameInstance.addPrepareMealTask(this.selectedCraftingStation);
                } else {
                    const recipe = this.selectedCraftingStation.recipes[parseInt(selectedValue, 10)];
                    this.selectedCraftingStation.desiredRecipe = recipe;
                    const qty = parseInt(this.quantityInput.value, 10) || 1;
                    this.gameInstance.addCraftTask(this.selectedCraftingStation, recipe, qty);
                    if (this.autoCraftCheckbox.checked) {
                        this.selectedCraftingStation.autoCraft = true;
                    }
                }
            }
            this.hideCraftingStationMenu();
        };
        this.craftingStationMenu.appendChild(this.craftButton);

        this.autoCraftCheckbox.addEventListener('change', () => {
            if (this.selectedCraftingStation) {
                this.selectedCraftingStation.autoCraft = this.autoCraftCheckbox.checked;
                const val = this.recipeSelect.value;
                if (this.autoCraftCheckbox.checked && val !== 'prepare_meal') {
                    this.selectedCraftingStation.desiredRecipe = this.selectedCraftingStation.recipes[parseInt(val, 10)];
                }
            }
        });

        this.craftingStationMenu.addEventListener('mousedown', event => event.stopPropagation());
        this.craftingStationMenu.addEventListener('click', event => event.stopPropagation());
        document.addEventListener('click', () => this.hideCraftingStationMenu());
        document.body.appendChild(this.craftingStationMenu);

        this.tooltip = document.createElement('div');
        this.tooltip.id = 'tooltip';
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
                createButton('Build Wall', BUILDING_TYPES.WALL, false, 'Builds a defensive wall.');
                createButton('Build Floor', BUILDING_TYPES.FLOOR, false, 'Lays down a floor tile.');
                createButton('Build Crafting Station', BUILDING_TYPES.CRAFTING_STATION, false, 'Allows settlers to craft items.');
                createButton('Build Oven', BUILDING_TYPES.OVEN, false, 'Bakes bread from wheat.');
                createButton('Build Well', BUILDING_TYPES.WELL, false, 'Provides water from water tiles.');
                createButton('Build Farm Plot', BUILDING_TYPES.FARM_PLOT, false, 'Used for growing crops.');
                createButton('Build Animal Pen', BUILDING_TYPES.ANIMAL_PEN, false, 'Houses livestock.');
                createButton('Build Barricade', BUILDING_TYPES.BARRICADE, false, 'A simple defensive barrier.');
                break;
            case 'furniture':
                createButton('Place Bed', BUILDING_TYPES.BED, false, 'Provides a place for settlers to sleep.');
                createButton('Place Table', BUILDING_TYPES.TABLE, false, 'A surface for various activities.');
                break;
            case 'zones':
                createButton('Designate Bedroom', 'bedroom', true, 'Designates an area as a bedroom.');
                createButton('Designate Storage', 'storage', true, 'Designates an area for resource storage.');
                createButton('Dig Dirt', TASK_TYPES.DIG_DIRT, true, 'Designates a tile to be dug.');
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
        if (this.settlerOverlay.style.display === 'block') {
            this.renderSettlerOverview(settlers);
        }
    }

    showHelp() {
        this.helpOverlay.style.display = 'block';
    }

    hideHelp() {
        this.helpOverlay.style.display = 'none';
    }

    toggleHelp() {
        if (this.helpOverlay.style.display === 'none') {
            this.showHelp();
        } else {
            this.hideHelp();
        }
    }

    showPriorityManager() {
        if (!this.gameInstance) return;
        this.priorityOverlay.innerHTML = '';
        this.gameInstance.settlers.forEach(settler => {
            const settlerDiv = document.createElement('div');
            settlerDiv.innerHTML = `<h3>${settler.name}</h3>`;
            Object.keys(settler.taskPriorities).forEach(taskType => {
                const container = document.createElement('div');
                const label = document.createElement('label');
                label.textContent = taskType;
                label.classList.add('priority-label');
                const slider = document.createElement('input');
                slider.type = 'range';
                slider.min = '0';
                slider.max = '10';
                slider.value = settler.taskPriorities[taskType];
                const valueSpan = document.createElement('span');
                valueSpan.textContent = slider.value;
                slider.addEventListener('input', () => {
                    valueSpan.textContent = slider.value;
                    settler.taskPriorities[taskType] = parseInt(slider.value);
                });
                container.appendChild(label);
                container.appendChild(slider);
                container.appendChild(valueSpan);
                settlerDiv.appendChild(container);
            });
            this.priorityOverlay.appendChild(settlerDiv);
        });
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Close';
        closeBtn.onclick = () => this.hidePriorityManager();
        this.priorityOverlay.appendChild(closeBtn);
        this.priorityOverlay.style.display = 'block';
    }

    hidePriorityManager() {
        this.priorityOverlay.style.display = 'none';
    }

    togglePriorityManager() {
        if (this.priorityOverlay.style.display === 'none') {
            this.showPriorityManager();
        } else {
            this.hidePriorityManager();
        }
    }

    renderTaskManager() {
        if (!this.gameInstance) return;
        this.taskOverlay.innerHTML = '';
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'X';
        closeBtn.className = 'close-button';
        closeBtn.onclick = () => this.hideTaskManager();
        this.taskOverlay.appendChild(closeBtn);

        const table = document.createElement('table');

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Type', 'Assigned', 'Paused', 'Actions'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');

        this.gameInstance.taskManager.tasks.forEach(task => {
            const row = document.createElement('tr');
            row.className = 'task-row';

            const typeCell = document.createElement('td');
            typeCell.textContent = task.type;

            const assignedCell = document.createElement('td');
            assignedCell.textContent = task.assigned || '';

            const pausedCell = document.createElement('td');
            pausedCell.textContent = task.paused ? 'Yes' : 'No';

            const actionCell = document.createElement('td');
            const delBtn = document.createElement('button');
            delBtn.textContent = 'Delete';
            delBtn.onclick = () => {
                this.gameInstance.deleteTask(task);
            };
            actionCell.appendChild(delBtn);

            const unassignBtn = document.createElement('button');
            unassignBtn.textContent = 'Unassign';
            unassignBtn.onclick = () => {
                this.gameInstance.unassignTask(task);
            };
            actionCell.appendChild(unassignBtn);

            const pauseBtn = document.createElement('button');
            pauseBtn.textContent = task.paused ? 'Unpause' : 'Pause';
            pauseBtn.onclick = () => {
                if (task.paused) {
                    this.gameInstance.unpauseTask(task);
                } else {
                    this.gameInstance.pauseTask(task);
                }
            };
            actionCell.appendChild(pauseBtn);

            row.appendChild(typeCell);
            row.appendChild(assignedCell);
            row.appendChild(pausedCell);
            row.appendChild(actionCell);
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        this.taskOverlay.appendChild(table);
    }

    showTaskManager() {
        if (!this.gameInstance) return;
        this.renderTaskManager();
        this.taskOverlay.style.display = 'block';
        this.taskListChangeHandler = () => this.renderTaskManager();
        this.gameInstance.taskManager.addChangeListener(this.taskListChangeHandler);
    }

    hideTaskManager() {
        this.taskOverlay.style.display = 'none';
        if (this.taskListChangeHandler && this.gameInstance) {
            this.gameInstance.taskManager.removeChangeListener(this.taskListChangeHandler);
            this.taskListChangeHandler = null;
        }
    }

    toggleTaskManager() {
        if (this.taskOverlay.style.display === 'none') {
            this.showTaskManager();
        } else {
            this.hideTaskManager();
        }
    }

    renderSettlerOverview(settlers) {
        if (!this.gameInstance) return;
        this.settlerOverlay.innerHTML = '';
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'X';
        closeBtn.className = 'close-button';
        closeBtn.onclick = () => this.hideSettlerOverview();
        this.settlerOverlay.appendChild(closeBtn);

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Name', 'Task', 'Health', 'Hunger', 'Sleep', 'Mood', 'Inventory'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        settlers.forEach(settler => {
            const row = document.createElement('tr');
            const cells = [
                settler.name,
                settler.currentTask ? settler.currentTask.type : '',
                settler.health.toFixed(1),
                settler.hunger.toFixed(1),
                settler.sleep.toFixed(1),
                settler.mood.toFixed(1),
                settler.carrying ? `${settler.carrying.quantity} ${settler.carrying.type}` : ''
            ];
            cells.forEach(text => {
                const td = document.createElement('td');
                td.textContent = text;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        this.settlerOverlay.appendChild(table);
    }

    showSettlerOverview() {
        if (!this.gameInstance) return;
        this.renderSettlerOverview(this.gameInstance.settlers);
        this.settlerOverlay.style.display = 'block';
    }

    hideSettlerOverview() {
        this.settlerOverlay.style.display = 'none';
    }

    toggleSettlerOverview() {
        if (this.settlerOverlay.style.display === 'none') {
            this.showSettlerOverview();
        } else {
            this.hideSettlerOverview();
        }
    }

    showFarmPlotMenu(farmPlot, screenX, screenY) {
        this.selectedFarmPlot = farmPlot;
        this.farmPlotMenu.style.left = `${screenX}px`;
        this.farmPlotMenu.style.top = `${screenY}px`;
        this.wheatRadio.checked = farmPlot.desiredCrop === RESOURCE_TYPES.WHEAT;
        this.cottonRadio.checked = farmPlot.desiredCrop === RESOURCE_TYPES.COTTON;
        this.autoSowCheckbox.checked = farmPlot.autoSow;
        this.autoHarvestCheckbox.checked = farmPlot.autoHarvest;
        this.sowButton.disabled = farmPlot.crop !== null;
        this.harvestButton.disabled = farmPlot.growthStage !== 3;
        this.farmPlotMenu.style.display = 'block';
    }

    hideFarmPlotMenu() {
        this.farmPlotMenu.style.display = 'none';
        this.selectedFarmPlot = null;
    }

    showCraftingStationMenu(station, screenX, screenY) {
        this.selectedCraftingStation = station;
        this.recipeSelect.innerHTML = '';
        station.recipes.forEach((recipe, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = recipe.name;
            this.recipeSelect.appendChild(option);
        });
        if (station.type === BUILDING_TYPES.OVEN) {
            const mealOption = document.createElement('option');
            mealOption.value = 'prepare_meal';
            mealOption.textContent = 'Prepare Meal';
            this.recipeSelect.appendChild(mealOption);
        }
        this.recipeSelect.selectedIndex = 0;
        this.quantityInput.value = '1';
        this.autoCraftCheckbox.checked = station.autoCraft;
        this.craftingStationMenu.style.left = `${screenX}px`;
        this.craftingStationMenu.style.top = `${screenY}px`;
        this.craftingStationMenu.style.display = 'block';
    }

    hideCraftingStationMenu() {
        this.craftingStationMenu.style.display = 'none';
        this.selectedCraftingStation = null;
    }

    showLoadingScreen() {
        this.loadingScreen.style.display = 'flex';
        this.updateLoadingProgress(0);
    }

    updateLoadingProgress(progress) {
        this.loadingBar.style.width = `${Math.floor(progress * 100)}%`;
    }

    hideLoadingScreen() {
        this.loadingScreen.style.display = 'none';
    }
}
