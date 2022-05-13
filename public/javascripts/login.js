const login = document.getElementById('login_form_button');
if (login) {
    login.addEventListener('click', async (event) => {
        event.preventDefault();

        const formLogin = document.getElementById('login_form');
        const formData = new FormData(formLogin);

        await axios
            .post('/login', Object.fromEntries(formData))
            .then((response) => {
                window.location = response.data.url;
            })
            .catch((err) => console.log(`Login: ${err}`));

        // FETCH WAY
        // const data = new URLSearchParams(new FormData(formLogin));
        //
        // console.log(Object.fromEntries(formData));
        // await fetch('/login', {
        //     method: 'POST',
        //     body: data,
        //     // mode: 'cors', // no-cors, *cors, same-origin
        //     // credentials: 'same-origin', // include, *same-origin, omit
        //     headers: {
        //         // 'content-type': 'text/json',
        //         'Content-Type': 'application/x-www-form-urlencoded',
        //     },
        // })
        //     .then((response) => {
        //         console.log(response);
        //     });
    });
}
