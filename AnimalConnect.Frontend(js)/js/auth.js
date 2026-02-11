// js/auth.js

// Obtener usuario actual de forma segura
function getUsuario() {
    return JSON.parse(localStorage.getItem('zoonosis_user'));
}

// Función que llama layout.js al cargar
function actualizarEstadoUsuario() {
    const usuario = getUsuario();
    const container = document.getElementById('auth-buttons');
    
    if(usuario && container) {
        const htmlPuntos = usuario.puntos ? `<span class="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full ml-1"><i class="fa-solid fa-star text-yellow-500 mr-1"></i>${usuario.puntos}</span>` : '';

        container.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-sm font-bold text-orange-600 hidden md:inline">
                    Hola, ${usuario.nombre} ${htmlPuntos}
                </span>
                <a href="perfil.html" class="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-sm font-bold hover:bg-orange-200 transition">
                    <i class="fa-solid fa-user-gear mr-1"></i> Mi Perfil
                </a>
                <button onclick="logout()" class="text-gray-400 hover:text-red-500" title="Salir">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        `;
    }
}

function logout() { 
    localStorage.removeItem('zoonosis_user'); 
    window.location.href = 'index.html'; 
}

function checkAuthRedirect() {
    if(!getUsuario()) {
        alert("Debes iniciar sesión para acceder a esta sección.");
        window.location.href = 'login.html';
    }
}