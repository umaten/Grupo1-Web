import { initSupplier } from './supplier.js';
import { initCustomer } from './customer.js';
import { initUser } from './user.js';
import { initInventory } from './inventory.js';
import { initDashboard} from "./inicio.js";
import { initVentas } from './ventas.js';
import { initReportes } from './reportes.js';


const modulos = {
    "proveedores": initSupplier,
    "clientes": initCustomer,
    "usuarios": initUser,
    "inventario": initInventory,
    "inicio": initDashboard,
    "ventas": initVentas,
    "reportes": initReportes
};

document.addEventListener('DOMContentLoaded', () => {
    const usuarioGuardado = localStorage.getItem('usuarioActivo');
    const displayNombre = document.getElementById('userName');

    if (usuarioGuardado && displayNombre) {
        displayNombre.textContent = usuarioGuardado;
    } else if (!usuarioGuardado) {
        window.location.href = 'login.html';
    }

    const botones = document.querySelectorAll('.sidebar-button');

    botones.forEach(boton => {
        boton.onclick = () => {
            const nombrePanel = boton.innerText.trim().toLowerCase();

            fetch(`${nombrePanel}.html`)
                .then(res => {
                    if (!res.ok) throw new Error();
                    return res.text();
                })
                .then(html => {
                    const content = document.querySelector('.content');
                    if (content) {
                        content.innerHTML = html;
                        if (modulos[nombrePanel]) {
                            modulos[nombrePanel]();
                        }
                    }
                })
                .catch(err => console.error("Error cargando panel:", nombrePanel));
        };
    });
});

window.colapsarSidebar = () => {
    const container = document.querySelector('.container');
    if (container) container.classList.toggle('is-collapsed');
};

window.desplegarMenu = (event) => {
    if (event) event.stopPropagation();
    const perfil = document.querySelector('.perfil');
    if (perfil) perfil.classList.toggle('is-open');
};

document.addEventListener('click', () => {
    const perfil = document.querySelector('.perfil');
    if (perfil) perfil.classList.remove('is-open');
});