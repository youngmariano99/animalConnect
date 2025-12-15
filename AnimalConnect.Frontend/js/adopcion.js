// js/adopcion.js

let listaMatchesGlobal = [];
const currentUser = JSON.parse(localStorage.getItem('zoonosis_user'));

document.addEventListener('DOMContentLoaded', () => {
    AppState.onReady((location) => {
        cargarAdopcion(); // A futuro: cargarAdopcion(location);
    });
});

async function cargarAdopcion() {
    const grid = document.getElementById('grid-adopcion');
    const filtrosDiv = document.getElementById('filtros-match');

    if(grid) grid.innerHTML = '<div class="col-span-3 text-center text-gray-400 py-10"><i class="fa-solid fa-spinner fa-spin text-2xl"></i><p class="mt-2">Analizando compatibilidad...</p></div>';
    
    // Ocultar elementos UI
    if(document.getElementById('banner-login-adopcion')) document.getElementById('banner-login-adopcion').classList.add('hidden');
    if(document.getElementById('banner-match-ok')) document.getElementById('banner-match-ok').classList.add('hidden');
    if(filtrosDiv) filtrosDiv.classList.add('hidden');

    // 1. USUARIO NO LOGUEADO O SIN PERFIL -> Mostrar todos sin match
    if (!currentUser || (currentUser && !currentUser.tienePerfilMatch)) {
        if (!currentUser) mostrarBanner('banner-login-adopcion');
        else mostrarBanner('banner-login-adopcion'); // Reusamos el banner invitando al Quiz
        
        // Modificamos texto del banner si es usuario sin quiz
        if(currentUser) {
            const b = document.getElementById('banner-login-adopcion');
            b.querySelector('h2').innerText = `Hola ${currentUser.nombre}, completa tu perfil`;
            b.querySelector('p').innerText = "Para calcular la compatibilidad exacta, responde unas breves preguntas.";
            b.querySelector('a').innerText = "Ir al Cuestionario";
            b.querySelector('a').href = "quiz.html";
        }

        const loc = AppState.location;
        const res = await fetch(`${API_URL}/Animales?lat=${loc.lat}&lng=${loc.lng}&radio=100`); // Radio más amplio para adopción (100km)
        
        const todos = await res.json();
        renderizarTarjetasAdopcion(todos.filter(a => a.idEstado === 1), false);
    } 
    // 2. USUARIO CON PERFIL -> Mostrar con Match
    else {
        mostrarBanner('banner-match-ok');
        
        // OBTENEMOS UBICACIÓN DEL ESTADO
        const loc = AppState.location;

        // AGREGAMOS QUERY PARAMS A LA PETICIÓN
        const res = await fetch(`${API_URL}/Match/${currentUser.id}?lat=${loc.lat}&lng=${loc.lng}&radio=100`);
        
        if (res.ok) {
            const matches = await res.json();
            
            // Transformamos la data para que el renderizador la entienda
            listaMatchesGlobal = matches.map(m => {
                // Inyectamos los detalles del match dentro del objeto animal
                m.animal.matchDetails = m; 
                m.animal.matchScore = m.porcentajeMatch;
                return m.animal;
            });

            if(filtrosDiv) filtrosDiv.classList.remove('hidden');
            
            // Por defecto mostramos los de alta compatibilidad
            filtrarPorMatch('estricto');
        }
    }
}

function filtrarPorMatch(criterio) {
    // Actualizar botones visualmente
    ['estricto', 'intermedio', 'todos'].forEach(b => {
        const btn = document.getElementById(`btn-match-${b}`);
        if(btn) {
            if (b === criterio) btn.className = "px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-700 transition border border-green-200 ring-2 ring-green-500 shadow-inner";
            else btn.className = "px-4 py-2 rounded-full text-sm font-bold bg-white text-gray-600 hover:bg-gray-100 transition border border-gray-200 shadow-sm";
        }
    });

    let filtrados = [];
    if (criterio === 'estricto') filtrados = listaMatchesGlobal.filter(a => a.matchScore >= 80);
    else if (criterio === 'intermedio') filtrados = listaMatchesGlobal.filter(a => a.matchScore >= 50);
    else filtrados = listaMatchesGlobal;

    renderizarTarjetasAdopcion(filtrados, true);
}

function renderizarTarjetasAdopcion(lista, conMatch) {
    const grid = document.getElementById('grid-adopcion');
    if(!grid) return;
    
    grid.innerHTML = '';

    if (lista.length === 0) {
        if (conMatch) {
            grid.innerHTML = `
                <div class="col-span-3 text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <i class="fa-solid fa-filter-circle-xmark text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500 font-medium">No encontramos mascotas con este nivel de compatibilidad.</p>
                    <p class="text-sm text-gray-400 mb-4">Intenta ser más flexible con los filtros.</p>
                    <button onclick="filtrarPorMatch('todos')" class="text-blue-600 font-bold hover:underline text-sm">Ver todas las mascotas disponibles</button>
                </div>`;
        } else {
            grid.innerHTML = '<p class="col-span-3 text-center text-gray-500 py-10">No hay animales en adopción por el momento.</p>';
        }
        return;
    }

    lista.forEach((a, index) => {
        let badge = '';
        let btnDetalles = '';

        if (conMatch && a.matchScore !== undefined) {
            let color = 'bg-gray-500';
            if(a.matchScore >= 80) color = 'bg-green-500'; 
            else if(a.matchScore >= 50) color = 'bg-yellow-500'; 
            else color = 'bg-red-500';
            
            badge = `<div class="absolute top-3 right-3 ${color} text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 flex items-center"><i class="fa-solid fa-percent mr-1"></i>${a.matchScore} Match</div>`;
            
            btnDetalles = `
                <button onclick="verDetalleMatch(${index})" class="w-full mt-3 border border-blue-100 text-blue-600 text-xs font-bold py-2 rounded-lg hover:bg-blue-50 transition flex items-center justify-center">
                    <i class="fa-solid fa-magnifying-glass-chart mr-2"></i> Ver Análisis de Compatibilidad
                </button>`;
        }

        grid.innerHTML += `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition duration-300 flex flex-col">
                ${badge}
                <div class="relative h-64 overflow-hidden">
                    <img src="${a.imagenUrl || 'https://via.placeholder.com/400'}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110">
                    <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-4">
                        <h3 class="text-2xl font-bold text-white">${a.nombre}</h3>
                        <p class="text-white/90 text-xs flex items-center"><i class="fa-solid fa-paw mr-1"></i> ${a.especie?.nombre || 'Mascota'}</p>
                    </div>
                </div>
                <div class="p-5 flex-1 flex flex-col">
                    <p class="text-sm text-gray-600 line-clamp-3 mb-4 flex-1 leading-relaxed">${a.descripcion}</p>
                    
                    ${btnDetalles}

                    <div class="mt-4 pt-4 border-t border-gray-100">
                        ${generarBotonWsp(a)}
                    </div>
                </div>
            </div>
        `;
    });

    window.listaAdopcionActual = lista;
}

// --- MODAL DETALLES MATCH ---
function verDetalleMatch(index) {
    const animal = window.listaAdopcionActual[index];
    const modal = document.getElementById('modal-match');
    
    // Header Modal
    document.getElementById('match-img').src = animal.imagenUrl || 'https://via.placeholder.com/400';
    document.getElementById('match-nombre').innerText = animal.nombre;
    
    // Badge Score
    const badge = document.getElementById('match-badge-modal');
    badge.innerText = `${animal.matchScore}% Compatible`;
    
    // Color dinámico del badge en modal
    badge.className = "text-lg font-bold px-4 py-1 rounded-full shadow-sm border " + 
        (animal.matchScore >= 80 ? 'bg-green-100 text-green-700 border-green-200' : 
        (animal.matchScore >= 50 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                                   'bg-red-100 text-red-700 border-red-200'));

    // Renderizar Lista de Razones (con íconos dinámicos)
    const listaUl = document.getElementById('match-razones');
    listaUl.innerHTML = '';

    if (animal.matchDetails.razonesMatch && animal.matchDetails.razonesMatch.length > 0) {
        animal.matchDetails.razonesMatch.forEach(razon => {
            let icon = 'fa-check-circle text-green-500'; // Default positivo
            let bgClass = 'bg-green-50 border-green-100';

            // Detectar tipo de mensaje por el emoji que manda el backend
            if (razon.includes('⚠️')) {
                icon = 'fa-triangle-exclamation text-yellow-500';
                bgClass = 'bg-yellow-50 border-yellow-100';
            } else if (razon.includes('❌')) {
                icon = 'fa-circle-xmark text-red-500';
                bgClass = 'bg-red-50 border-red-100';
            }

            // Limpiamos el emoji del texto para que no se duplique con el FontAwesome
            const textoLimpio = razon.replace(/✅|⚠️|❌/g, '').trim();

            listaUl.innerHTML += `
                <li class="flex items-start p-3 rounded-lg border ${bgClass} mb-2">
                    <i class="fa-solid ${icon} mt-0.5 mr-3 text-lg flex-shrink-0"></i>
                    <span class="text-gray-700 text-sm leading-snug">${textoLimpio}</span>
                </li>
            `;
        });
    } else {
        // Caso raro: score bajo sin razones específicas
        listaUl.innerHTML = `
            <li class="flex items-center p-4 bg-orange-50 text-orange-700 rounded-lg border border-orange-100">
                <i class="fa-solid fa-circle-info mr-3 text-xl"></i>
                <span class="text-sm">No encontramos coincidencias fuertes en tu perfil, pero el amor todo lo puede.</span>
            </li>
        `;
    }

    modal.classList.remove('hidden');
}

function mostrarBanner(id) {
    const b = document.getElementById(id);
    if(b) b.classList.remove('hidden');
}

function generarBotonWsp(a) {
    if (!a.telefonoContacto) return '';
    const num = a.telefonoContacto.replace(/\D/g, '');
    return `<a href="https://wa.me/549${num}" target="_blank" class="block w-full bg-green-500 text-white text-center px-4 py-3 rounded-xl text-sm font-bold hover:bg-green-600 transition shadow-sm hover:shadow-md flex items-center justify-center group">
        <i class="fa-brands fa-whatsapp text-lg mr-2 group-hover:scale-110 transition"></i> Contactar ahora
    </a>`;
}

function obtenerBadgeOng(animal) {
    if (animal.usuario && animal.usuario.organizaciones && animal.usuario.organizaciones.length > 0) {
        // Buscamos alguna aprobada
        const ong = animal.usuario.organizaciones.find(o => o.organizacion && o.organizacion.estadoVerificacion === 'Aprobado');
        if (ong) {
            return `<div class="absolute top-2 left-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md z-10">
                        <i class="fa-solid fa-hand-holding-heart mr-1"></i> ${ong.organizacion.nombre}
                    </div>`;
        }
    }
    return '';
}