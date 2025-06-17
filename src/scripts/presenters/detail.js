import { DetailGetApi } from '../composables/Api';
import MapComposables from '../composables/Map';
import PopupComponent from '../components/Popup';
const MapComposable = MapComposables();
export default () => {
    const fetchData = async(id) => {
        const res = await DetailGetApi(id);
        if(res.error){
            PopupComponent(res.message, 'error');
            if(res.code == 404){
                return { error: true, message: res.message, code: res.code, dom: '<h1>404 Not Found</h1>' };
            }
            return { error: true, message: res.message, code: res.code, dom: `<h1>${res.code} Something went wrong</h1>` };
        }
        return res;
    }
    const renderDetailMap = (lat, lng) => {
        const map = MapComposable.detailMap(lat, lng);
        return map;
    }
    return { fetchData, renderDetailMap };
}