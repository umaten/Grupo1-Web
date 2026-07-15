const API_BASE = "https://proyectoweb-xptf.onrender.com";

// Helper para agregar cabeceras de autorización con JWT
function authHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}

const formatPE = (v) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" }).format(
    v || 0,
  );

export async function initDashboard() {
  try {
    // 1. Ejecutamos los fetch enviando las cabeceras de autorización
    const [rP, rS, rC, rU] = await Promise.all([
      fetch(`${API_BASE}/product`, { headers: authHeaders() }),
      fetch(`${API_BASE}/supplier`, { headers: authHeaders() }),
      fetch(`${API_BASE}/customer`, { headers: authHeaders() }),
      fetch(`${API_BASE}/user`, { headers: authHeaders() }),
    ]);

    // 2. Verificamos res.ok para cada una de las respuestas antes de parsear
    if (!rP.ok) {
      console.error("Error cargando productos:", rP.status);
      return;
    }
    if (!rS.ok) {
      console.error("Error cargando proveedores:", rS.status);
      return;
    }
    if (!rC.ok) {
      console.error("Error cargando clientes:", rC.status);
      return;
    }
    if (!rU.ok) {
      console.error("Error cargando usuarios:", rU.status);
      return;
    }

    const products = await rP.json();
    const suppliers = await rS.json();
    const customers = await rC.json();
    const users = await rU.json();

    const invVal = products.reduce((a, p) => a + p.salePrice * p.stock, 0);
    const debtVal = suppliers.reduce((a, s) => a + (s.debt || 0), 0);
    const lowStock = products.filter((p) => p.stock < 5).length;
    const inArrears = suppliers.filter((s) => s.debt > 0).length;

    const elements = {
      "valor-inventario": formatPE(invVal),
      "deuda-proveedores": formatPE(debtVal),
      "total-productos": products.length,
      "total-clientes": customers.length,
      "total-proveedores": suppliers.length,
      "total-usuarios": users.length,
      "stock-bajo": lowStock,
      "proveedores-mora": inArrears,
    };

    for (const [id, val] of Object.entries(elements)) {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    }
  } catch (err) {
    console.error("API Error:", err);
  }
}
