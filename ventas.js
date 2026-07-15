const URL_PRODUCTOS = "https://proyectoweb-xptf.onrender.com/product";
const URL_VENTAS = "https://proyectoweb-xptf.onrender.com/sale";

let busquedaTimeout = null;
let carrito = [];
const IGV = 0.18;

function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}

export function initVentas() {
  carrito = [];
  renderizarCarrito();

  document.getElementById("sales-input-search").oninput = (e) => {
    clearTimeout(busquedaTimeout);
    const termino = e.target.value.trim();
    if (termino.length < 2) {
      cerrarDropdown();
      return;
    }

    busquedaTimeout = setTimeout(() => buscarSugerencias(termino), 300);
  };

  document.getElementById("sales-input-search").onkeyup = (e) => {
    if (e.key === "Enter") agregarProducto();
    if (e.key === "Escape") cerrarDropdown();
  };

  document.getElementById("sales-btn-add").onclick = agregarProducto;
  document.getElementById("sales-btn-submit").onclick = confirmarVenta;
  document.getElementById("sales-btn-abort").onclick = cancelarVenta;
  document.getElementById("comp-btn-cerrar").onclick = cerrarComprobante;
  document.getElementById("descargar-pdf").onclick = descargarPDF;

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".sales-search-group")) cerrarDropdown();
  });
}

async function buscarSugerencias(termino) {
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

    const productos = await res.json();
    mostrarDropdown(productos);
  } catch (e) {
    console.error("Error en autocomplete:", e);
  }
}

function mostrarDropdown(productos) {
  cerrarDropdown();

  if (productos.length === 0) return;

  const input = document.getElementById("sales-input-search");
  const dropdown = document.createElement("ul");
  dropdown.id = "sales-dropdown";
  dropdown.className = "sales-dropdown";

  productos.forEach((p) => {
    const li = document.createElement("li");
    li.className = "sales-dropdown-item";
    li.innerHTML = `
            <span class="dropdown-code">${p.code}</span>
            <span class="dropdown-name">${p.name}</span>
            <span class="dropdown-price">S/ ${parseFloat(p.salePrice).toFixed(2)}</span>
        `;
    li.onclick = () => {
      agregarAlCarrito(
        p,
        parseInt(document.getElementById("sales-input-qty").value) || 1,
      );
      document.getElementById("sales-input-search").value = "";
      cerrarDropdown();
    };
    dropdown.appendChild(li);
  });

  input.parentElement.style.position = "relative";
  input.parentElement.appendChild(dropdown);
}

function cerrarDropdown() {
  const existing = document.getElementById("sales-dropdown");
  if (existing) existing.remove();
}

function agregarAlCarrito(producto, cantidad) {
  const existente = carrito.find((i) => i.productId === producto.id);
  if (existente) {
    existente.quantity += cantidad;
    existente.subtotal = existente.unitPrice * existente.quantity;
  } else {
    carrito.push({
      productId: producto.id,
      code: producto.code,
      name: producto.name,
      quantity: cantidad,
      unitPrice: parseFloat(producto.salePrice),
      subtotal: parseFloat(producto.salePrice) * cantidad,
    });
  }
  renderizarCarrito();
}

async function agregarProducto() {
  const termino = document.getElementById("sales-input-search").value.trim();
  const cantidad =
    parseInt(document.getElementById("sales-input-qty").value) || 1;

  if (!termino) return;

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

    const productos = await res.json();

    if (productos.length === 0) {
      alert("Producto no encontrado.");
      return;
    }

    agregarAlCarrito(productos[0], cantidad);
    document.getElementById("sales-input-search").value = "";
    document.getElementById("sales-input-qty").value = "1";
    cerrarDropdown();
  } catch (e) {
    console.error("Error buscando producto:", e);
  }
}

function renderizarCarrito() {
  const tbody = document.getElementById("sales-tbody");
  if (!tbody) return;

  tbody.innerHTML = "";
  carrito.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${item.code}</td>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>S/ ${item.unitPrice.toFixed(2)}</td>
            <td>S/ ${item.subtotal.toFixed(2)}</td>
            <td class="sales-txt-center">
                <button class="sales-btn-remove" onclick="eliminarDelCarrito(${index})">X</button>
            </td>
        `;
    tbody.appendChild(tr);
  });

  actualizarTotal();
}

function actualizarTotal() {
  const subtotal = carrito.reduce((acc, i) => acc + i.subtotal, 0);
  const igv = subtotal * IGV;
  const total = subtotal + igv;

  document.getElementById("sales-subtotal").textContent =
    `S/ ${subtotal.toFixed(2)}`;
  document.getElementById("sales-igv").textContent = `S/ ${igv.toFixed(2)}`;
  document.getElementById("sales-total").textContent = `S/ ${total.toFixed(2)}`;
}

window.eliminarDelCarrito = (index) => {
  carrito.splice(index, 1);
  renderizarCarrito();
};

async function confirmarVenta() {
  if (carrito.length === 0) {
    alert("Agrega al menos un producto.");
    return;
  }

  const payload = {
    customerId: null,
    items: carrito.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    })),
  };

  try {
    const res = await fetch(URL_VENTAS, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Error:", res.status);
      return;
    }

    const venta = await res.json();
    mostrarComprobante(venta);
    carrito = [];
    renderizarCarrito();
  } catch (e) {
    console.error("Error confirmando venta:", e);
    alert("No se pudo conectar con el servidor.");
  }
}

function mostrarComprobante(venta) {
  const subtotal = parseFloat(venta.total);
  const igv = subtotal * IGV;
  const total = subtotal + igv;

  document.getElementById("comp-id").textContent = `N° de Venta: ${venta.id}`;
  document.getElementById("comp-fecha").textContent =
    `Fecha: ${new Date(venta.date).toLocaleString()}`;
  document.getElementById("comp-cliente").textContent =
    `Cliente: ${venta.customerName}`;

  const tbody = document.getElementById("comp-tbody");
  tbody.innerHTML = "";
  venta.details.forEach((d) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td>${d.productName}</td>
            <td>${d.quantity}</td>
            <td>S/ ${parseFloat(d.unitPrice).toFixed(2)}</td>
            <td>S/ ${parseFloat(d.subtotal).toFixed(2)}</td>
        `;
    tbody.appendChild(tr);
  });

  document.getElementById("comp-subtotal").textContent =
    `Subtotal: S/ ${subtotal.toFixed(2)}`;
  document.getElementById("comp-igv").textContent =
    `IGV (18%): S/ ${igv.toFixed(2)}`;
  document.getElementById("comp-total").textContent =
    `TOTAL: S/ ${total.toFixed(2)}`;

  document.getElementById("sales-comprobante").style.display = "flex";
}

function cerrarComprobante() {
  document.getElementById("sales-comprobante").style.display = "none";
}

function cancelarVenta() {
  if (carrito.length === 0) return;
  if (confirm("¿Cancelar la venta?")) {
    carrito = [];
    renderizarCarrito();
  }
}

function descargarPDF() {
  const elemento = document.querySelector(".comprobante-box");

  if (!elemento) {
    alert("No se encontró la boleta para descargar.");
    return;
  }

  const opciones = {
    margin: 15,
    filename: "Comprobante_Venta.pdf",
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      logging: false,
      scrollY: 0,
      scrollX: 0,
    },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  const botonCerrar = document.getElementById("comp-btn-cerrar");
  const botonPDF = document.getElementById("descargar-pdf");

  if (botonCerrar) botonCerrar.style.display = "none";
  if (botonPDF) botonPDF.style.display = "none";

  html2pdf()
    .set(opciones)
    .from(elemento)
    .save()
    .then(() => {
      if (botonCerrar) botonCerrar.style.display = "inline-block";
      if (botonPDF) botonPDF.style.display = "inline-block";
    })
    .catch((err) => {
      console.error("Error al generar el PDF: ", err);
      if (botonCerrar) botonCerrar.style.display = "inline-block";
      if (botonPDF) botonPDF.style.display = "inline-block";
    });
}
