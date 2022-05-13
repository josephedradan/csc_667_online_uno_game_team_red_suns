const username = document.getElementById('username');
const display_name = document.getElementById('display_name');
const password = document.getElementById('password');
const confirm_password = document.getElementById('confirm_password');
const registration_submit = document.getElementById('registration_submit');
const registration_form = document.getElementById('registration_form');

const toggle_enable_button = new Array(4).fill(false);

username.addEventListener('input', (e) => {
    if (username.value === '') {
        setErrorFor(username, "Username can't be empty.");
    } else if (username.value[0] >= '0' && username.value[0] <= '9') {
        setErrorFor(
            username,
            "Username can't have a number as first character.",
        );
    } else if (username.value.match(/[$&+,:;=?@#|'<>.^*()%!-]/)) {
        setErrorFor(username, "Username can't have special character.");
    } else if (username.value.length < 3) {
        setErrorFor(username, "Username can't be less than 3 characters.");
    } else if (hasWhiteSpace(username.value)) {
        setErrorFor(username, "Username can't have any whitespaces.");
    } else {
        setSuccessFor(username);
        toggle_enable_button[0] = true;
        return;
    }
    // should always toggle back to false
    toggle_enable_button[0] = false;
});

display_name.addEventListener('input', (e) => {
    if (display_name.value === '') {
        setErrorFor(display_name, "Display name can't be empty.");
    } else if (display_name.value[0] >= '0' && display_name.value[0] <= '9') {
        setErrorFor(
            display_name,
            "Display name can't have a number as first character.",
        );
    } else if (display_name.value.match(/[$&+,:;=?@#|'<>.^*()%!-]/)) {
        setErrorFor(display_name, "Display name can't have special character.");
    } else if (display_name.value.length < 3) {
        setErrorFor(
            display_name,
            "Display name can't be less than 3 characters.",
        );
    } else if (hasWhiteSpace(display_name.value)) {
        setErrorFor(display_name, "Display name can't have any whitespaces.");
    } else {
        setSuccessFor(display_name);
        toggle_enable_button[1] = true;
        return;
    }
    // should always toggle back to false
    toggle_enable_button[1] = false;
});

password.addEventListener('input', (e) => {
    if (password.value === '') {
        setErrorFor(password, "Password can't be blank.");
    } else if (password.value.length < 8 || password.value.length > 16) {
        setErrorFor(
            password,
            'Password must be between 8 to 16 characters long.',
        );
    } else if (!password.value.match(/[A-Z]/)) {
        setErrorFor(password, 'Password must have a capital letter.');
    } else if (!password.value.match(/[0-9]/)) {
        setErrorFor(password, 'Password must have a number.');
    } else if (!password.value.match(/[$&+,:;=?@#|'<>.^*()%!-]/)) {
        setErrorFor(password, 'Password must have a special character.');
    } else {
        setSuccessFor(password);
        toggle_enable_button[2] = true;
        return;
    }
    toggle_enable_button[2] = false;
});

confirm_password.addEventListener('input', (e) => {
    if (confirm_password === '') {
        setErrorFor(confirm_password, "Confirm password can't be blank.");
    } else if (password.value !== confirm_password.value) {
        setErrorFor(confirm_password, "Passwords don't match.");
    } else {
        setSuccessFor(confirm_password);
        toggle_enable_button[3] = true;
        return;
    }
    toggle_enable_button[3] = false;
});

registration_form.addEventListener('change', (e) => {
    if (toggle_enable_button.every((e) => e === true)) {
        registration_submit.removeAttribute('disabled');
    }
});

// extra safe guard to prevent users from removing disabled tag
registration_submit.addEventListener('click', async (e) => {
    e.preventDefault();
    // if (!toggle_enable_button.every((e) => e === true)) e.preventDefault();

    const formData = new FormData(registration_form);
    // const response = await axios.post(
    //     "/registration",
    //     Object.fromEntries(formData)
    // ); // TODO: GUARD AND CLEANUP
    await axios
        .post('/registration', Object.fromEntries(formData))
        .then((response) => {
            window.location = response.data.url;
        })
        .catch((err) => console.log(`Registration error: ${err}`));
    // window.location = response.data.url;
});

// display error
function setErrorFor(input, message) {
    const form_control = input.parentElement;
    const small = form_control.querySelector('small');
    form_control.className = 'form-validation error';
    small.innerText = message;
}

// display success
function setSuccessFor(input) {
    const form_control = input.parentElement;
    form_control.className = 'form-validation success';
}

function isCapital(name) {
    return name.charAt(0) === name.charAt(0).toUpperCase();
}

function hasWhiteSpace(str) {
    return str.indexOf(' ') >= 0;
}
