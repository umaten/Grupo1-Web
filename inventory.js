const URL_PRODUCTOS = "http://localhost:8080/product";
const URL_PROVEEDORES = "http://localhost:8080/supplier";
let productosData = [];
let paginaActual = 1;
const filasPorPagina = 15;

// Helper para agregar cabeceras de autorización con JWT
function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}

export function initInventory() {
  listarProductos();
  cargarProveedoresEnSelects();

  const formRegistrar = document.getElementById("formRegistrarInv");
  if (formRegistrar) formRegistrar.onsubmit = registrarProducto;

  const formEditar = document.getElementById("formEditarInv");
  if (formEditar) formEditar.onsubmit = actualizarProducto;

  const inputSearch = document.getElementById("inputSearchInv");
  const btnSearch = document.getElementById("btnSearchInv");

  if (btnSearch) {
    btnSearch.onclick = () => buscarProductos(inputSearch.value);
  }

  if (inputSearch) {
    inputSearch.onkeyup = (e) => {
      if (e.key === "Enter") buscarProductos(inputSearch.value);
      if (inputSearch.value === "") listarProductos();
    };
  }

  document.getElementById("prevPageInv").onclick = () => cambiarPagina(-1);
  document.getElementById("nextPageInv").onclick = () => cambiarPagina(1);
}

async function cargarProveedoresEnSelects() {
  try {
    const res = await fetch(URL_PROVEEDORES, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      console.error("Error:", res.status);
      return;
    }

    const proveedores = await res.json();
    const selects = document.querySelectorAll(".select-suppliers");

    selects.forEach((select) => {
      select.innerHTML = '<option value="">Seleccione proveedor</option>';
      proveedores.forEach((p) => {
        const option = document.createElement("option");
        option.value = p.id;
        option.textContent = p.supplierName;
        select.appendChild(option);
      });
    });
  } catch (e) {
    console.error("Error cargando proveedores:", e);
  }
}

async function listarProductos() {
  try {
    const res = await fetch(URL_PRODUCTOS, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      console.error("Error:", res.status);
      return;
    }

    productosData = await res.json();
    actualizarVista();
  } catch (e) {
    console.error(e);
  }
}

async function buscarProductos(termino) {
  if (!termino.trim()) {
    listarProductos();
    return;
  }
  try {
    const res = await fetch(
      `${URL_PRODUCTOS}/search?term=${encodeURIComponent(termino)}`,
      {
        headers: authHeaders(),
      },
    );

    if (!res.ok) {
      console.error("Error:", res.status);
      return;
    }

    productosData = await res.json();
    paginaActual = 1;
    actualizarVista();
  } catch (e) {
    console.error("Error en búsqueda:", e);
  }
}

function actualizarVista() {
  const countElem = document.getElementById("count-inv");
  if (countElem) countElem.textContent = productosData.length;
  renderizarTabla();
}

function renderizarTabla() {
  const tbody = document.getElementById("tbody-inventario");
  if (!tbody) return;

  const inicio = (paginaActual - 1) * filasPorPagina;
  const fin = inicio + filasPorPagina;
  const itemsPaginados = productosData.slice(inicio, fin);

  tbody.innerHTML = "";
  itemsPaginados.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td><strong>${p.code}</strong></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>$${p.purchasePrice.toFixed(2)}</td>
            <td>$${p.salePrice.toFixed(2)}</td>
            <td>${p.stock}</td>
            <td>${p.supplier ? p.supplier.supplierName : "S/P"}</td>
            <td>
                <div class="inv-action-btns">
                    <button class="btn-inv-action edit" onclick="prepararEdicionInv(${p.id})">Editar</button>
                    <button class="btn-inv-action delete" onclick="eliminarProducto(${p.id})">Eliminar</button>
                </div>
            </td>
        `;
    tbody.appendChild(tr);
  });

  document.getElementById("pageDisplayInv").textContent =
    `Página ${paginaActual}`;
  document.getElementById("prevPageInv").disabled = paginaActual === 1;
  document.getElementById("nextPageInv").disabled = fin >= productosData.length;
}

function cambiarPagina(direccion) {
  paginaActual += direccion;
  renderizarTabla();
}

async function registrarProducto(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const datos = {
    name: formData.get("name"),
    category: formData.get("category"),
    purchasePrice: parseFloat(formData.get("purchasePrice")),
    salePrice: parseFloat(formData.get("salePrice")),
    stock: parseInt(formData.get("stock")),
    supplierId: parseInt(formData.get("supplierId")),
  };

  const res = await fetch(URL_PRODUCTOS, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    console.error("Error:", res.status);
    return;
  }

  e.target.reset();
  document.getElementById("modalRegistrarInv").hidePopover();
  listarProductos();
}

window.prepararEdicionInv = async (id) => {
  const res = await fetch(`${URL_PRODUCTOS}/${id}`, {
    headers: authHeaders(),
  });

  if (!res.ok) {
    console.error("Error:", res.status);
    return;
  }

  const p = await res.json();
  const form = document.getElementById("formEditarInv");

  form.querySelector('[name="id"]').value = p.id;
  form.querySelector('[name="name"]').value = p.name;
  form.querySelector('[name="category"]').value = p.category;
  form.querySelector('[name="purchasePrice"]').value = p.purchasePrice;
  form.querySelector('[name="salePrice"]').value = p.salePrice;
  form.querySelector('[name="stock"]').value = p.stock;
  form.querySelector('[name="supplierId"]').value = p.supplier
    ? p.supplier.id
    : "";

  document.getElementById("modalEditarInv").showPopover();
};

async function actualizarProducto(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const id = formData.get("id");
  const datos = {
    name: formData.get("name"),
    category: formData.get("category"),
    purchasePrice: parseFloat(formData.get("purchasePrice")),
    salePrice: parseFloat(formData.get("salePrice")),
    stock: parseInt(formData.get("stock")),
    supplierId: parseInt(formData.get("supplierId")),
  };

  const res = await fetch(`${URL_PRODUCTOS}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    console.error("Error:", res.status);
    return;
  }

  document.getElementById("modalEditarInv").hidePopover();
  listarProductos();
}

window.eliminarProducto = async (id) => {
  if (confirm("¿Eliminar producto?")) {
    const res = await fetch(`${URL_PRODUCTOS}/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      console.error("Error:", res.status);
      return;
    }

    listarProductos();
  }
};
