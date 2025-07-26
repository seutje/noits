
export default class NotificationManager {
    constructor() {
        this.notifications = [];
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'notification-container';
        this.notificationContainer.style.position = 'absolute';
        this.notificationContainer.style.top = '10px';
        this.notificationContainer.style.left = '50%';
        this.notificationContainer.style.transform = 'translateX(-50%)';
        this.notificationContainer.style.zIndex = '1000';
        this.notificationContainer.style.display = 'flex';
        this.notificationContainer.style.flexDirection = 'column';
        this.notificationContainer.style.alignItems = 'center';
        document.body.appendChild(this.notificationContainer);
    }

    addNotification(message, type = 'info', duration = 3000) {
        const notificationElement = document.createElement('div');
        notificationElement.className = `notification ${type}`;
        notificationElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        notificationElement.style.color = 'white';
        notificationElement.style.padding = '10px 20px';
        notificationElement.style.borderRadius = '5px';
        notificationElement.style.marginBottom = '10px';
        notificationElement.style.opacity = '0';
        notificationElement.style.transition = 'opacity 0.5s ease-in-out';
        notificationElement.textContent = message;

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
