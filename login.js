const loginForm = document.getElementById('formularioLogin');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const loginData = {
        username: username,
        password: password
    }

    try {
        const response = await fetch('http://localhost:8080/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        if (response.ok) {
            const data = await response.json();

            localStorage.setItem('usuarioActivo', data.username);

            window.location.href = 'home.html';
        } else {
            alert("Error: Usuario o contraseña incorrectos");
        }
    } catch (error) {
        console.error("No se pudo conectar con el servidor:", error);
        alert("El servidor de Java no responde.");
    }
})