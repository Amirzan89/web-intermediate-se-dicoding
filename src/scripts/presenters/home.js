import PostModel from '../models/post';
import { ListGetApi } from '../composables/Api';
import PopupComponent from '../components/Popup';
const model = PostModel();
export default () => {
    const fetchData = async() => {
        let curList = model.getCache();
        if(!curList || Object.keys(curList).length === 0){
            const res = await ListGetApi();
            if(res.error){
                return [];
            }
            model.updateCache(res.listStory);
            return res.listStory;
        }
        return curList;
    }
    const resetCache = () => {
        model.resetCache();
        PopupComponent('Success Reset', 'success');
        return true;
    }
    return { fetchData, resetCache }
}