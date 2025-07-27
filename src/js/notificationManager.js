
export default class NotificationManager {
    constructor(soundManager = null) {
        this.soundManager = soundManager;
        this.notifications = [];
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'notification-container';
        document.body.appendChild(this.notificationContainer);
    }

    addNotification(message, type = 'info', duration = 3000) {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification ${type}`;
        notificationElement.style.opacity = '0';
        notificationElement.style.transition = 'opacity 0.5s ease-in-out';
        notificationElement.textContent = message;

        if (this.soundManager) {
            this.soundManager.play('action');
        }

        this.notificationContainer.prepend(notificationElement); // Add to top

        // Fade in
        setTimeout(() => {
            notificationElement.style.opacity = '1';
        }, 10);

        // Fade out and remove
        setTimeout(() => {
            notificationElement.style.opacity = '0';
            notificationElement.addEventListener('transitionend', () => {
                notificationElement.remove();
                this.notifications = this.notifications.filter(n => n !== notificationElement);
            });
        }, duration);

        this.notifications.push(notificationElement);
    }
}
