export default (message, type) => {
    const fadeOutAndRemove = (el) => {
        el.classList.remove('fade-in');
        el.classList.add('fade-out');
        el.addEventListener('animationend', () => {
            el.remove();
        });
    };
    const existingPopup = document.querySelector('.popup');
    if(existingPopup) return;
    const container = document.createElement('div');
    container.id = `${type}-popup`;
    container.classList = 'popup fade-in';
    container.innerHTML = `
        <div><p>${message}</p></div>
        <div id="closePopup">X</div>
    `;
    container.querySelector('#closePopup').addEventListener('click', () => {
        fadeOutAndRemove(container);
    });
    setTimeout(() => {
        fadeOutAndRemove(container);
    }, 2500);
    document.body.appendChild(container);
}