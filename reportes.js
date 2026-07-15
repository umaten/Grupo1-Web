const URL_SUMMARY = "https://proyectoweb-xptf.onrender.com/api/reports/summary";
const URL_HISTORY = "https://proyectoweb-xptf.onrender.com/api/reports/history";

// Helper para agregar cabeceras de autorización con JWT
function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}

export function initReportes() {
  cargarDashboardIntegrado();
}

async function cargarDashboardIntegrado() {
  try {
    // Ejecutamos ambas peticiones en paralelo para optimizar la carga
    const [resSummary, resHistory] = await Promise.all([
      fetch(URL_SUMMARY, {
        headers: authHeaders(),
      }),
      fetch(URL_HISTORY, {
        headers: authHeaders(),
      }),
    ]);

    // Verificación de res.ok para cada petición antes de proceder a .json()
    if (!resSummary.ok) {
      console.error("Error:", resSummary.status);
      return;
    }
    if (!resHistory.ok) {
      console.error("Error:", resHistory.status);
      return;
    }

    const dataSummary = await resSummary.json();
    const dataHistory = await resHistory.json();

    // Enviamos los datos a sus respectivas funciones
    actualizarTarjetas(dataSummary);
    actualizarTablaVentas(dataHistory);
  } catch (e) {
    console.error("Error cargando el dashboard:", e);
    mostrarErrorVista();
  }
}

function actualizarTarjetas(data) {
  const totalVentaElem = document.getElementById("rep-total-venta");
  const transaccionesElem = document.getElementById("rep-transacciones");
  const ticketPromedioElem = document.getElementById("rep-ticket-promedio");

  if (totalVentaElem)
    totalVentaElem.textContent = `S/ ${data.totalSales.toFixed(2)}`;
  if (transaccionesElem) transaccionesElem.textContent = data.totalTransactions;
  if (ticketPromedioElem)
    ticketPromedioElem.textContent = `S/ ${data.averageTicket.toFixed(2)}`;
}

function actualizarTablaVentas(ventas) {
  const tbody = document.getElementById("rep-tbody-ventas");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (ventas && ventas.length > 0) {
    ventas.forEach((venta) => {
      // 1. Armamos el texto de los productos (ej: 2x Arroz, 1x Leche)
      let productosHtml = `<ul style="margin: 0; padding-left: 15px; font-size: 0.9em; text-align: left;">`;
      if (venta.items && venta.items.length > 0) {
        venta.items.forEach((item) => {
          productosHtml += `<li><strong>${item.quantity}x</strong> ${item.productName}</li>`;
        });
      } else {
        productosHtml += `<li>Sin detalles</li>`;
      }
      productosHtml += `</ul>`;

      // 2. Pintamos toda la fila
      const tr = document.createElement("tr");
      tr.innerHTML = `
                <td><strong>#V-${venta.saleId.toString().padStart(4, "0")}</strong></td>
                <td>${venta.date}</td>
                <td>${venta.customerName}</td>
                <td>${productosHtml}</td> <td><strong style="color: #27ae60;">S/ ${venta.total.toFixed(2)}</strong></td>
            `;
      tbody.appendChild(tr);
    });
  } else {
    tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #7f8c8d;">No hay ventas registradas aún.</td>
            </tr>
        `;
  }
}

function mostrarErrorVista() {
  const tbody = document.getElementById("rep-tbody-ventas");
  if (tbody) {
    tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: #e74c3c;">
                    Error al conectar con la base de datos. Verifica el backend.
                </td>
            </tr>
        `;
  }

  // Reiniciamos las tarjetas por seguridad
  document.getElementById("rep-total-venta").textContent = "S/ 0.00";
  document.getElementById("rep-transacciones").textContent = "0";
  document.getElementById("rep-ticket-promedio").textContent = "S/ 0.00";
}
