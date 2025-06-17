import '../assets/styles/transition.css';
import '../assets/styles/popup.css';
import { transitionHelper } from './utils';
import { matchRoute } from './routes/url-parser';
import { checkAuth } from './composables/Auth';
import CameraComposables from './composables/Camera';
import NotificationHelper from './utils/notification-helper';
import IdbHelper from './utils/idb';

const camera = CameraComposables();

// PWA Initialization
async function initializePWA() {
    console.log('Initializing PWA features...');
    
    // Request notification permission
    await NotificationHelper.requestPermission();
    
    // Register service worker
    const registration = await NotificationHelper.registerServiceWorker();
    
    // Subscribe to push notifications if registration successful
    if (registration) {
        // Wait for the service worker to be activated
        if (registration.active) {
            console.log('Service worker is already active');
        } else {
            console.log('Waiting for service worker to activate...');
            // Wait for the service worker to become active
            await new Promise(resolve => {
                if (registration.installing) {
                    registration.installing.addEventListener('statechange', e => {
                        if (e.target.state === 'activated') {
                            console.log('Service worker now activated');
                            resolve();
                        }
                    });
                } else if (registration.waiting) {
                    registration.waiting.addEventListener('statechange', e => {
                        if (e.target.state === 'activated') {
                            console.log('Service worker now activated');
                            resolve();
                        }
                    });
                } else {
                    // Already active
                    resolve();
                }
            });
        }
        
        // Now try to subscribe
        try {
            // Check authentication before subscribing
            if (checkAuth()) {
                await NotificationHelper.subscribePushNotification(registration);
            } else {
                console.log('User not authenticated. Skipping push notification subscription.');
            }
        } catch (error) {
            console.error('Error subscribing to push notifications:', error);
        }
    }
    
    // Test IndexedDB
    console.log('IndexedDB initialized');
}

async function transitionPage(pageComposables, idPage){
    const page = await pageComposables();
    if((await page.render(idPage)) == 404){
        return;
    }
    const app = document.getElementById('app');
    const transition = transitionHelper({
        updateDOM: async () => {
            const pageRender = await page.render(idPage);
            if(pageRender.error){
                app.innerHTML = pageRender.dom;
            }else{
                app.innerHTML = pageRender;
                await page.afterRender(idPage);
            }
        },
    });
    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
        scrollTo({ top: 0, behavior: 'instant' });
    });
}

async function renderRoute(path){
    const match = matchRoute(path);
    if(!match){
        document.getElementById('app').innerHTML = '<h1>404 Not Found</h1>';
        return;
    }
    const { route, params } = match;
    const module = await route.file;
    await transitionPage(async() => module.default(), params.id);
    const userType = checkAuth() ? localStorage.getItem('name') : 'Guest';
    document.title = typeof route.title === 'function' ? route.title(userType) : route.title;
}

window.navigate = (path) => {
    history.pushState({}, '', path);
    renderRoute(path);
}

window.onpopstate = () => {
    const cameraVideo = document.getElementById('camera-video');
    const captureBtn = document.getElementById('captureBtn');
    camera.stopCameraStream(cameraVideo, captureBtn);
    renderRoute(location.pathname);
}

document.addEventListener('DOMContentLoaded', async() => {
    // Initialize PWA features
    await initializePWA();
    
    // Start the app
    renderRoute(location.pathname);
});

document.addEventListener('click', e => {
    const link = e.target.closest('.pageChange');
    if(link){
        e.preventDefault();
        window.navigate(link.getAttribute('href'));
    }
});