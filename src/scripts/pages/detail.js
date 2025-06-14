import DetailCss from '@/assets/styles/detail.css?raw';
import { injectStyle, removeStyle } from '../utils';
import { checkAuth } from '../composables/Auth';
import DetailPresenter from '../presenters/detail';
import HeaderComposables from '../composables/Header';
import FooterComponent from '../components/Footer';
const HeaderComposable = HeaderComposables();
const presenter = DetailPresenter();
export default () => {
    const render = async(id) => {
        const fetchDataCom = await presenter.fetchData(id);
        if(fetchDataCom.error){
            return fetchDataCom;
        }
        return `
            ${HeaderComposable.render()}
            <main id="main-content">
                <div>
                    <h2>Detail Story</h2>
                    <div>
                        <div id="wrap-img">
                            <img src="${fetchDataCom.story.photoUrl}" alt="${fetchDataCom.story.name}'s Story">
                        </div>
                        <h3>Story Details</h3>
                        <div>
                            <h3>${fetchDataCom.story.name != 'Guest' ? `${fetchDataCom.story.name}'s` : 'Guest' } Story</h3>
                            <p>${fetchDataCom.story.description}</p>
                            <p>Posted on: ${new Date(fetchDataCom.story.createdAt).toLocaleString()}</p>
                            <p>Location: ${fetchDataCom.story.lat}, ${fetchDataCom.story.lon}</p>
                        </div>
                    </div>
                <div>
                    <div id="wrap-map">
                        <span>Story Location</span>
                        <div>
                            <div id="map"></div>
                        </div>
                    </div>
                </div>
                    <a class="pageChange" href="/">Back To Home</a>
                </div>
            </main>
            ${FooterComponent}
        `;
    }
    const afterRender = async(id) => {
        removeStyle('css-page');
        injectStyle(DetailCss, 'css-page');
        HeaderComposable.afterRender();
        const app = document.getElementById('app');
        if(checkAuth()){
            app.querySelector('button#btnLogout').addEventListener('click', async() => HeaderComposable.logout());
        }
        const fetchDataCom = await presenter.fetchData(id);
        presenter.renderDetailMap(fetchDataCom.story.lat, fetchDataCom.story.lon);
    }
    return { render, afterRender }
}