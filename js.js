function colapsarSidebar() {
        // 1. Buscamos el contenedor principal
        const contenedor = document.querySelector('.container');
        
        // 2. Le alternamos la clase 'is-collapsed'
        contenedor.classList.toggle('is-collapsed');
      }

      // 1. Seleccionamos el formulario por su ID
const formulario = document.getElementById('formularioLogin');

// 2. Escuchamos el momento exacto en que se envía el formulario
formulario.addEventListener('submit', function(evento) {
    
    // ESTO ES CLAVE: Evita que la página parpadee o se recargue sola
    evento.preventDefault(); 
    
    // Aquí puedes simular que validas la contraseña si quieres
    // ...
    
    // 3. LA REDIRECCIÓN: Te lleva a tu panel de la bodega
    window.location.href = 'index.html'; 
});