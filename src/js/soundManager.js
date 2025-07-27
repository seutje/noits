import { ACTION_BEEP_URL } from './constants.js';

export default class SoundManager {
    constructor() {
        this.sounds = {};
        this.volume = 0; // Default to 0 volume
    }

    loadSound(name, url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio(url);
            audio.volume = this.volume; // Set default volume
            const onLoad = () => {
                this.sounds[name] = audio;
                resolve();
            };
            const onError = (err) => {
                reject(err);
            };
            audio.addEventListener('canplaythrough', onLoad, { once: true });
            audio.addEventListener('error', onError, { once: true });
        });
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        // Update volume of already loaded sounds
        Object.values(this.sounds).forEach(audio => {
            audio.volume = this.volume;
        });
    }

    play(name) {
        const audio = this.sounds[name];
        if (audio) {
            audio.volume = this.volume;
            audio.currentTime = 0;
            audio.play();
        }
    }
}
