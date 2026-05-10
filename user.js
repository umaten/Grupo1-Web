const URL_API = "http://localhost:8080/user";
let usuariosData = [];
let paginaActual = 1;
const filasPorPagina = 15;

export function initUser() {
    listarUsuarios();

    const formRegistrar = document.getElementById('formRegistrarUsr');
    if (formRegistrar) formRegistrar.onsubmit = registrarUsuario;

    const formEditar = document.getElementById('formEditarUsr');
    if (formEditar) formEditar.onsubmit = actualizarUsuario;

    document.getElementById('prevPageUsr').onclick = () => cambiarPagina(-1);
    document.getElementById('nextPageUsr').onclick = () => cambiarPagina(1);
}

async function listarUsuarios() {
    try {
        const res = await fetch(URL_API);
        usuariosData = await res.json();

        const countElem = document.getElementById('count-usr');
        if (countElem) countElem.textContent = usuariosData.length;

        renderizarTabla();
    } catch (e) {
        console.error(e);
    }
}

function renderizarTabla() {
    const tbody = document.getElementById('tbody-usuarios');
    if (!tbody) return;

    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const itemsPaginados = usuariosData.slice(inicio, fin);

    tbody.innerHTML = "";
    itemsPaginados.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.username}</td>
            <td>${u.email}</td>
            <td>${u.firstName}</td>
            <td><span class="role-badge">${u.role}</span></td>
            <td>
                <div class="usr-action-btns">
                    <button class="btn-usr-action edit" onclick="prepararEdicionUsr(${u.id})">Editar</button>
                    <button class="btn-usr-action delete" onclick="eliminarUsuario(${u.id})">Eliminar</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('pageDisplayUsr').textContent = `Página ${paginaActual}`;
    document.getElementById('prevPageUsr').disabled = paginaActual === 1;
    document.getElementById('nextPageUsr').disabled = fin >= usuariosData.length;
}

function cambiarPagina(direccion) {
    paginaActual += direccion;
    renderizarTabla();
}

async function registrarUsuario(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datos = Object.fromEntries(formData.entries());

    const res = await fetch(URL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    if (res.ok) {
        e.target.reset();
        document.getElementById('modalRegistrarUsr').hidePopover();
        listarUsuarios();
    }
}

window.prepararEdicionUsr = async (id) => {
    const res = await fetch(`${URL_API}/${id}`);
    const u = await res.json();
    const form = document.getElementById('formEditarUsr');

    form.querySelector('[name="id"]').value = u.id;
    form.querySelector('[name="username"]').value = u.username;
    form.querySelector('[name="email"]').value = u.email;
    form.querySelector('[name="firstName"]').value = u.firstName;
    form.querySelector('[name="role"]').value = u.role;
    form.querySelector('[name="password"]').value = "";

    document.getElementById('modalEditarUsr').showPopover();
};

async function actualizarUsuario(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');
    const datos = Object.fromEntries(formData.entries());

    const res = await fetch(`${URL_API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    if (res.ok) {
        document.getElementById('modalEditarUsr').hidePopover();
        listarUsuarios();
    }
}

window.eliminarUsuario = async (id) => {
    if (confirm("¿Eliminar usuario?")) {
        await fetch(`${URL_API}/${id}`, { method: 'DELETE' });
        listarUsuarios();
    }
};