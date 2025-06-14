import { LoginApi } from '../composables/Api';
import PopupComponent from '../components/Popup';
import { updateAuth } from '../composables/Auth';
export default async(email, password) => {
    const res = await LoginApi(email, password);
    if(res.error){
        return PopupComponent(res.message, 'error');
    }
    updateAuth(res.loginResult);
    PopupComponent(res.message, 'success');
    setTimeout(() => {
        window.navigate('/');
    }, 2500);
}