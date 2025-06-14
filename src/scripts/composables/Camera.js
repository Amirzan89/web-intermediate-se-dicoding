export default () => {
    let width = 320;
    let height = 0;
    let streaming = false;
    const stopCameraStream = (cameraVideo, captureBtn) => {
        if(window.streamCamera){
            captureBtn.style.display = 'none';
            const tracks = window.streamCamera.getTracks();
            tracks.forEach((track) => track.stop());
            window.streamCamera = null;
            cameraVideo.pause();
            cameraVideo.srcObject = null;
        }
    };
    const startup = (cameraVideo, cameraCanvas, cameraTakeButton, cameraSaveButton, targetInput, openCameraBtn, captureBtn, retakeBtn) => {
        function cameraTakePicture(){
            const context = cameraCanvas.getContext('2d');
            if(context){
                cameraCanvas.style.display = 'block';
                cameraCanvas.width = cameraVideo?.videoWidth;
                cameraCanvas.height = cameraVideo?.videoHeight;
                context.drawImage(cameraVideo, 0, 0, cameraVideo.videoWidth, cameraVideo.videoHeight);
            }
        }
        function cameraSavePicture(targetInput){
            fetch(cameraCanvas.toDataURL('image/png')).then((res) => res.blob()).then((blob) => {
                const file = new File([blob], "image.png", { type: "image/png" });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                targetInput.files = dataTransfer.files;
                retakeBtn.style.display = 'block';
                stopCameraStream(cameraVideo, captureBtn);
            }).catch((err) => {
                console.error('Error converting data URL to Blob:', err);
            });
        }
        openCameraBtn.style.display = 'none';
        captureBtn.style.display = 'block';
        cameraVideo.style.display = 'block';
        cameraTakeButton?.addEventListener('click', () => {
            cameraTakePicture();
        });
        cameraSaveButton?.addEventListener('click', () => {
            cameraSavePicture(targetInput);
        });
        cameraVideo.addEventListener('canplay', () => {
            if(streaming){
                return;
            }
            height = (cameraVideo.videoHeight * width) / cameraVideo.videoWidth;
            cameraVideo.setAttribute('width', width.toString());
            cameraVideo.setAttribute('height', height.toString());
            cameraCanvas.setAttribute('width', width.toString());
            cameraCanvas.setAttribute('height', height.toString());
            streaming = true;
        });
    }
    const getStream = async() => {
        try{
            return await navigator.mediaDevices.getUserMedia({
                video: true,
            });
        }catch(error){
            throw error;
        }
    }
    const cameraLaunch = (cameraVideo, stream) => {
        cameraVideo.srcObject = stream;
        cameraVideo.play();
    }
    const init = async(cameraVideo) => {
        const stream = await getStream();
        cameraLaunch(cameraVideo, stream);
        return stream;
    }
    return { init, startup, stopCameraStream };
}