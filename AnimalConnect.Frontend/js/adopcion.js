// js/adopcion.js

let listaMatchesGlobal = [];
const currentUser = JSON.parse(localStorage.getItem('zoonosis_user'));

// Variables para el modal de adopción (si está en esta página)
let mapModalAdopcion, markerModalAdopcion, coordsReporteAdopcion;

document.addEventListener('DOMContentLoaded', () => {
    cargarAdopcion();
});

async function cargarAdopcion() {
    const grid = document.getElementById('grid-adopcion');
    const filtrosDiv = document.getElementById('filtros-match');

    if(grid) grid.innerHTML = '<div class="col-span-3 text-center text-gray-400"><i class="fa-solid fa-spinner fa-spin"></i> Cargando...</div>';
    
    // Ocultar banners
    if(document.getElementById('banner-login-adopcion')) document.getElementById('banner-login-adopcion').classList.add('hidden');
    if(document.getElementById('banner-match-ok')) document.getElementById('banner-match-ok').classList.add('hidden');
    if(filtrosDiv) filtrosDiv.classList.add('hidden');

    // CASO 1: Invitado
    if (!currentUser) {
        mostrarBanner('banner-login-adopcion');
        const res = await fetch(`${API_URL}/Animales`);
        const todos = await res.json();
        renderizarTarjetasAdopcion(todos.filter(a => a.idEstado === 1), false);
    } 
    // CASO 2: Logueado sin Quiz
    else if (currentUser && !currentUser.tienePerfilMatch) {
        const b = document.getElementById('banner-login-adopcion');
        if(b) {
            b.classList.remove('hidden');
            b.querySelector('h2').innerText = `Hola ${currentUser.nombre}, completa tu perfil`;
            b.querySelector('p').innerText = "Para calcular la compatibilidad, necesitamos saber sobre tu hogar.";
            b.querySelector('a').innerText = "Ir al Cuestionario";
            b.querySelector('a').href = "quiz.html";
        }
        
        const res = await fetch(`${API_URL}/Animales`);
        const todos = await res.json();
        renderizarTarjetasAdopcion(todos.filter(a => a.idEstado === 1), false);
    } 
    // CASO 3: Match Activo
    else {
        mostrarBanner('banner-match-ok');
        const res = await fetch(`${API_URL}/Match/${currentUser.id}`);
        if (res.ok) {
            const matches = await res.json();
            
            // Mapeamos respuesta
            listaMatchesGlobal = matches.map(m => {
                m.animal.matchDetails = m; 
                m.animal.matchScore = m.porcentajeMatch;
                return m.animal;
            });

            if(filtrosDiv) filtrosDiv.classList.remove('hidden');
            
            // Default: Estricto
            filtrarPorMatch('estricto');
        }
    }
}

function filtrarPorMatch(criterio) {
    // Actualizar botones visualmente
    ['estricto', 'intermedio', 'todos'].forEach(b => {
        const btn = document.getElementById(`btn-match-${b}`);
        if(btn) {
            if (b === criterio) btn.className = "px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-700 transition border border-green-200 ring-2 ring-green-500";
            else btn.className = "px-4 py-2 rounded-full text-sm font-bold bg-white text-gray-600 hover:bg-gray-100 transition border border-gray-200";
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
                <div class="col-span-3 text-center py-10">
                    <i class="fa-solid fa-filter text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500">No hay animales con este nivel de compatibilidad.</p>
                    <button onclick="filtrarPorMatch('todos')" class="text-blue-500 hover:underline mt-2 text-sm">Ver todos</button>
                </div>`;
        } else {
            grid.innerHTML = '<p class="col-span-3 text-center text-gray-500">No hay animales en adopción por el momento.</p>';
        }
        return;
    }

    lista.forEach((a, index) => {
        let badge = '';
        let btnDetalles = '';

        if (conMatch && a.matchScore !== undefined) {
            let color = a.matchScore >= 80 ? 'bg-green-500' : (a.matchScore >= 50 ? 'bg-yellow-500' : 'bg-red-500');
            badge = `<div class="absolute top-2 right-2 ${color} text-white text-xs font-bold px-2 py-1 rounded shadow z-10">${a.matchScore}% Match</div>`;
            
            btnDetalles = `
                <button onclick="verDetalleMatch(${index})" class="w-full mt-3 border border-orange-100 text-orange-600 text-xs font-bold py-2 rounded hover:bg-orange-50 transition flex items-center justify-center">
                    <i class="fa-solid fa-magnifying-glass-chart mr-1"></i> Ver Análisis
                </button>`;
        }

        grid.innerHTML += `
            <div class="bg-white rounded-xl shadow-lg relative overflow-hidden group hover:-translate-y-1 transition duration-300 flex flex-col">
                ${badge}
                <div class="relative h-56">
                    <img src="${a.imagenUrl || 'https://via.placeholder.com/400'}" class="w-full h-full object-cover">
                </div>
                <div class="p-5 flex-1 flex flex-col">
                    <h3 class="text-xl font-bold text-gray-800">${a.nombre}</h3>
                    <p class="text-sm text-gray-600 mt-1 line-clamp-2 flex-1">${a.descripcion}</p>
                    ${btnDetalles}
                    <div class="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                        ${generarBotonWsp(a)}
                    </div>
                </div>
            </div>
        `;
    });

    // Guardamos referencia para el modal de detalles
    window.listaAdopcionActual = lista;
}

// --- MODAL DETALLES MATCH ---
function verDetalleMatch(index) {
    const animal = window.listaAdopcionActual[index];
    const modal = document.getElementById('modal-match');
    
    document.getElementById('match-img').src = animal.imagenUrl || 'https://via.placeholder.com/400';
    document.getElementById('match-nombre').innerText = animal.nombre;
    const badge = document.getElementById('match-badge-modal');
    badge.innerText = `${animal.matchScore}%`;
    
    // Colores badge
    badge.className = "text-xl font-bold px-4 py-2 rounded-lg shadow-sm " + 
        (animal.matchScore >= 80 ? 'bg-green-100 text-green-700' : (animal.matchScore >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'));

    const listaUl = document.getElementById('match-razones');
    listaUl.innerHTML = '';

    if (animal.matchDetails.razonesMatch && animal.matchDetails.razonesMatch.length > 0) {
        animal.matchDetails.razonesMatch.forEach(razon => {
            listaUl.innerHTML += `<li class="flex items-start"><i class="fa-solid fa-check text-green-500 mt-1 mr-2"></i><span>${razon}</span></li>`;
        });
    } else {
        listaUl.innerHTML = `<li class="flex items-start text-orange-600"><i class="fa-solid fa-triangle-exclamation mt-1 mr-2"></i><span>Baja compatibilidad detectada.</span></li>`;
    }

    modal.classList.remove('hidden');
}

// Helper UI
function mostrarBanner(id) {
    const b = document.getElementById(id);
    if(b) b.classList.remove('hidden');
}

// Helper Botón Whatsapp (Duplicado para independencia, o pon en utils.js)
function generarBotonWsp(a) {
    if (!a.telefonoContacto) return '';
    const num = a.telefonoContacto.replace(/\D/g, '');
    return `<a href="https://wa.me/549${num}" target="_blank" class="flex-1 bg-green-500 text-white text-center px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition flex items-center justify-center"><i class="fa-brands fa-whatsapp mr-2"></i> Contactar</a>`;
}

// NOTA: Si en adopcion.html también tienes el botón "Dar en Adopción",
// deberías copiar aquí las funciones abrirModalReporte y enviarReporte
// pero configuradas para estado = 1 (Adopción) y mostrando los atributos extra.