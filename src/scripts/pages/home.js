import HomeCss from '../../assets/styles/home.css?raw';
import { injectStyle, removeStyle } from '../utils';
import { checkAuth } from '../composables/Auth';
import MapComposables from '../composables/Map';
import HomePresenter from '../presenters/home';
import HeaderComposables from '../composables/Header';
import FooterComponent from '../components/Footer';
const presenter = HomePresenter();
const HeaderComposable = HeaderComposables();
const MapComposable = MapComposables();
export default async() => {
    const templateItem = (id, name, desc, img, lat, lng, timestamp, number) => {
        return `
            <div class="card" id="item${number}">
                <img src="${img}" alt="${name}'s Story">
                <div>
                    <h3>${name != 'Guest' ? `${name}'s` : 'Guest' } Story</h3>
                    <span>${desc}</span>
                    <span>Posted on: ${new Date(timestamp).toLocaleString()} </span>
                    <span>Location: ${lat}, ${lng}</span>
                </div>
                <a class="pageChange" href="/details/${id}">Details</a>
            </div>
        `;
    }
    const hydrate = async() => {
        let listItem = '';
        listItem += (await presenter.fetchData()).map((item, i) => templateItem(item.id, item.name, item.description, item.photoUrl, item.lat, item.lon, item.createdAt, i));
        return listItem;
    }
    const render = async() => {
        return `
        ${HeaderComposable.render()}
        <main id="main-content">
            <div>
            <h2>Dicoding Stories</h2>
                <a class="pageChange" href="/tambah">Tambah</a>
                <div id="list-items">${await hydrate()}</div>
                <div id="wrap-map">
                    <span>Story Location</span>
                    <div>
                        <div id="map"></div>
                    </div>
                </div>
                <div>
                    <button id="btnResetCache">Reset Cache</button>
                </div>
            </div>
        </main>
        ${FooterComponent}
        `;
    }
    const listMapRender = async() => {
        return MapComposable.listMap((await presenter.fetchData()).map(item => {
            return { id: item.id, description: item.description, img: item.photoUrl, lat: item.lat, lng: item.lon };
        }));
    }
    const reRenderList = async() => {
        const listWrapper = document.getElementById('list-items');
        listWrapper.innerHTML = await hydrate();
    }
    const afterRender = () => {
        removeStyle('css-page');
        injectStyle(HomeCss, 'css-page');
        HeaderComposable.afterRender();
        const app = document.getElementById('app');
        let isReset = false;
        if(checkAuth()){
            app.querySelector('button#btnLogout').addEventListener('click', async() => HeaderComposable.logout());
        }
        listMapRender();
        app.querySelector('button#btnResetCache').addEventListener('click', async(e) => {
            if(isReset) return;
            isReset = true;
            if(await presenter.resetCache()){
                await reRenderList();
                setTimeout(() => {
                    isReset = false;
                }, 100);
            }
        });
    }
    return { render, afterRender }
}