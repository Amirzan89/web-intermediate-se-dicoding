export const checkAuth = () => {
    return Boolean(localStorage.getItem('userId') && localStorage.getItem('name') && localStorage.getItem('token'));
}
export const getAuth = () => {
    const userId = localStorage.getItem('userId');
    const name = localStorage.getItem('name');
    const token = localStorage.getItem('token');
    return { userId, name, token};
}
export const updateAuth = (inp) => {
    localStorage.setItem('userId', inp.userId);
    localStorage.setItem('name', inp.name);
    localStorage.setItem('token', inp.token);
}
export const resetAuth = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    localStorage.removeItem('token');
    localStorage.removeItem('list-item');
}