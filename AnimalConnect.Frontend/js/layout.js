// js/layout.js

document.addEventListener('DOMContentLoaded', () => {
    cargarNavbar();
    actualizarEstadoUsuario(); // Viene de auth.js (lo veremos luego)
});

function cargarNavbar() {
    const navbarHTML = `
    <nav class="bg-white shadow-md">
        <div class="container mx-auto px-4 py-2 flex justify-between items-center">
            <a href="index.html" class="flex items-center space-x-2">
                <i class="fa-solid fa-paw text-orange-500 text-2xl"></i>
                <span class="text-xl font-bold text-gray-800 hidden md:block">Animal Connect</span>
            </a>

            <div class="hidden md:flex space-x-6">
                <a href="index.html" class="text-gray-600 hover:text-orange-500 font-medium transition ${isActive('index.html')}">
                    <i class="fa-solid fa-map-location-dot mr-1"></i> Perdidos
                </a>
                <a href="adopcion.html" class="text-gray-600 hover:text-orange-500 font-medium transition ${isActive('adopcion.html')}">
                    <i class="fa-solid fa-heart mr-1"></i> Adopción
                </a>
                <a href="veterinarias.html" class="text-gray-600 hover:text-orange-500 font-medium transition ${isActive('veterinarias.html')}">
                    <i class="fa-solid fa-user-doctor mr-1"></i> Profesionales
                </a>
                <a href="tiendas.html" class="text-gray-600 hover:text-orange-500 font-medium transition ${isActive('tiendas.html')}">
                    <i class="fa-solid fa-shop mr-1"></i> Marketplace
                </a>
                <a href="comunidad.html" class="text-gray-600 hover:text-orange-500 font-medium transition ${isActive('comunidad.html')}">
                    <i class="fa-solid fa-users mr-1"></i> Comunidad
                </a>
                <a href="salud.html" class="text-gray-600 hover:text-orange-500 font-medium transition ${isActive('salud.html')}">
                    <i class="fa-solid fa-truck-medical mr-1"></i> Operativos
                </a>
            </div>

            

                <div id="auth-buttons">
                    <a href="login.html" class="text-gray-500 hover:text-orange-500 font-bold text-sm">
                        <i class="fa-solid fa-user-circle text-xl align-middle"></i> 
                        <span class="hidden md:inline ml-1">Ingresar</span>
                    </a>
                </div>
            </div>
        </div>
        
        <div class="md:hidden border-t border-gray-100 flex justify-around py-2">
             <a href="index.html" class="text-2xl ${isActive('index.html', true)}"><i class="fa-solid fa-map-location-dot"></i></a>
             <a href="adopcion.html" class="text-2xl ${isActive('adopcion.html', true)}"><i class="fa-solid fa-heart"></i></a>
             <a href="comunidad.html" class="text-2xl ${isActive('comunidad.html', true)}"><i class="fa-solid fa-users"></i></a>
             <div class="md:hidden border-t ...">
                <a href="veterinarias.html" class="text-2xl ${isActive('veterinarias.html', true)}"><i class="fa-solid fa-user-doctor"></i></a>
            </div>
             <a href="salud.html" class="text-2xl ${isActive('salud.html', true)}"><i class="fa-solid fa-truck-medical"></i></a>
        </div>
    </nav>
    `;

    document.getElementById('app-navbar').innerHTML = navbarHTML;
}

// Función auxiliar para resaltar la página actual
function isActive(pagina, esMovil = false) {
    const path = window.location.pathname;
    // Si la url contiene el nombre de la página, devolvemos la clase de color activo
    if (path.includes(pagina) || (pagina === 'index.html' && (path.endsWith('/') || path.endsWith('index.html')))) {
        return esMovil ? "text-orange-600" : "text-orange-600 border-b-2 border-orange-500";
    }
    return esMovil ? "text-gray-400" : "";
}