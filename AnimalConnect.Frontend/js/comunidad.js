// js/comunidad.js

// --- CONFIGURACIÓN DE CATEGORÍAS ---
const CONFIG_CATEGORIAS = {
    "Duda": {
        label: "Consultas",
        icon: "fa-circle-question",
        colorClass: "text-blue-500",
        bgClass: "bg-blue-50",
        borderClass: "border-blue-200",
        descripcion: "Preguntas sobre cuidados, trámites o salud."
    },
    "Historia": {
        label: "Historias de Éxito",
        icon: "fa-heart",
        colorClass: "text-red-500",
        bgClass: "bg-red-50",
        borderClass: "border-red-200",
        descripcion: "Finales felices, reencuentros y adopciones."
    },
    "Aviso": {
        label: "Avisos Generales",
        icon: "fa-bullhorn",
        colorClass: "text-yellow-600",
        bgClass: "bg-yellow-50",
        borderClass: "border-yellow-200",
        descripcion: "Alertas vecinales, campañas o información útil."
    }
};

let paginaActual = 1;
const postsPorPagina = 5;
let hayMasPosts = true;
let categoriaActual = 'Todas'; // Variable que guarda el filtro actual
const currentUser = JSON.parse(localStorage.getItem('zoonosis_user'));

document.addEventListener('DOMContentLoaded', () => {
    inicializarInterfaz();
    
    // Si viene redirigido desde una Historia de Éxito
    const params = new URLSearchParams(window.location.search);
    if (params.get('modo') === 'historia') {
        categoriaActual = 'Historia'; // Forzamos filtro Historia
        actualizarEstilosFiltros();
        
        if (currentUser) {
            setTimeout(() => {
                const cat = document.getElementById('post-categoria');
                const tit = document.getElementById('post-titulo');
                const cont = document.getElementById('post-contenido');
                if(cat) cat.value = 'Historia';
                if(tit) tit.value = "¡Final Feliz! Encontré a mi mascota 🎉";
                if(cont) cont.focus();
            }, 500);
        }
    }

    cargarMuro(true);
});

// --- FUNCIÓN PRINCIPAL DE CARGA ---
async function cargarMuro(reset = false) {
    // 1. Gestionar visibilidad de caja publicar según login
    if(currentUser) {
        if(document.getElementById('box-publicar')) document.getElementById('box-publicar').classList.remove('hidden');
        if(document.getElementById('msg-login-comunidad')) document.getElementById('msg-login-comunidad').classList.add('hidden');
    } else {
        if(document.getElementById('box-publicar')) document.getElementById('box-publicar').classList.add('hidden');
        if(document.getElementById('msg-login-comunidad')) document.getElementById('msg-login-comunidad').classList.remove('hidden');
    }

    if (reset) {
        paginaActual = 1;
        const container = document.getElementById('contenedor-muro');
        if(container) container.innerHTML = '<div class="text-center py-10 text-gray-400"><i class="fa-solid fa-circle-notch fa-spin text-2xl"></i> Cargando muro...</div>';
    }

    try {
        // --- SAAS: OBTENER UBICACIÓN ---
        const loc = AppState.location;

        // Construir URL con parámetros
        const url = `${API_URL}/Foro?pagina=${paginaActual}&cantidad=${postsPorPagina}&categoria=${categoriaActual}&lat=${loc.lat}&lng=${loc.lng}`;
        
        console.log("Cargando URL:", url);

        const res = await fetch(url);
        const respuesta = await res.json();
        
        const listaPosts = respuesta.data || respuesta; 
        hayMasPosts = respuesta.hayMas;

        renderizarFeed(listaPosts);

        // ... (resto igual) ...
    } catch (e) { console.error("Error muro:", e); }
}

// --- GESTIÓN DE FILTROS (TABS) ---
function filtrarCategoria(cat) {
    categoriaActual = cat;
    paginaActual = 1;
    actualizarEstilosFiltros();
    cargarMuro(true); // Recargamos con el nuevo filtro
}

function actualizarEstilosFiltros() {
    // Resetear todos los botones
    document.querySelectorAll('.tab-filtro').forEach(btn => {
        // Estilo inactivo
        btn.className = "tab-filtro px-4 py-2 rounded-full text-sm font-bold text-gray-600 hover:bg-white hover:shadow-sm transition border border-transparent hover:border-gray-200 cursor-pointer";
    });

    // Activar el botón seleccionado
    const btnActivo = document.getElementById(`filtro-${categoriaActual}`);
    if(btnActivo) {
        // Estilo activo (oscuro)
        btnActivo.className = "tab-filtro px-4 py-2 rounded-full text-sm font-bold transition bg-gray-800 text-white shadow-md cursor-default";
    }
}

// ... Resto de funciones auxiliares (renderizarFeed, etc) ...

function cargarMasPosts() {
    paginaActual++;
    cargarMuro(false);
}

function inicializarInterfaz() {
    const select = document.getElementById('post-categoria');
    const leyendaContainer = document.getElementById('lista-leyenda');
    
    if(!select || !leyendaContainer) return;

    select.innerHTML = '';
    leyendaContainer.innerHTML = '';

    for (const [key, val] of Object.entries(CONFIG_CATEGORIAS)) {
        const option = document.createElement('option');
        option.value = key;
        option.text = val.label;
        select.appendChild(option);

        leyendaContainer.innerHTML += `
            <div class="flex items-start">
                <div class="w-8 flex-shrink-0 text-center">
                    <i class="fa-solid ${val.icon} ${val.colorClass} text-lg"></i>
                </div>
                <div>
                    <p class="font-bold text-gray-700">${val.label}</p>
                    <p class="text-gray-500 text-xs leading-tight">${val.descripcion}</p>
                </div>
            </div>
        `;
    }
}

function renderizarFeed(posts) {
    const container = document.getElementById('contenedor-muro');
    if(!container) return;

    if (!Array.isArray(posts)) return;

    if (paginaActual === 1) container.innerHTML = '';

    if (posts.length === 0 && paginaActual === 1) {
        container.innerHTML = `
            <div class="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <i class="fa-regular fa-comments text-4xl text-gray-300 mb-3"></i>
                <p class="text-gray-500">No hay publicaciones en la categoría <b>${categoriaActual}</b>.</p>
                <button onclick="filtrarCategoria('Todas')" class="text-blue-500 font-bold mt-2 hover:underline">Ver todo</button>
            </div>`;
        return;
    }

    posts.forEach(p => {
        const config = CONFIG_CATEGORIAS[p.categoria] || CONFIG_CATEGORIAS["Duda"]; 
        const puntosAutor = p.autorPuntos ? p.autorPuntos : 0;
        
        const puntosHtml = (puntosAutor > 0 && !p.esVeterinario) 
            ? `<span class="inline-flex items-center text-[10px] text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full ml-2 border border-yellow-200" title="Reputación"><i class="fa-solid fa-star text-yellow-500 mr-1"></i>${puntosAutor}</span>` 
            : '';

        const badgeAutor = p.esVeterinario 
            ? `<span class="badge-vet text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">Vet</span>` 
            : ``; 

        const badgeOng = p.nombreOng 
        ? `<span class="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 border border-purple-200" title="Miembro de Organización"><i class="fa-solid fa-heart mr-1"></i>${p.nombreOng}</span>`
        : '';
        let htmlComentarios = p.comentarios.map(c => crearHtmlComentario(c)).join('');
        
        let btnMasComentarios = '';
        if (p.totalComentarios > p.comentarios.length) {
            const faltan = p.totalComentarios - p.comentarios.length;
            btnMasComentarios = `
                <button onclick="cargarTodosComentarios(${p.id}, this)" class="w-full text-left text-xs text-blue-600 font-bold hover:bg-blue-50 py-2 px-2 rounded transition flex items-center">
                    <i class="fa-solid fa-comments mr-2"></i> Ver ${faltan} comentarios más...
                </button>`;
        }

        const inputComentario = currentUser 
            ? `<div class="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <img src="https://ui-avatars.com/api/?name=${currentUser.nombre}&background=random&color=fff&size=32" class="w-8 h-8 rounded-full hidden sm:block">
                <div class="flex-1 relative">
                    <input type="text" id="coment-${p.id}" placeholder="Escribe un comentario..." class="w-full bg-gray-50 border border-gray-200 rounded-full pl-4 pr-12 py-2 text-sm focus:outline-none focus:border-orange-300 focus:ring-1 focus:ring-orange-200 transition">
                    <button onclick="enviarComentario(${p.id})" class="absolute right-1 top-1 text-orange-500 hover:bg-orange-100 w-8 h-8 rounded-full transition flex items-center justify-center">
                        <i class="fa-solid fa-paper-plane"></i>
                    </button>
                </div>
               </div>` 
            : '';

        const avatarUrl = `https://ui-avatars.com/api/?name=${p.autor}&background=f3f4f6&color=6b7280&size=40`;

        const div = document.createElement('div');
        div.className = "bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6 animate-fade-in-up hover:shadow-md transition duration-300";
        div.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center">
                    <img src="${avatarUrl}" class="w-10 h-10 rounded-full mr-3 border border-gray-100">
                    <div>
                        <div class="flex items-center flex-wrap"> <p class="font-bold text-sm text-gray-800">${p.autor}</p>
                        ${badgeAutor}
                        ${badgeOng} ${puntosHtml}
                    </div>
                        <p class="text-xs text-gray-400 flex items-center">
                            <i class="fa-regular fa-clock mr-1"></i> ${new Date(p.fechaPublicacion).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                
                <div class="px-3 py-1 rounded-full text-xs font-bold flex items-center ${config.bgClass} ${config.colorClass} border ${config.borderClass}">
                    <i class="fa-solid ${config.icon} mr-1.5"></i>
                    ${config.label}
                </div>
            </div>

            <h4 class="font-bold text-lg text-gray-900 mb-2">${p.titulo}</h4>
            <p class="text-gray-600 text-sm mb-4 leading-relaxed">${p.contenido}</p>
            
            <div class="bg-gray-50/50 rounded-xl p-3 border border-gray-100">
                <div id="contenedor-comentarios-${p.id}" class="space-y-3">
                    ${btnMasComentarios}
                    ${htmlComentarios}
                </div>
                ${inputComentario}
            </div>
        `;
        container.appendChild(div);
    });
}

function crearHtmlComentario(c) {
    const badgeCom = c.esVeterinario 
        ? `<i class="fa-solid fa-circle-check text-blue-500 ml-1" title="Profesional Verificado"></i>` 
        : '';

    const badgeOng = c.nombreOng 
        ? `<span class="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 border border-purple-200" title="Miembro de Organización"><i class="fa-solid fa-heart mr-1"></i>${c.nombreOng}</span>`
        : '';
    
    const avatarUrl = `https://ui-avatars.com/api/?name=${c.autor}&background=ffffff&color=9ca3af&size=24`;

    return `
        <div class="flex gap-3 animate-fade-in-up">
            <img src="${avatarUrl}" class="w-6 h-6 rounded-full mt-1 opacity-70">
            <div class="bg-white p-2.5 rounded-lg rounded-tl-none border border-gray-200 shadow-sm text-sm flex-1 ${c.esVeterinario ? 'border-blue-200 bg-blue-50/30' : ''}">
                <div class="flex justify-between items-baseline mb-0.5">
                    <span class="font-bold text-gray-800 text-xs mr-2">${c.autor} ${badgeCom} ${badgeOng}</span>
                    <span class="text-[10px] text-gray-400">${new Date(c.fecha).toLocaleDateString()}</span>
                </div>
                <p class="text-gray-600 leading-snug">${c.contenido}</p>
            </div>
        </div>
    `;
}

async function cargarTodosComentarios(postId, btn) {
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cargando...';
    try {
        const res = await fetch(`${API_URL}/Foro/${postId}/comentarios?pagina=1&cantidad=50`);
        const lista = await res.json();
        const html = lista.map(c => crearHtmlComentario(c)).join('');
        document.getElementById(`contenedor-comentarios-${postId}`).innerHTML = html;
    } catch(e) { console.error(e); }
}

async function publicarPost() {
    const titulo = document.getElementById('post-titulo').value;
    const contenido = document.getElementById('post-contenido').value;
    const categoria = document.getElementById('post-categoria').value;

    if(!titulo || !contenido) {
        return Swal.fire('Faltan datos', 'Por favor completa título y contenido.', 'warning');
    }

    try {
        const loc = AppState.location;

        const bodyData = { 
            titulo, 
            contenido, 
            categoria, 
            usuarioId: currentUser.id,
            // Agregamos coordenadas al crear el post
            latitud: loc.lat, 
            longitud: loc.lng
        };

        const res = await fetch(`${API_URL}/Foro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodyData)
        });

        if(res.ok) {
            const data = await res.json();
            const pts = data.nuevosPuntos || data.NuevosPuntos;
            if(pts !== undefined) {
                currentUser.puntos = pts;
                localStorage.setItem('zoonosis_user', JSON.stringify(currentUser));
                if(typeof actualizarEstadoUsuario === 'function') actualizarEstadoUsuario();
            }

            // Alerta personalizada según categoría
            if(categoria === 'Historia') {
                Swal.fire({
                    title: '¡Historia Publicada!',
                    text: 'Gracias por inspirar a la comunidad. Has ganado +50 Puntos.',
                    icon: 'success',
                    backdrop: `rgba(0,0,123,0.4) url("https://media.giphy.com/media/UdMS154f3t3fa/giphy.gif") left top no-repeat` // Opcional: un gif de confeti
                });
            } else {
                Swal.fire({
                    title: 'Publicado',
                    text: 'Tu mensaje está en el muro. (+5 Puntos)',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
            
            document.getElementById('post-titulo').value = '';
            document.getElementById('post-contenido').value = '';
            
            // Recargamos el muro manteniendo el filtro actual para ver el post
            // Si el post es de otra categoría, deberíamos cambiar el filtro, 
            // pero por simplicidad recargamos lo actual.
            if(categoria !== categoriaActual && categoriaActual !== 'Todas') {
                 // Si estoy filtrando "Avisos" y publico una "Historia", cambio el filtro a Todas o Historia
                 filtrarCategoria(categoria);
            } else {
                 cargarMuro(true);
            }
        }
    } catch(e) { console.error(e); }
}

async function enviarComentario(postId) {
    const input = document.getElementById(`coment-${postId}`);
    const texto = input.value;
    if(!texto) return;

    try {
        const res = await fetch(`${API_URL}/Foro/${postId}/comentar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contenido: texto, usuarioId: currentUser.id })
        });

        if(res.ok) {
            const data = await res.json();
            const pts = data.nuevosPuntos || data.NuevosPuntos;
            if(pts !== undefined) {
                currentUser.puntos = pts;
                localStorage.setItem('zoonosis_user', JSON.stringify(currentUser));
                if(typeof actualizarEstadoUsuario === 'function') actualizarEstadoUsuario();
            }
            cargarTodosComentarios(postId, { innerHTML: '' });
            input.value = '';
        }
    } catch(e) { console.error(e); }
}