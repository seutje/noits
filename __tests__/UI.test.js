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
});
