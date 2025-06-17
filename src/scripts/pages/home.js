import HomeCss from '../../assets/styles/home.css?raw';
import { injectStyle, removeStyle } from '../utils';
import { checkAuth } from '../composables/Auth';
import MapComposables from '../composables/Map';
import HomePresenter from '../presenters/home';
import HeaderComposables from '../composables/Header';
import FooterComponent from '../components/Footer';
import IdbHelper from '../utils/idb';
import PopupComponent from '../components/Popup';
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
                <div class="card-actions">
                <a class="pageChange" href="/details/${id}">Details</a>
                    <button class="save-btn" data-id="${id}" data-name="${name}" data-desc="${desc}" data-img="${img}" data-lat="${lat}" data-lng="${lng}" data-timestamp="${timestamp}">Save</button>
                </div>
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
        addSaveButtonListeners();
    }
    const addSaveButtonListeners = async() => {
        const saveButtons = document.querySelectorAll('.save-btn');
        for(const btn of saveButtons) {
            const storyId = btn.dataset.id;
            const isPresent = await IdbHelper.isStoryPresentSaved(storyId);
            btn.textContent = isPresent ? 'Unsave' : 'Save';
            btn.style.backgroundColor = isPresent ? '#ff4444' : '#4CAF50';
            
            btn.addEventListener('click', async() => {
                const isCurrentlyPresent = await IdbHelper.isStoryPresentSaved(storyId);
                if(isCurrentlyPresent) {
                    await IdbHelper.deleteStory(storyId);
                    btn.textContent = 'Save';
                    btn.style.backgroundColor = '#4CAF50';
                    PopupComponent('Story removed from saved', 'success');
                } else {
                    const storyData = {
                        id: btn.dataset.id,
                        name: btn.dataset.name,
                        description: btn.dataset.desc,
                        photoUrl: btn.dataset.img,
                        lat: btn.dataset.lat,
                        lon: btn.dataset.lng,
                        createdAt: btn.dataset.timestamp
                    };
                    await IdbHelper.saveStory(storyData);
                    btn.textContent = 'Unsave';
                    btn.style.backgroundColor = '#ff4444';
                    PopupComponent('Story saved to IndexedDB', 'success');
                }
            });
        }
    }
    const afterRender = async() => {
        removeStyle('css-page');
        injectStyle(HomeCss, 'css-page');
        await HeaderComposable.afterRender();
        const app = document.getElementById('app');
        let isReset = false;
        if(checkAuth()){
            app.querySelector('button#btnLogout').addEventListener('click', async() => HeaderComposable.logout());
        }
        listMapRender();
        await addSaveButtonListeners();
        app.querySelector('button#btnResetCache').addEventListener('click', async(e) => {
            if(isReset) return;
            isReset = true;
            if(presenter.resetCache()){
                await reRenderList();
                setTimeout(() => {
                    isReset = false;
                }, 100);
            }
        });
    }
    return { render, afterRender }
}