export default () => {
    const getCache = () => {
        return JSON.parse(localStorage.getItem('list-item'));
    }
    const updateCache = (fetch) => {
        localStorage.setItem('list-item', JSON.stringify(fetch));
    }
    const resetCache = () => {
        localStorage.setItem('list-item', null);
    }
    return { getCache, updateCache, resetCache }
}