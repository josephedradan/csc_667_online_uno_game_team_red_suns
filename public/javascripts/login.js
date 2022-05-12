const login = document.getElementById('login_form_button');

login.addEventListener('click', async (event) => {
    event.preventDefault();

    const formLogin = document.getElementById('login_form');
    const formData = new FormData(formLogin);

    // for (const value of formData.entries()) {
    //     console.log(value);
    // }

    // AXIOS WAY
    const response = await axios.post(
        '/login',
        Object.fromEntries(formData),
        // {
        //     headers:
        //         { accept: 'application/json',
        //
        //         },
        // },
    ); // TODO: GUARD AND CLEANUP
    // console.log(response.data)
    window.location = response.data.url;

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
