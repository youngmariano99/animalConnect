// js/layout.js

document.addEventListener('DOMContentLoaded', () => {
    cargarNavbar();
    actualizarEstadoUsuario(); // Viene de auth.js (lo veremos luego)
});

function cargarNavbar() {
    const nav = document.getElementById('app-navbar');
    nav.className = "bg-white shadow-md sticky top-0 z-[1000]"; // Z-index alto para ganarle al mapa

    // Helper para saber si un dropdown padre debe estar activo
    const isServiceActive = () => {
        const pages = ['veterinarias.html', 'tiendas.html', 'salud.html'];
        return pages.some(p => window.location.pathname.includes(p)) ? 'text-orange-600 font-bold' : 'text-gray-600 hover:text-orange-500';
    };

    nav.innerHTML = `
        <div class="container mx-auto px-4">
            <div class="flex justify-between items-center h-16">
                <a href="index.html" class="flex items-center space-x-2 group">
                    <div class="bg-orange-100 p-2 rounded-lg group-hover:bg-orange-200 transition">
                        <i class="fa-solid fa-paw text-2xl text-orange-600"></i>
                    </div>
                    <span class="font-bold text-xl text-gray-800 tracking-tight">Animal<span class="text-orange-600">Connect</span></span>
                </a>

                <div class="hidden md:flex space-x-8 items-center">
                    
                    <a href="index.html" class="text-sm font-medium transition ${isActive('index.html')}">Inicio</a>
                    
                    <a href="adopcion.html" class="text-sm font-medium transition ${isActive('adopcion.html')}">Adopción</a>

                    <div class="relative group h-16 flex items-center">
                        <button class="flex items-center space-x-1 text-sm font-medium transition outline-none ${isServiceActive()}">
                            <span>Servicios</span>
                            <i class="fa-solid fa-chevron-down text-xs transition-transform group-hover:rotate-180"></i>
                        </button>
                        
                        <div class="absolute top-14 left-0 w-56 bg-white rounded-xl shadow-xl border border-gray-100 hidden group-hover:block overflow-hidden transform transition-all animate-fade-in-up">
                            
                            <div class="absolute -top-1 left-6 w-3 h-3 bg-white border-l border-t border-gray-100 transform rotate-45"></div>

                            <div class="py-2">
                                <a href="veterinarias.html" class="block px-4 py-3 hover:bg-orange-50 transition group/item">
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mr-3 group-hover/item:bg-blue-100">
                                            <i class="fa-solid fa-user-doctor"></i>
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold text-gray-800">Veterinarias</p>
                                            <p class="text-[10px] text-gray-500">Guardias y clínicas</p>
                                        </div>
                                    </div>
                                </a>

                                <a href="tiendas.html" class="block px-4 py-3 hover:bg-orange-50 transition group/item">
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mr-3 group-hover/item:bg-purple-100">
                                            <i class="fa-solid fa-shop"></i>
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold text-gray-800">Marketplace</p>
                                            <p class="text-[10px] text-gray-500">Petshops y servicios</p>
                                        </div>
                                    </div>
                                </a>

                                <a href="salud.html" class="block px-4 py-3 hover:bg-orange-50 transition group/item">
                                    <div class="flex items-center">
                                        <div class="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center mr-3 group-hover/item:bg-green-100">
                                            <i class="fa-solid fa-notes-medical"></i>
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold text-gray-800">Campañas</p>
                                            <p class="text-[10px] text-gray-500">Castración y vacunas</p>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                    <a href="comunidad.html" class="text-sm font-medium transition ${isActive('comunidad.html')}">Comunidad</a>
                    
                    ${generarBotonAuth()}
                </div>

                <div class="md:hidden flex items-center">
                    <button id="mobile-menu-btn" onclick="toggleMobileMenu()" class="text-gray-600 hover:text-orange-600 p-2">
                        <i class="fa-solid fa-bars text-2xl"></i>
                    </button>
                </div>
            </div>
        </div>
        
        <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-lg">
            <div class="p-4 space-y-2">
                <a href="index.html" class="block px-4 py-2 rounded-lg hover:bg-gray-50 font-bold text-gray-700">Inicio</a>
                <a href="adopcion.html" class="block px-4 py-2 rounded-lg hover:bg-gray-50 font-bold text-gray-700">Adopción</a>
                
                <div class="bg-gray-50 rounded-xl p-3 mt-2">
                    <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Servicios</p>
                    <a href="veterinarias.html" class="flex items-center px-2 py-2 text-gray-600 hover:text-orange-600">
                        <i class="fa-solid fa-user-doctor w-6"></i> Profesionales
                    </a>
                    <a href="tiendas.html" class="flex items-center px-2 py-2 text-gray-600 hover:text-orange-600">
                        <i class="fa-solid fa-shop w-6"></i> Tiendas
                    </a>
                    <a href="salud.html" class="flex items-center px-2 py-2 text-gray-600 hover:text-orange-600">
                        <i class="fa-solid fa-notes-medical w-6"></i> Campañas
                    </a>
                </div>

                <a href="comunidad.html" class="block px-4 py-2 rounded-lg hover:bg-gray-50 font-bold text-gray-700">Comunidad</a>
                
                <div class="border-t border-gray-100 pt-2 mt-2">
                     ${generarBotonAuth(true)}
                </div>
            </div>
        </div>
    `;
}

function generarBotonAuth(esMovil = false) {
    // Intentamos obtener el usuario de localStorage (auth.js debe estar cargado, pero por si acaso accedemos directo)
    const usuario = JSON.parse(localStorage.getItem('zoonosis_user'));

    if (usuario) {
        // --- USUARIO LOGUEADO ---
        if (esMovil) {
             // Versión Móvil: Nombre + Botones simples
             return `
                <div class="flex items-center justify-between px-2">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                            ${usuario.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span class="font-bold text-gray-700 truncate max-w-[120px]">${usuario.nombre}</span>
                    </div>
                    <div class="flex gap-2">
                        <a href="perfil.html" class="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-xs font-bold">Perfil</a>
                        <button onclick="logout()" class="border border-red-200 text-red-500 px-3 py-1 rounded-lg text-xs font-bold">Salir</button>
                    </div>
                </div>
            `;
        } else {
             // Versión Escritorio: Badges y Botones
             const htmlPuntos = usuario.puntos ? `<span class="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full ml-1"><i class="fa-solid fa-star text-yellow-500 mr-1"></i>${usuario.puntos}</span>` : '';
             
             return `
                <div class="flex items-center gap-3 border-l border-gray-200 pl-4 ml-2">
                    <span class="text-sm font-bold text-gray-600 hidden lg:inline">Hola, ${usuario.nombre} ${htmlPuntos}</span>
                    
                    <a href="perfil.html" class="bg-orange-50 text-orange-600 w-8 h-8 rounded-full flex items-center justify-center hover:bg-orange-100 transition shadow-sm" title="Mi Perfil">
                        <i class="fa-solid fa-user-gear text-sm"></i>
                    </a>
                    
                    <button onclick="logout()" class="text-gray-400 hover:text-red-500 transition" title="Cerrar Sesión">
                        <i class="fa-solid fa-right-from-bracket"></i>
                    </button>
                </div>
            `;
        }
    } else {
        // --- USUARIO NO LOGUEADO (Invitado) ---
        return `
            <a href="login.html" class="${esMovil ? 'block w-full text-center bg-orange-600 text-white py-3 rounded-xl font-bold shadow-md' : 'flex items-center text-gray-500 hover:text-orange-600 font-bold text-sm transition'}">
                <i class="fa-solid fa-user-circle text-xl mr-2"></i> 
                <span>Ingresar</span>
            </a>
        `;
    }
}

// Función para abrir/cerrar menú móvil
window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('hidden');
};

// Función auxiliar para resaltar la página actual
function isActive(pagina, esMovil = false) {
    const path = window.location.pathname;
    // Si la url contiene el nombre de la página, devolvemos la clase de color activo
    if (path.includes(pagina) || (pagina === 'index.html' && (path.endsWith('/') || path.endsWith('index.html')))) {
        return esMovil ? "text-orange-600" : "text-orange-600 border-b-2 border-orange-500";
    }
    return esMovil ? "text-gray-400" : "";
}