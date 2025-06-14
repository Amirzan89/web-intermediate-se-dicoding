import { injectStyle, removeStyle } from '../utils';
import { checkAuth, getAuth, resetAuth } from '../composables/Auth';
import PopupComponent from '../components/Popup';
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
                    gap: 20px;
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
    const afterRender = () => {
        const mainContent = document.querySelector("#main-content"); 
        const skipLink = document.querySelector(".skip-link"); 
        skipLink.addEventListener("click", function (event) {
            event.preventDefault();
            skipLink.blur();
            mainContent.focus();
            mainContent.scrollIntoView();
        });
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