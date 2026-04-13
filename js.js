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

const formulario = document.getElementById('formularioLogin');
if (formulario) {
  formulario.addEventListener('submit', function(evento) {
    evento.preventDefault();
    window.location.href = 'index.html';
  });
}

document.querySelectorAll('.sidebar-button').forEach(boton => {
    boton.onclick = () => {
        fetch(boton.innerText.toLowerCase() + '.html')
            .then(res => res.text())
            .then(html => document.querySelector('.content').innerHTML = html);
    };
});