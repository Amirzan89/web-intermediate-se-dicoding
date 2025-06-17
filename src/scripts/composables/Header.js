import { injectStyle, removeStyle } from '../utils';
import { checkAuth, getAuth, resetAuth } from '../composables/Auth';
import PopupComponent from '../components/Popup';
import NotificationHelper, { subscribe, unsubscribe, isCurrentPushSubscriptionAvailable, testPushNotification } from '../utils/notification-helper';
export default () => {
    const headerCss = () => {
        let style = `
            header{
                position: fixed;
                top: 0px;
                background-color: green;
                width: 100%;
                display: flex;
                align-items: center;
                z-index: 5;
            }
            header h1{
                position: relative;
                left: 7%;
            }
        `;
        if(checkAuth()){
            style += `
                header div{
                    position: relative;
                    right: 5%;
                    margin-left: auto;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 15px;
                }
                header div a{
                    text-decoration: none;
                    color: #fff;
                    padding: 5px 10px;
                    background-color: rgba(255,255,255,0.2);
                    border-radius: 4px;
                }
                header div a:hover{
                    background-color: rgba(255,255,255,0.3);
                }
                header div button{
                    padding: 5px 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                #btnSubscribe{
                    background-color: #fff;
                    color: green;
                }
                #btnUnsubscribe{
                    background-color: #eee;
                    color: #444;
                }
                #btnTestNotif{
                    background-color: #ffcc00;
                    color: #333;
                }
                #btnLogout{
                    background-color: #ff4444;
                    color: #fff;
                }
            `
        }else{
            style += `
                header a{
                    position: relative;
                    right: 5%;
                    margin-left: auto;
                    text-decoration: none;
                    color: #fff;
                }
                header a:hover{
                    text-decoration: underline;
                }
            `
        }
        return style;
    }
    const authRender = () => {
        if(checkAuth()){
            return `
                <a href="#main-content" class="skip-link">Skip to main content</a>
                <div>
                <a href="/saved" class="pageChange">Saved Stories</a>
                <button id="btnSubscribe">Subscribe</button>
                <button id="btnTestNotif">Test Notif</button>
                <span>${getAuth().name}</span>
                <button id="btnLogout">Logout</button>
                </div>
            `;
        }else{
            return `
                <a href="#main-content" class="skip-link">Skip to main content</a>
                <a href="/login">Login</a>
            `;
        }
    }
    const render = () => {
        removeStyle('css-header');
        injectStyle(headerCss(), 'css-header');
        return `
            <header>
            <h1>Dicoding Story</h1>
            ${authRender()}
            </header>
        `;
    }
    const afterRender = async () => {
        const mainContent = document.querySelector("#main-content"); 
        const skipLink = document.querySelector(".skip-link"); 
        skipLink.addEventListener("click", function (event) {
            event.preventDefault();
            skipLink.blur();
            mainContent.focus();
            mainContent.scrollIntoView();
        });
        
        // Add event listener for subscribe button
        const subscribeButton = document.querySelector('#btnSubscribe');
        if (subscribeButton) {
            subscribeButton.addEventListener('click', async () => {
                try {
                    console.log('Subscribe button clicked');
                    await subscribe();
                    
                    // Update button text based on subscription status
                    const isSubscribed = await isCurrentPushSubscriptionAvailable();
                    if (isSubscribed) {
                        subscribeButton.textContent = 'Unsubscribe';
                        subscribeButton.id = 'btnUnsubscribe';
                    }
                } catch (error) {
                    console.error('Error subscribing to notifications:', error);
                    PopupComponent('Gagal berlangganan notifikasi', 'error');
                }
            });
        }
        
        // Add event listener for unsubscribe button
        const unsubscribeButton = document.querySelector('#btnUnsubscribe');
        if (unsubscribeButton) {
            unsubscribeButton.addEventListener('click', async () => {
                try {
                    console.log('Unsubscribe button clicked');
                    await unsubscribe();
                    
                    // Update button text based on subscription status
                    const isSubscribed = await isCurrentPushSubscriptionAvailable();
                    if (!isSubscribed) {
                        unsubscribeButton.textContent = 'Subscribe';
                        unsubscribeButton.id = 'btnSubscribe';
                    }
                } catch (error) {
                    console.error('Error unsubscribing from notifications:', error);
                    PopupComponent('Gagal berhenti berlangganan notifikasi', 'error');
                }
            });
        }
        
        // Add event listener for test notification button
        const testNotifButton = document.querySelector('#btnTestNotif');
        if (testNotifButton) {
            testNotifButton.addEventListener('click', async () => {
                try {
                    console.log('Test notification button clicked');
                    PopupComponent('Mengirim notifikasi test...', 'info');
                    
                    const result = await testPushNotification();
                    console.log('Test notification result:', result);
                    
                    if (result.ok) {
                        PopupComponent('Notifikasi test berhasil dikirim!', 'success');
                    } else {
                        PopupComponent(`Gagal mengirim notifikasi: ${result.message || 'Unknown error'}`, 'error');
                    }
                } catch (error) {
                    console.error('Error testing notification:', error);
                    PopupComponent('Gagal mengirim notifikasi test', 'error');
                }
            });
        }
        
        // Check subscription status on load and update button accordingly
        if (checkAuth()) {
            try {
                const isSubscribed = await isCurrentPushSubscriptionAvailable();
                const subscribeBtn = document.querySelector('#btnSubscribe');
                if (subscribeBtn && isSubscribed) {
                    subscribeBtn.textContent = 'Unsubscribe';
                    subscribeBtn.id = 'btnUnsubscribe';
                }
            } catch (error) {
                console.error('Error checking subscription status:', error);
            }
        }
        
        // Add event listener for logout button
        const logoutButton = document.querySelector('#btnLogout');
        if (logoutButton) {
            logoutButton.addEventListener('click', logout);
        }
    }
    const logout = async() => {
        resetAuth();
        PopupComponent('Success Logout', 'success');
        setTimeout(() => {
            window.navigate('/login');
        }, 2500);
    }
    return { render, afterRender, logout };
}