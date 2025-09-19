const isDev = window.location.hostname === "127.0.0.1";
const apiUrl = isDev ? "http://127.0.0.1:5000/api/auth" : "/api/auth";

const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('loginMessage');

loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username, password})
    });

    if (response.ok) {
        const data = await response.json();
        console.log(data);
        sessionStorage.setItem('loggedIn', 'true');
        //sessionStorage.setItem('token', data.Token);
        window.location.href = 'pages/home.html';
    } else {
        const err = await response.text();
        loginMessage.textContent = err || 'Wrong username or password';
    }
});