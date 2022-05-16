const challenge = document.getElementById('challenge');

if (challenge) {
    challenge.addEventListener('click', async () => {
        await axios.post(`${getGameId()}/challenge`, {});
    });
}
