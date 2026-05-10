const URL_API = "http://localhost:8080/supplier";
let proveedoresData = [];
let paginaActual = 1;
const filasPorPagina = 15;

// Configura eventos iniciales y carga datos
export function initSupplier() {
    listarProveedores();

    const formRegistrar = document.getElementById('formRegistrar');
    if (formRegistrar) formRegistrar.onsubmit = registrarProveedor;

    const formEditar = document.getElementById('formEditar');
    if (formEditar) formEditar.onsubmit = actualizarProveedor;

    document.getElementById('prevPage').onclick = () => cambiarPagina(-1);
    document.getElementById('nextPage').onclick = () => cambiarPagina(1);
}

// Carga datos de la API y actualiza indicadores de deuda/conteo
async function listarProveedores() {
    try {
        const res = await fetch(URL_API);
        proveedoresData = await res.json();

        const countElem = document.getElementById('count-prov');
        const sumElem = document.getElementById('sum-deuda');

        if (countElem) countElem.textContent = proveedoresData.length;
        if (sumElem) {
            const total = proveedoresData.reduce((acc, p) => acc + (p.debt || 0), 0);
            sumElem.textContent = `$${total.toFixed(2)}`;
        }

        renderizarTabla();
    } catch (e) {
        console.error(e);
    }
}

// Genera el HTML de la tabla según la página actual
function renderizarTabla() {
    const tbody = document.getElementById('tbody-proveedores');
    if (!tbody) return;

    const inicio = (paginaActual - 1) * filasPorPagina;
    const fin = inicio + filasPorPagina;
    const itemsPaginados = proveedoresData.slice(inicio, fin);

    tbody.innerHTML = "";
    itemsPaginados.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.supplierName}</td>
            <td>${p.dateLastOrder || '---'}</td>
            <td><span class="status-badge">${p.paymentStatus}</span></td>
            <td>$${(p.debt || 0).toFixed(2)}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-action edit" onclick="prepararEdicion(${p.id})">Editar</button>
                    <button class="btn-action delete" onclick="eliminarProveedor(${p.id})">Eliminar</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('pageDisplay').textContent = `Página ${paginaActual}`;
    document.getElementById('prevPage').disabled = paginaActual === 1;
    document.getElementById('nextPage').disabled = fin >= proveedoresData.length;
}

// Maneja la navegación entre páginas
function cambiarPagina(direccion) {
    paginaActual += direccion;
    renderizarTabla();
}

// Envía nuevo proveedor al servidor
async function registrarProveedor(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const datos = { supplierName: formData.get('supplierName') };

    const res = await fetch(URL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    if (res.ok) {
        e.target.reset();
        document.getElementById('modalRegistrar').hidePopover();
        listarProveedores();
    }
}

// Carga datos de un proveedor en el formulario de edición
window.prepararEdicion = async (id) => {
    const res = await fetch(`${URL_API}/${id}`);
    const p = await res.json();
    const form = document.getElementById('formEditar');

    form.querySelector('[name="id"]').value = p.id;
    form.querySelector('[name="supplierName"]').value = p.supplierName;
    form.querySelector('[name="dateLastOrder"]').value = p.dateLastOrder || "";
    form.querySelector('[name="paymentStatus"]').value = p.paymentStatus;
    form.querySelector('[name="debt"]').value = p.debt;

    document.getElementById('modalEditar').showPopover();
};

// Envía los cambios actualizados al servidor
async function actualizarProveedor(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const id = formData.get('id');

    const datos = {
        supplierName: formData.get('supplierName'),
        dateLastOrder: formData.get('dateLastOrder'),
        paymentStatus: formData.get('paymentStatus'),
        debt: parseFloat(formData.get('debt')) || 0
    };

    const res = await fetch(`${URL_API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
    });

    if (res.ok) {
        document.getElementById('modalEditar').hidePopover();
        listarProveedores();
    }
}

// Borra un registro previa confirmación
window.eliminarProveedor = async (id) => {
    if (confirm("¿Eliminar?")) {
        await fetch(`${URL_API}/${id}`, { method: 'DELETE' });
        listarProveedores();
    }
};