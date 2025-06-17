import HomeCss from '../../assets/styles/home.css?raw';
import { injectStyle, removeStyle } from '../utils';
import { checkAuth } from '../composables/Auth';
import HeaderComposables from '../composables/Header';
import FooterComponent from '../components/Footer';
import IdbHelper from '../utils/idb';
import PopupComponent from '../components/Popup';

const HeaderComposable = HeaderComposables();

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
                    <button class="remove-btn" data-id="${id}">Remove</button>
                </div>
            </div>
        `;
    }

    const hydrate = async() => {
        const savedStories = await IdbHelper.getAllStories();
        if(savedStories.length === 0) {
            return '<p>No saved stories yet. Go to <a href="/" class="pageChange">Home</a> to save some stories!</p>';
        }
        let listItem = '';
        listItem += savedStories.map((item, i) => templateItem(item.id, item.name, item.description, item.photoUrl, item.lat, item.lon, item.createdAt, i));
        return listItem;
    }

    const render = async() => {
        return `
        ${HeaderComposable.render()}
        <main id="main-content">
            <div>
                <h2>Saved Stories (IndexedDB)</h2>
                <a class="pageChange" href="/">Back to Home</a>
                <div id="list-items">${await hydrate()}</div>
                <div>
                    <button id="btnClearAll">Clear All Saved Stories</button>
                </div>
            </div>
        </main>
        ${FooterComponent}
        `;
    }

    const reRenderList = async() => {
        const listWrapper = document.getElementById('list-items');
        listWrapper.innerHTML = await hydrate();
        addRemoveButtonListeners();
    }

    const addRemoveButtonListeners = () => {
        const removeButtons = document.querySelectorAll('.remove-btn');
        removeButtons.forEach(btn => {
            btn.style.backgroundColor = '#ff4444';
            btn.style.color = '#fff';
            btn.style.border = 'none';
            btn.style.padding = '5px 10px';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            
            btn.addEventListener('click', async() => {
                const storyId = btn.dataset.id;
                await IdbHelper.deleteStory(storyId);
                PopupComponent('Story removed from saved', 'success');
                await reRenderList();
            });
        });
    }

    const afterRender = async() => {
        removeStyle('css-page');
        injectStyle(HomeCss + `
            .card-actions {
                display: flex;
                gap: 10px;
                margin-top: 10px;
            }
            .card-actions a, .card-actions button {
                padding: 5px 10px;
                text-decoration: none;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            }
            .card-actions a {
                background-color: #4CAF50;
                color: white;
            }
            #btnClearAll {
                background-color: #ff4444;
                color: white;
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                margin-top: 20px;
            }
        `, 'css-page');
        
        await HeaderComposable.afterRender();
        const app = document.getElementById('app');
        
        if(checkAuth()){
            app.querySelector('button#btnLogout').addEventListener('click', async() => HeaderComposable.logout());
        }

        addRemoveButtonListeners();

        app.querySelector('button#btnClearAll').addEventListener('click', async() => {
            if(confirm('Are you sure you want to clear all saved stories?')) {
                await IdbHelper.clearAllSavedStories();
                PopupComponent('All saved stories cleared', 'success');
                await reRenderList();
            }
        });
    }

    return { render, afterRender }
} 