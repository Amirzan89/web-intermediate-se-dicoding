import { DetailGetApi } from '../composables/Api';
import MapComposables from '../composables/Map';
import PopupComponent from '../components/Popup';
import IdbHelper from '../utils/idb';
const MapComposable = MapComposables();
export default () => {
    const fetchData = async(id) => {
        try {
            const res = await DetailGetApi(id);
            if(res.error){
                const offlineStory = await IdbHelper.getStory(id);
                if(offlineStory){
                    return { story: offlineStory };
                }
                PopupComponent(res.message, 'error');
                if(res.code == 404){
                    return { error: true, message: res.message, code: res.code, dom: '<h1>404 Not Found</h1>' };
                }
                return { error: true, message: res.message, code: res.code, dom: `<h1>${res.code} Something went wrong</h1>` };
            }
            await IdbHelper.saveStory(res.story);
            return res;
        } catch (error) {
            const offlineStory = await IdbHelper.getStory(id);
            if(offlineStory){
                return { story: offlineStory };
            }
            PopupComponent('No internet connection and no offline data', 'error');
            return { error: true, message: 'Network error', code: 500, dom: '<h1>500 Network Error</h1>' };
        }
    }
    const renderDetailMap = (lat, lng) => {
        const map = MapComposable.detailMap(lat, lng);
        return map;
    }
    return { fetchData, renderDetailMap };
}