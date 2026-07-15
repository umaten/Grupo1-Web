const URL_API = "http://localhost:8080/customer";
let clientesData = [];
let paginaActual = 1;
const filasPorPagina = 15;

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}

export function initCustomer() {
  listarClientes();

  const formRegistrar = document.getElementById("formRegistrarCust");
  if (formRegistrar) formRegistrar.onsubmit = registrarCliente;

  const formEditar = document.getElementById("formEditarCust");
  if (formEditar) formEditar.onsubmit = actualizarCliente;

  document.getElementById("prevPageCust").onclick = () => cambiarPagina(-1);
  document.getElementById("nextPageCust").onclick = () => cambiarPagina(1);
}

async function listarClientes() {
  try {
    const res = await fetch(URL_API, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      console.error("Error:", res.status);
      return;
    }

    clientesData = await res.json();

    const countElem = document.getElementById("count-cust");
    if (countElem) countElem.textContent = clientesData.length;

    renderizarTabla();
  } catch (e) {
    console.error(e);
  }
}

function renderizarTabla() {
  const tbody = document.getElementById("tbody-clientes");
  if (!tbody) return;

  const inicio = (paginaActual - 1) * filasPorPagina;
  const fin = inicio + filasPorPagina;
  const itemsPaginados = clientesData.slice(inicio, fin);

  tbody.innerHTML = "";
  itemsPaginados.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${c.code}</td>
            <td>${c.fullName}</td>
            <td>
                <div class="cust-action-btns">
                    <button class="btn-cust-action edit" onclick="prepararEdicionCust(${c.id})">Editar</button>
                    <button class="btn-cust-action delete" onclick="eliminarCliente(${c.id})">Eliminar</button>
                </div>
            </td>
        `;
    tbody.appendChild(tr);
  });

  document.getElementById("pageDisplayCust").textContent =
    `Página ${paginaActual}`;
  document.getElementById("prevPageCust").disabled = paginaActual === 1;
  document.getElementById("nextPageCust").disabled = fin >= clientesData.length;
}

function cambiarPagina(direccion) {
  paginaActual += direccion;
  renderizarTabla();
}

async function registrarCliente(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const datos = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  };

  const res = await fetch(URL_API, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    console.error("Error:", res.status);
    return;
  }

  e.target.reset();
  document.getElementById("modalRegistrarCust").hidePopover();
  listarClientes();
}

window.prepararEdicionCust = async (id) => {
  const res = await fetch(`${URL_API}/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    console.error("Error:", res.status);
    return;
  }

  const c = await res.json();
  const form = document.getElementById("formEditarCust");

  form.querySelector('[name="id"]').value = c.id;

  const nombres = c.fullName.split(" ");
  form.querySelector('[name="firstName"]').value = nombres[0] || "";
  form.querySelector('[name="lastName"]').value =
    nombres.slice(1).join(" ") || "";

  document.getElementById("modalEditarCust").showPopover();
};

async function actualizarCliente(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const id = formData.get("id");

  const datos = {
    firstName: formData.get("firstName"),
    lastname: formData.get("lastName"),
  };
  const res = await fetch(`${URL_API}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    console.error("Error:", res.status);
    return;
  }

  document.getElementById("modalEditarCust").hidePopover();
  listarClientes();
}

window.eliminarCliente = async (id) => {
  if (confirm("¿Eliminar cliente?")) {
    const res = await fetch(`${URL_API}/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      console.error("Error:", res.status);
      return;
    }

    listarClientes();
  }
};
