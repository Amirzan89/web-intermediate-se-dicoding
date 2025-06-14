import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PostModels from '../models/post';
const post = PostModels();
export default () => {
    const useMap = () => {
        const map = L.map('map', {
            center: [0, 0],
            zoom: 2,
            dragging: true,
            zoomControl: true,
            scrollWheelZoom: true,
            doubleClickZoom: true,
            boxZoom: false,
            keyboard: false,
            tap: false,
            touchZoom: false,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        return map;
    }
    const chooseMap = () => {
        const map = useMap();
        let marker;
        map.on('click', function(e){
            const { lat, lng } = e.latlng;
            if(marker){
                map.removeLayer(marker);
            }
            marker = L.marker([lat, lng]).addTo(map);
            document.getElementById('inpLat').value = lat;
            document.getElementById('inpLng').value = lng;
        });
    }
    const isValidCoordinate = (lat, lng) => {
        return(typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180);
    };
    const listMap = (inpList) => {
        const map = useMap();
        inpList.forEach(item => {
            if(!isValidCoordinate(item.lat, item.lng)){
                console.warn(`Invalid coordinate skipped: lat=${item.lat}, lng=${item.lng}`);
                post.resetCache();
                return;
            }
            const popupContent = `
                <div class="leaflet-popup-content">
                    <img src="${item.img}" alt="${item.description}">
                    <h3>${item.description}</h3>
                    <a class="pageChange" href="${'/details/' + item.id}">View Post</a>
                </div>
            `;
            const marker = L.marker([item.lat, item.lng]).addTo(map);
            marker.bindPopup(popupContent);
        });
    }
    const detailMap = (lat, lng) => {
        const map = useMap();
        L.marker([lat, lng]).addTo(map);
    }
    return { chooseMap, listMap, detailMap };
}