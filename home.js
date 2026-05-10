document.addEventListener('DOMContentLoaded', () => {
    const usuarioGuardado = localStorage.getItem('usuarioActivo');
    const displayNombre = document.getElementById('userName');

    if (usuarioGuardado && displayNombre) {
        displayNombre.textContent = usuarioGuardado;
    } else if (!usuarioGuardado) {
        window.location.href = 'login.html';
    }
});

function colapsarSidebar() {
    document.querySelector('.container').classList.toggle('is-collapsed');
}

function desplegarMenu(event) {
    event.stopPropagation();
    document.querySelector('.perfil').classList.toggle('is-open');
}

document.addEventListener('click', function() {
    document.querySelector('.perfil').classList.remove('is-open');
});

document.querySelectorAll('.sidebar-button').forEach(boton => {
    boton.onclick = () => {
        fetch(boton.innerText.toLowerCase() + '.html')
            .then(res => res.text())
            .then(html => document.querySelector('.content').innerHTML = html);
    };
});