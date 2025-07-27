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

    test('priority button is placed in build menu', () => {
        const ui = new UI({});
        expect(ui.priorityButton.parentElement).toBe(ui.buildMenu);
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
});
