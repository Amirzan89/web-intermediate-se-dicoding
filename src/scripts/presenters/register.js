import { RegisterApi } from '../composables/Api';
import PopupComponent from '../components/Popup';
export default async(name, email, password) => {
    const res = await RegisterApi(name, email, password);
    if(res.error){
        return PopupComponent(res.message, 'error');
    }
    PopupComponent(res.message, 'success');
    setTimeout(() => {
        window.navigate('/login');
    }, 2500);
}