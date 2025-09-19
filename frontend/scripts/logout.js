const logoutButton = document.getElementById('logoutButton');

logoutButton.addEventListener('click', async () => {
    const username = sessionStorage.getItem('username');
    const token = sessionStorage.getItem('token');

    if (!username || !token) {
        window.location.href = '../index.html';
        return;
    }

    const isDev = window.location.hostname === "127.0.0.1";
    const apiUrl = isDev ? "http://127.0.0.1:5000/api/auth" : "/api/auth";

    try {
        const response = await fetch(`${apiUrl}/logout`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username})
        });

        if (response.ok) {
            sessionStorage.clear(); // minden login adat törlése
            window.location.href = '/login.html';
        } else {
            const err = await response.text();
            alert('Hiba a kijelentkezés során: ' + err);
        }
    } catch (error) {
        console.error(error);
        alert('Hálózati hiba a kijelentkezés során');
    }
});

