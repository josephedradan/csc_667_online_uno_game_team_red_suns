const login = document.getElementById('login_form_button');

login.addEventListener('click', async (event) => {
    event.preventDefault();

    const formLogin = document.getElementById('login_form');
    const formData = new FormData(formLogin);

    // for (const value of formData.entries()) {
    //     console.log(value);
    // }

    const response = await axios.post('/login', Object.fromEntries(formData)); // TODO: GUARD AND CLEANUP
    // console.log(response.data)
    window.location = response.data.url;
});
