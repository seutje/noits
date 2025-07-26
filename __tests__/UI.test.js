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
});
