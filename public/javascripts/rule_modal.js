window.addEventListener("DOMContentLoaded", () => {
    const overlay = document.querySelector("#overlay");
    const rulesBtn = document.querySelector("#rules-btn");
    const closeBtn = document.querySelector("#close-btn");
    const toggleModal = () => {
        overlay.classList.toggle("hidden");
    };
    rulesBtn.addEventListener("click", toggleModal);
    closeBtn.addEventListener("click", toggleModal);
});
