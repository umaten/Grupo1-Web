const URL_PRODUCTOS = "http://localhost:8080/product";
const URL_VENTAS    = "http://localhost:8080/sale";

let carrito = []; // { productId, code, name, quantity, unitPrice, subtotal }

export function initVentas() {
    carrito = [];
    renderizarCarrito();

    document.getElementById('sales-btn-add').onclick = agregarProducto;
    document.getElementById('sales-input-search').onkeyup = (e) => {
        if (e.key === 'Enter') agregarProducto();
    };

    document.getElementById('sales-btn-submit').onclick = confirmarVenta;
    document.getElementById('sales-btn-abort').onclick  = cancelarVenta;
    document.getElementById('comp-btn-cerrar').onclick  = cerrarComprobante;
}

async function agregarProducto() {
    const termino  = document.getElementById('sales-input-search').value.trim();
    const cantidad = parseInt(document.getElementById('sales-input-qty').value) || 1;

    if (!termino) return;

    try {
        const res = await fetch(`${URL_PRODUCTOS}/search?term=${encodeURIComponent(termino)}`);
        const productos = await res.json();

        if (productos.length === 0) {
            alert("Producto no encontrado.");
            return;
        }

        const producto = productos[0];

        // Si ya está en el carrito, sumar cantidad
        const existente = carrito.find(i => i.productId === producto.id);
        if (existente) {
            existente.quantity  += cantidad;
            existente.subtotal   = existente.unitPrice * existente.quantity;
        } else {
            carrito.push({
                productId: producto.id,
                code:      producto.code,
                name:      producto.name,
                quantity:  cantidad,
                unitPrice: parseFloat(producto.salePrice),
                subtotal:  parseFloat(producto.salePrice) * cantidad
            });
        }

        document.getElementById('sales-input-search').value = "";
        document.getElementById('sales-input-qty').value    = "1";
        renderizarCarrito();

    } catch (e) {
        console.error("Error buscando producto:", e);
    }
}

function renderizarCarrito() {
    const tbody = document.getElementById('sales-tbody');
    if (!tbody) return;

    tbody.innerHTML = "";
    carrito.forEach((item, index) => {
        const tr = document.createElement('tr');
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
    const total = carrito.reduce((acc, i) => acc + i.subtotal, 0);
    document.getElementById('sales-total').textContent = `S/ ${total.toFixed(2)}`;
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
        items: carrito.map(i => ({
            productId: i.productId,
            quantity:  i.quantity
        }))
    };

    try {
        const res = await fetch(URL_VENTAS, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json();
            alert("Error: " + (err.message || "No se pudo registrar la venta."));
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
    document.getElementById('comp-id').textContent     = `N° de Venta: ${venta.id}`;
    document.getElementById('comp-fecha').textContent  = `Fecha: ${new Date(venta.date).toLocaleString()}`;
    document.getElementById('comp-cliente').textContent = `Cliente: ${venta.customerName}`;
    document.getElementById('comp-total').textContent  = `TOTAL: S/ ${parseFloat(venta.total).toFixed(2)}`;

    const tbody = document.getElementById('comp-tbody');
    tbody.innerHTML = "";
    venta.details.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${d.productName}</td>
            <td>${d.quantity}</td>
            <td>S/ ${parseFloat(d.unitPrice).toFixed(2)}</td>
            <td>S/ ${parseFloat(d.subtotal).toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });

    document.getElementById('sales-comprobante').style.display = 'flex';
}

function cerrarComprobante() {
    document.getElementById('sales-comprobante').style.display = 'none';
}

function cancelarVenta() {
    if (carrito.length === 0) return;
    if (confirm("¿Cancelar la venta?")) {
        carrito = [];
        renderizarCarrito();
    }
}