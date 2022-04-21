window.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('overlay');
    const rulesBtn = document.getElementById('rules-btn');
    const closeBtn = document.getElementById('close-btn');
    const toggleModal = () => {
        overlay.classList.toggle('hidden');
    };
    rulesBtn.addEventListener('click', toggleModal);
    closeBtn.addEventListener('click', toggleModal);
});
