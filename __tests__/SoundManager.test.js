import SoundManager from '../src/js/soundManager.js';

describe('SoundManager', () => {
    let audioMock;

    beforeEach(() => {
        audioMock = {
            addEventListener: jest.fn((event, cb) => {
                if (event === 'canplaythrough') {
                    cb();
                }
            }),
            play: jest.fn(),
            currentTime: 0
        };
        global.Audio = jest.fn(() => audioMock);
    });

    test('loadSound stores audio', async () => {
        const sm = new SoundManager();
        await sm.loadSound('test', 'url');
        expect(sm.sounds.test).toBe(audioMock);
    });

    test('play calls play on audio', async () => {
        const sm = new SoundManager();
        await sm.loadSound('test', 'url');
        sm.play('test');
        expect(audioMock.play).toHaveBeenCalled();
    });
});
