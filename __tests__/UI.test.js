import UI from '../src/js/ui.js';

describe('UI tooltips', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('showTooltip and hideTooltip update tooltip display', () => {
        const ui = new UI({});
        ui.showTooltip('Tip');
        expect(ui.tooltip.style.display).toBe('block');
        expect(ui.tooltip.innerHTML).toBe('Tip');
        ui.hideTooltip();
        expect(ui.tooltip.style.display).toBe('none');
    });

    test('volume slider updates game volume', () => {
        const ui = new UI({});
        const mockGame = { setSoundVolume: jest.fn() };
        ui.setGameInstance(mockGame);
        ui.volumeSlider.value = '0.3';
        ui.volumeSlider.dispatchEvent(new Event('input'));
        expect(mockGame.setSoundVolume).toHaveBeenCalledWith(0.3);
        expect(ui.volumeValueDisplay.textContent).toBe('30%');
    });

    test('showHelp and hideHelp toggle help overlay', () => {
        const ui = new UI({});
        ui.showHelp();
        expect(ui.helpOverlay.style.display).toBe('block');
        ui.hideHelp();
        expect(ui.helpOverlay.style.display).toBe('none');
    });

    test('priority button is placed in dev menu', () => {
        const ui = new UI({});
        expect(ui.priorityButton.parentElement).toBe(ui.devMenu);
    });

    test('farm plot menu shows with correct controls', () => {
        const ui = new UI({});
        const mockGame = { addSowCropTask: jest.fn(), addHarvestCropTask: jest.fn() };
        ui.setGameInstance(mockGame);
        const farmPlot = { crop: null, growthStage: 0, desiredCrop: 'wheat', autoSow: false, autoHarvest: false, x: 1, y: 2 };
        ui.showFarmPlotMenu(farmPlot, 10, 20);
        expect(ui.farmPlotMenu.style.display).toBe('block');
        expect(ui.sowButton.disabled).toBe(false);
        expect(ui.harvestButton.disabled).toBe(true);
        expect(ui.wheatRadio.checked).toBe(true);
        expect(ui.autoSowCheckbox.checked).toBe(false);
        ui.hideFarmPlotMenu();
        expect(ui.farmPlotMenu.style.display).toBe('none');
    });

    test('crafting station menu shows with recipe list', () => {
        const ui = new UI({});
        const mockGame = { addCraftTask: jest.fn() };
        ui.setGameInstance(mockGame);
        const station = { recipes: [{ name: 'bandage' }], autoCraft: false };
        ui.showCraftingStationMenu(station, 5, 5);
        expect(ui.craftingStationMenu.style.display).toBe('block');
        expect(ui.recipeSelect.options.length).toBe(1);
        expect(ui.autoCraftCheckbox.checked).toBe(false);
        ui.hideCraftingStationMenu();
        expect(ui.craftingStationMenu.style.display).toBe('none');
    });

    test('loading screen shows and updates', () => {
        const ui = new UI({});
        ui.showLoadingScreen();
        ui.updateLoadingProgress(0.5);
        expect(ui.loadingScreen.style.display).toBe('flex');
        expect(ui.loadingBar.style.width).toBe('50%');
        ui.hideLoadingScreen();
        expect(ui.loadingScreen.style.display).toBe('none');
    });

    test('task manager button is placed in dev menu', () => {
        const ui = new UI({});
        expect(ui.taskManagerButton.parentElement).toBe(ui.devMenu);
    });

    test('settlers button is placed in dev menu', () => {
        const ui = new UI({});
        const button = Array.from(ui.devMenu.querySelectorAll('button')).find(b => b.textContent === 'Settlers');
        expect(button).not.toBeNull();
        expect(button.parentElement).toBe(ui.devMenu);
    });

    test('build button toggles and highlights', () => {
        const ui = new UI({});
        const mockGame = {
            buildMode: false,
            selectedBuilding: null,
            toggleBuildMode: jest.fn(function (type) {
                if (this.selectedBuilding === type && this.buildMode) {
                    this.buildMode = false;
                    this.selectedBuilding = null;
                } else {
                    this.buildMode = true;
                    this.selectedBuilding = type;
                }
            }),
        };
        ui.setGameInstance(mockGame);
        ui.showBuildCategory('buildings');
        const button = Array.from(ui.buildMenuContent.querySelectorAll('button')).find(b => b.textContent === 'Build Wall');
        button.dispatchEvent(new Event('click'));
        expect(mockGame.toggleBuildMode).toHaveBeenCalledWith('wall');
        expect(button.classList.contains('active')).toBe(true);
        button.dispatchEvent(new Event('click'));
        expect(button.classList.contains('active')).toBe(false);
    });

    test('showSettlerOverview displays settlers', () => {
        const ui = new UI({});
        const settlers = [
            { name: 'Alice', currentTask: { type: 'build' }, health: 90, hunger: 50, sleep: 60, mood: 80, carrying: { type: 'wood', quantity: 1 } },
            { name: 'Bob', currentTask: null, health: 100, hunger: 100, sleep: 100, mood: 100, carrying: null }
        ];
        const mockGame = { settlers };
        ui.setGameInstance(mockGame);
        ui.showSettlerOverview();
        expect(ui.settlerOverlay.style.display).toBe('block');
        expect(ui.settlerOverlay.querySelector('table')).not.toBeNull();
        expect(ui.settlerOverlay.querySelectorAll('tbody .settler-row').length).toBe(2);
        ui.hideSettlerOverview();
        expect(ui.settlerOverlay.style.display).toBe('none');
    });

    test('clicking settler row toggles skill display', () => {
        const ui = new UI({});
        const settlers = [
            { name: 'Alice', currentTask: null, health: 100, hunger: 100, sleep: 100, mood: 100, carrying: null, skills: { farming: 1 } }
        ];
        const mockGame = { settlers };
        ui.setGameInstance(mockGame);
        ui.showSettlerOverview();
        const row = ui.settlerTbody.querySelector('.settler-row');
        const skillRow = row.nextSibling;
        expect(skillRow.style.display).toBe('none');
        row.dispatchEvent(new Event('click'));
        expect(skillRow.style.display).toBe('table-row');
        row.dispatchEvent(new Event('click'));
        expect(skillRow.style.display).toBe('none');
    });

    test('wheel on settler overlay does not bubble to window', () => {
        const ui = new UI({});
        ui.setGameInstance({ settlers: [] });
        ui.showSettlerOverview();
        const handler = jest.fn();
        window.addEventListener('wheel', handler);
        ui.settlerOverlay.dispatchEvent(new Event('wheel', { bubbles: true }));
        expect(handler).not.toHaveBeenCalled();
        window.removeEventListener('wheel', handler);
        ui.hideSettlerOverview();
    });

    test('trigger event button triggers event manager', () => {
        const ui = new UI({});
        const mockGame = { eventManager: { triggerRandomEvent: jest.fn() } };
        ui.setGameInstance(mockGame);
        const button = Array.from(ui.devMenu.querySelectorAll('button')).find(b => b.textContent === 'Trigger Event');
        expect(button).not.toBeNull();
        button.dispatchEvent(new Event('click'));
        expect(mockGame.eventManager.triggerRandomEvent).toHaveBeenCalled();
    });

    test('showTaskManager displays tasks and allows deletion', () => {
        const ui = new UI({});
        const task1 = { type: 'build' };
        const task2 = { type: 'haul' };
        const mockTaskManager = {
            tasks: [task1, task2],
            changeListeners: [],
            addChangeListener: jest.fn(function (fn) { this.changeListeners.push(fn); }),
            removeChangeListener: jest.fn(function (fn) {
                this.changeListeners = this.changeListeners.filter(l => l !== fn);
            }),
            removeTask: jest.fn(function (task) {
                const idx = this.tasks.indexOf(task);
                if (idx !== -1) {
                    this.tasks.splice(idx, 1);
                    this.changeListeners.forEach(cb => cb());
                }
            }),
        };
        const mockGame = {
            taskManager: mockTaskManager,
            deleteTask: jest.fn(task => mockTaskManager.removeTask(task)),
            unassignTask: jest.fn(),
            pauseTask: jest.fn(),
            unpauseTask: jest.fn(),
        };
        ui.setGameInstance(mockGame);
        ui.showTaskManager();
        expect(ui.taskOverlay.style.display).toBe('block');
        expect(ui.taskOverlay.querySelector('table')).not.toBeNull();
        expect(ui.taskOverlay.querySelectorAll('table tr').length).toBe(3);
        const deleteButtons = ui.taskOverlay.querySelectorAll('table button');
        deleteButtons[0].dispatchEvent(new Event('click'));
        expect(mockGame.deleteTask).toHaveBeenCalledWith(task1);
        expect(ui.taskOverlay.querySelectorAll('table tr').length).toBe(2);
        const pauseButtons = Array.from(ui.taskOverlay.querySelectorAll('table button')).filter(b => b.textContent === 'Pause');
        expect(pauseButtons.length).toBe(1);
        pauseButtons[0].dispatchEvent(new Event('click'));
        expect(mockGame.pauseTask).toHaveBeenCalledWith(task2);
        ui.hideTaskManager();
        expect(ui.taskOverlay.style.display).toBe('none');
        expect(mockTaskManager.removeChangeListener).toHaveBeenCalled();
    });
});
