window.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('overlay');
    const rulesBtn = document.getElementById('rules-btn');
    const closeBtn = document.getElementById('close-btn');
    const toggleModal = () => {
        overlay.classList.toggle('hidden');
    };
    if (overlay) {
        window.addEventListener(
            'keydown',
            (e) => {
                console.log(e.key);
                if (e.key === 'Escape') {
                    overlay.classList.add('hidden');
                }
            },
            true,
        );
    }

    rulesBtn.addEventListener('click', toggleModal);
    closeBtn.addEventListener('click', toggleModal);
});
