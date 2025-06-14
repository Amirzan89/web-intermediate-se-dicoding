import { TambahPostApi } from '../composables/Api';
import PopupComponent from '../components/Popup';
export default () => {
    const tambahForm = async(description, photo, lat, lng) => {
        let isLoadingForm = false;
        if(isLoadingForm) return;
        const res = await TambahPostApi(description, photo, lat, lng);
        if(res.error){
            return PopupComponent(res.message, 'error');
        }
        PopupComponent(res.message, 'success');
        setTimeout(() => {
            window.navigate('/');
        }, 2500);
    }
    return { tambahForm }
}