import RegisterCss from '@/assets/styles/register.css?raw';
import { injectStyle, removeStyle } from '../utils';
import RegisterPresenter from '../presenters/register';
export default () => {
    const render = () => {
        return `
            <main id="main-content">
                <form id="registerForm">
                    <div>
                        <label for="inpName">name</label>
                        <input type="text" id="inpName">
                    </div>
                    <div>
                        <label for="inpEmail">Email</label>
                        <input type="email" id="inpEmail">
                    </div>
                    <div>
                        <label for="inpPassword">Password</label>
                        <input type="password" id="inpPassword">
                    </div>
                    <button>Register</button>
                    <span>Sudah punya akun ? <a class="pageChange" href="/login">Masuk</a></span>
                </form>
            </main>
        `;
    }
    const afterRender = () => {
        removeStyle('css-page');
        injectStyle(RegisterCss, 'css-page');
        const app = document.getElementById('app');
        let isLoadingForm = false;
        app.querySelector('form#registerForm').addEventListener('submit', async(e) => {
            e.preventDefault();
            if(isLoadingForm) return;
            isLoadingForm = true;
            const name = app.querySelector('#inpName').value;
            const email = app.querySelector('#inpEmail').value;
            const password = app.querySelector('#inpPassword').value;
            await RegisterPresenter(name, email, password);
            isLoadingForm = false;
        });
    }
    return { render, afterRender }
}