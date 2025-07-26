import NotificationManager from '../src/js/notificationManager.js';

describe('NotificationManager', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test('constructor creates container', () => {
        const nm = new NotificationManager();
        const container = document.getElementById('notification-container');
        expect(container).not.toBeNull();
        expect(nm.notifications.length).toBe(0);
    });

    test('addNotification appends element to container', () => {
        const nm = new NotificationManager();
        nm.addNotification('Hello', 'info', 1000);
        const container = document.getElementById('notification-container');
        expect(container.children.length).toBe(1);
        expect(nm.notifications.length).toBe(1);
    });

    test('plays sound when soundManager provided', () => {
        const sm = { play: jest.fn() };
        const nm = new NotificationManager(sm);
        nm.addNotification('Hi');
        expect(sm.play).toHaveBeenCalledWith('action');
    });
});
