export const ACTION_BEEP_URL = "data:audio/wav;base64,UklGRrQBAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YZABAACAq9Dt/P3v066DWDIUBAIOKU14o8rp+/7y2baLYDgZBgELI0Zwm8Tk+P72372TaD8eCAEIHj9ok73f9v745MSbcEYjCwEGGThgi7bZ8v776cqjeE0pDgIEFDJYg67T7/387dCrf1QvEgMCECxRfKfN6/v98dayh1w1FgQBDSZJdJ/H5vn+9Ny5j2Q7GwcBCSBCbJfA4ff/9+HAl2xCIAkBBxs7ZI+53PT++ebHn3RJJg0BBBY1XIey1vH9++vNp3xRLBACAxIvVICr0O38/e/TroNYMhQEAg4pTXijyun7/vLZtotgOBkGAQsjRnCbxOT4/vbfvZNoPx4IAQgeP2iTvd/2/vjkxJtwRiMLAQYZOGCLttny/vvpyqN4TSkOAgQUMliDrtPv/fzt0KuAVC8SAwIQLFF8p83r+/3x1rKHXDUWBAENJkl0n8fm+f703LmPZDsbBwEJIEJsl8Dh9//34cCXbEIgCQEHGztkj7nc9P755sefdEkmDQEEFjVch7LW8f37682nfFEsEAIDEi9U";

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
