const NotificationHelper = {
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return;
    }
    
    const result = await Notification.requestPermission();
    if (result === 'denied') {
      console.log('Notification permission denied');
      return;
    }
    
    if (result === 'default') {
      console.log('Notification permission closed');
      return;
    }
    
    console.log('Notification permission granted');
  },

  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported in the browser');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service worker registered');
      return registration;
    } catch (error) {
      console.error('Failed to register service worker:', error);
    }
  },

  async subscribePushNotification(registration) {
    try {
      const subscribeOptions = {
        userVisibleOnly: true,
        applicationServerKey: 'BEHk30jQmxuxPccWUY-xvgSPrtqcZZ_ULzRdmBijuH2bzuPekXzgVfISIpQ1VCYduvGd9wEuqGR9E4x2np5yBV0',
      };
      const subscription = await registration.pushManager.subscribe(subscribeOptions);
      
      console.log('Push notification subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe push notification:', error);
    }
  },
};

export default NotificationHelper; 