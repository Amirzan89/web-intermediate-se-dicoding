import bgImage from '../assets/img/lo-reg.jpg?url';
export const injectStyle = (css, id) => {
    if(document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    if(id == 'css-page'){
        style.textContent += `
            body::before {
                content: "";
                background: url('${bgImage}') no-repeat center center/cover;
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: -1;
            }
        `;
    }
    document.head.appendChild(style);
};
export const removeStyle = (id) => {
    const style = document.head.querySelector(`style#${id}`);
    if(style) style.remove();
};
export function setupSkipToContent(element, mainContent){
    element.addEventListener('click', () => mainContent.focus());
}
export function transitionHelper({ skipTransition = false, updateDOM }){
    if(skipTransition || !document.startViewTransition){
        const updateCallbackDone = Promise.resolve(updateDOM()).then(() => {});
        return {
            ready: Promise.reject(Error('View transitions unsupported')),
            updateCallbackDone,
            finished: updateCallbackDone,
        };
    }
    return document.startViewTransition(updateDOM);
}