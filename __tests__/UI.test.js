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
