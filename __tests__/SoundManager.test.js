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
            currentTime: 0,
            volume: 1
        };
        global.Audio = jest.fn(() => audioMock);
    });

    test('default volume is half', () => {
        const sm = new SoundManager();
        expect(sm.volume).toBe(0.5);
    });

    test('loadSound stores audio', async () => {
        const sm = new SoundManager();
        await sm.loadSound('test', 'url');
        expect(sm.sounds.test).toBe(audioMock);
        expect(audioMock.volume).toBe(0.5);
    });

    test('setVolume updates volume and play uses it', async () => {
        const sm = new SoundManager();
        await sm.loadSound('test', 'url');
        sm.setVolume(0.3);
        expect(audioMock.volume).toBe(0.3);
        sm.play('test');
        expect(audioMock.play).toHaveBeenCalled();
        expect(audioMock.volume).toBe(0.3);
    });
});
