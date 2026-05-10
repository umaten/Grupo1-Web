const API_BASE = 'http://localhost:8080';

const formatPE = (v) => new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(v || 0);

export async function initDashboard() {
    try {
        const [rP, rS, rC, rU] = await Promise.all([
            fetch(`${API_BASE}/product`),
            fetch(`${API_BASE}/supplier`),
            fetch(`${API_BASE}/customer`),
            fetch(`${API_BASE}/user`)
        ]);

        const products = await rP.json();
        const suppliers = await rS.json();
        const customers = await rC.json();
        const users = await rU.json();

        const invVal = products.reduce((a, p) => a + (p.purchasePrice * p.stock), 0);
        const debtVal = suppliers.reduce((a, s) => a + (s.debt || 0), 0);
        const lowStock = products.filter(p => p.stock < 5).length;
        const inArrears = suppliers.filter(s => s.debt > 0).length;

        const elements = {
            'valor-inventario': formatPE(invVal),
            'deuda-proveedores': formatPE(debtVal),
            'total-productos': products.length,
            'total-clientes': customers.length,
            'total-proveedores': suppliers.length,
            'total-usuarios': users.length,
            'stock-bajo': lowStock,
            'proveedores-mora': inArrears
        };

        for (const [id, val] of Object.entries(elements)) {
            const el = document.getElementById(id);
            if (el) el.innerText = val;
        }

    } catch (err) {
        console.error('API Error:', err);
    }
}