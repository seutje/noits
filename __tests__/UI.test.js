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

    test('farm plot menu shows with correct button states', () => {
        const ui = new UI({});
        const mockGame = { addSowCropTask: jest.fn(), addHarvestCropTask: jest.fn() };
        ui.setGameInstance(mockGame);
        const farmPlot = { crop: null, growthStage: 0, x: 1, y: 2 };
        ui.showFarmPlotMenu(farmPlot, 10, 20);
        expect(ui.farmPlotMenu.style.display).toBe('block');
        expect(ui.plantWheatButton.disabled).toBe(false);
        expect(ui.plantCottonButton.disabled).toBe(false);
        expect(ui.harvestButton.disabled).toBe(true);
        ui.hideFarmPlotMenu();
        expect(ui.farmPlotMenu.style.display).toBe('none');
    });
});
