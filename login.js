const loginForm = document.getElementById("formularioLogin");
const errorDiv = document.getElementById("login-error");

function mostrarError(mensaje) {
  errorDiv.textContent = mensaje;
  errorDiv.classList.add("visible");
}

function limpiarError() {
  errorDiv.textContent = "";
  errorDiv.classList.remove("visible");
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  limpiarError();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    mostrarError("Por favor completa todos los campos.");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Respuesta completa del backend:", data);
      localStorage.setItem("usuarioActivo", data.username);
      localStorage.setItem("token", data.token);
      localStorage.setItem("rol", data.role);
      window.location.href = "home.html";
    } else if (response.status === 401) {
      mostrarError("Usuario o contraseña incorrectos.");
    } else {
      mostrarError(
        `Error del servidor (${response.status}). Intenta de nuevo.`,
      );
    }
  } catch (error) {
    mostrarError(
      "No se pudo conectar con el servidor. Verifica que el backend esté encendido.",
    );
  }
});
