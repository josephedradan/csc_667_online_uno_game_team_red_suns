const fadeOutFlashMessage = (msg) => {
    setTimeout(() => {
        let currentOpacity = 1.0;
        const timer = setInterval(() => {
            if (currentOpacity < 0.05) {
                clearInterval(timer);
                msg.remove();
            }
            currentOpacity -= 0.05;
            msg.style.opacity = currentOpacity;
            // console.log(msg.style.opacity);
        }, 50);
    }, 2000);
};

const flash_message = document.getElementById('flash-message');
if (flash_message) {
    fadeOutFlashMessage(flash_message);
}
