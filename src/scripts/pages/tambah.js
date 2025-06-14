import TambahCss from '@/assets/styles/tambah.css?raw';
import { injectStyle, removeStyle } from '../utils';
import { checkAuth } from '../composables/Auth';
import TambahPresenter from '../presenters/tambah';
import HeaderComposables from '../composables/Header';
import CameraComposables from '../composables/Camera';
import MapComposables from '../composables/Map';
import FooterComponent from '../components/Footer';
const presenter = TambahPresenter();
const HeaderComposable = HeaderComposables();
const camera = CameraComposables();
const { chooseMap } = MapComposables();
export default () => {
    const render = () => {
        return `
            ${HeaderComposable.render()}
            <main id="main-content">
                <form id="tambahForm">
                    <h2>Tambah Story</h2>
                    <div>
                        <label for="inpDesc">Description</label>
                        <textarea name="description" id="inpDesc"></textarea>
                    </div>
                    <div>
                        <div id="camera-wrapper">
                            <video id="camera-video" class="camera__video">Video stream not available.</video>
                            <canvas id="camera-canvas" class="camera__canvas"></canvas>
                            <button type="button" id="openCameraBtn">Open Camera</button>
                            <div>
                                <img id="camera" src="" alt="cameraWrapper">
                            </div>
                            <button type="button" id="captureBtn">Capture</button>
                        </div>
                        <div id="img-wrapper">
                            <img id="ImgShow" src="" alt="result">
                            <button type="button" id="retakeBtn">Retake Photo</button>
                        </div>
                        <input type="file" id="inpImg">
                    </div>
                    <div>
                        <input type="hidden" name="latitude" id="inpLat">
                        <input type="hidden" name="longitude" id="inpLng">
                        <div id="wrap-map">
                            <span>Story Location</span>
                            <div>
                                <div id="map"></div>
                            </div>
                        </div>
                    </div>
                    <button type="submit">Submit</button>
                    <a href="/">Back To Home</a>
                </form>
            </main>
            ${FooterComponent}
        `;
    }
    const afterRender = () => {
        removeStyle('css-page');
        injectStyle(TambahCss, 'css-page');
        HeaderComposable.afterRender();
        const app = document.getElementById('app');
        if(checkAuth()){
            app.querySelector('button#btnLogout').addEventListener('click', async() => HeaderComposable.logout());
        }
        chooseMap();
        const cameraVideo = document.getElementById('camera-video');
        const cameraCanvas = document.getElementById('camera-canvas');
        const openCameraBtn = document.getElementById('openCameraBtn');
        const captureBtn = document.getElementById('captureBtn');
        const retakeBtn = document.getElementById('retakeBtn');
        const inpImg = document.getElementById('inpImg');
        window.streamCamera = null;
        captureBtn.style.display = 'none';
        retakeBtn.style.display = 'none';
        openCameraBtn.addEventListener('click', async(e) => {
            e.preventDefault(); 
            window.streamCamera = await camera.init(cameraVideo);
            cameraVideo.style.display = 'block';
            camera.startup(cameraVideo, cameraCanvas, captureBtn, captureBtn, inpImg, openCameraBtn, captureBtn, retakeBtn);
        });
        retakeBtn.addEventListener('click', async() => {
            inpImg.value = '';
            const ctx = cameraCanvas.getContext('2d');
            ctx.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
            cameraCanvas.style.display = 'none';
            cameraVideo.style.display = 'none';
            captureBtn.style.display = 'none';
            retakeBtn.style.display = 'none';
            openCameraBtn.style.display = 'block';
        });
        inpImg.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    cameraCanvas.width = img.width;
                    cameraCanvas.height = img.height;
                    const ctx = cameraCanvas.getContext('2d');
                    ctx.clearRect(0, 0, cameraCanvas.width, cameraCanvas.height);
                    ctx.drawImage(img, 0, 0);
                    camera.stopCameraStream(cameraVideo, captureBtn);
                    cameraCanvas.style.display = 'block';
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
        let isLoadingForm = false;
        app.querySelector('form#tambahForm').addEventListener('submit', async(e) => {
            e.preventDefault();
            if(isLoadingForm) return;
            isLoadingForm = true;
            const desc = app.querySelector('#inpDesc').value;
            const lat = app.querySelector('#inpLat').value;
            const lng = app.querySelector('#inpLng').value;
            const fileInput = inpImg.files[0];
            if (!fileInput) {
                alert("Please take or upload a photo.");
                return;
            }
            await presenter.tambahForm(desc, fileInput, lat, lng);
            isLoadingForm = false;
        });
    }
    return { render, afterRender }
}