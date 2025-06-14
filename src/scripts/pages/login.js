import LoginCss from '../../assets/styles/login.css?raw';
import { injectStyle, removeStyle } from '../utils';
import LoginPresenter from '../presenters/login';
export default () => {
    const render = () => {
        return `
            <main id="main-content">
                <form id="loginForm">
                    <div>
                        <label for="inpEmail">Email</label>
                        <input type="email" id="inpEmail">
                    </div>
                    <div>
                        <label for="inpPassword">Password</label>
                        <input type="password" id="inpPassword">
                    </div>
                    <button>Login</button>
                    <span>Belum punya akun ? <a class="pageChange" href="/register">Daftar</a></span>
                </form>
            </main>
        `;
    }
    const afterRender = () => {
        removeStyle('css-page');
        injectStyle(LoginCss, 'css-page');
        const app = document.getElementById('app');
        let isLoadingForm = false;
        app.querySelector('form#loginForm').addEventListener('submit', async(e) => {
            e.preventDefault();
            e.stopPropagation();
            if(isLoadingForm) return;
            isLoadingForm = true;
            const email = app.querySelector('#inpEmail').value;
            const password = app.querySelector('#inpPassword').value;
            await LoginPresenter(email, password);
            isLoadingForm = false;
        });
    }
    return { render, afterRender }
}