import config from '../config';
import { checkAuth } from './Auth';
export const LoginApi = async(email, password) => {
    const res = await fetch(config.BASE_URL + '/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    if(!res.ok){
        return JSON.parse(await res.text());
    }
    return res.json();
}
export const RegisterApi = async(name, email, password) => {
    const res = await fetch(config.BASE_URL + '/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
    });
    if(!res.ok){
        return JSON.parse(await res.text());
    }
    return res.json();
}
export const TambahPostApi = async(description, photo, lat, lon) => {
    const formData = new FormData();
    formData.append('description', description);
    if(photo){
        formData.append('photo', photo);
    }
    formData.append('lat', lat);
    formData.append('lon', lon);
    const res = await fetch(config.BASE_URL + '/stories' + (checkAuth() ? '' : '/guest'), {
        method: 'POST',
        headers: {
            ...(localStorage.getItem('token') && { 'Authorization': `Bearer ${localStorage.getItem('token')}` }),
        },
        body: formData,
    });
    if(!res.ok){
        return JSON.parse(await res.text());
    }
    return res.json();
}
export const ListGetApi = async() => {
    const res = await fetch(config.BASE_URL + '/stories', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });
    if(!res.ok){
        return { ...JSON.parse(await res.text()), code: res.status};
    }
    return res.json();
}
export const DetailGetApi = async(id) => {
    const res = await fetch(config.BASE_URL + '/stories/' + id, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
    });
    if(!res.ok){
        return { ...JSON.parse(await res.text()), code: res.status};
    }
    return res.json();
}