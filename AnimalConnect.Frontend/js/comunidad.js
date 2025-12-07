// js/comunidad.js

let paginaActual = 1;
const postsPorPagina = 5;
let hayMasPosts = true;
const currentUser = JSON.parse(localStorage.getItem('zoonosis_user'));

document.addEventListener('DOMContentLoaded', () => {
    // Redirección desde Perfil
    const params = new URLSearchParams(window.location.search);
    if (params.get('modo') === 'historia' && currentUser) {
        setTimeout(() => {
            const cat = document.getElementById('post-categoria');
            const tit = document.getElementById('post-titulo');
            const cont = document.getElementById('post-contenido');
            
            if(cat) cat.value = 'Historia';
            if(tit) tit.value = "¡Final Feliz! Encontré a mi mascota 🎉";
            if(cont) cont.focus();
        }, 500);
    }

    cargarMuro(true);
});

async function cargarMuro(reset = false) {
    // Mostrar/Ocultar caja de publicar
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
        const res = await fetch(`${API_URL}/Foro?pagina=${paginaActual}&cantidad=${postsPorPagina}`);
        const respuesta = await res.json();
        
        const listaPosts = respuesta.data || respuesta; 
        hayMasPosts = respuesta.hayMas;

        renderizarFeed(listaPosts);

        const btn = document.getElementById('btn-load-more-container');
        if(btn) {
            if(hayMasPosts) btn.classList.remove('hidden');
            else btn.classList.add('hidden');
        }

    } catch (e) { console.error("Error muro:", e); }
}

function cargarMasPosts() {
    paginaActual++;
    cargarMuro(false);
}

function renderizarFeed(posts) {
    const container = document.getElementById('contenedor-muro');
    if(!container) return;

    if (!Array.isArray(posts)) return;

    if (paginaActual === 1) container.innerHTML = '';

    if (posts.length === 0 && paginaActual === 1) {
        container.innerHTML = '<div class="text-center py-10 bg-white rounded-xl shadow-sm"><p class="text-gray-500">Aún no hay publicaciones.</p></div>';
        return;
    }

    posts.forEach(p => {
        let iconoCat = 'fa-question-circle text-blue-500';
        if(p.categoria === 'Historia') iconoCat = 'fa-heart text-red-500';
        if(p.categoria === 'Aviso') iconoCat = 'fa-bullhorn text-yellow-600';

        const puntosAutor = p.autorPuntos ? p.autorPuntos : 0;
        const puntosHtml = (puntosAutor > 0 && !p.esVeterinario) 
            ? `<span class="text-[10px] text-yellow-600 font-bold ml-1 bg-yellow-50 px-1.5 py-0.5 rounded border border-yellow-200 align-middle"><i class="fa-solid fa-star text-yellow-500 mr-0.5"></i>${puntosAutor}</span>` 
            : '';

        const badgeAutor = p.esVeterinario 
            ? `<span class="badge-vet text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">Vet</span>` 
            : `<span class="badge-user text-[10px] px-2 py-0.5 rounded-full font-bold ml-2">Vecino</span>`;

        let htmlComentarios = p.comentarios.map(c => crearHtmlComentario(c)).join('');
        
        let btnMasComentarios = '';
        if (p.totalComentarios > p.comentarios.length) {
            const faltan = p.totalComentarios - p.comentarios.length;
            btnMasComentarios = `<button onclick="cargarTodosComentarios(${p.id}, this)" class="text-xs text-blue-500 font-bold hover:underline mb-2 pl-2">Ver ${faltan} comentarios más...</button>`;
        }

        const inputComentario = currentUser 
            ? `<div class="flex gap-2 mt-3"><input type="text" id="coment-${p.id}" placeholder="Responder..." class="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-orange-300"><button onclick="enviarComentario(${p.id})" class="text-orange-600 hover:text-orange-700 px-2"><i class="fa-solid fa-paper-plane"></i></button></div>` 
            : '';

        const div = document.createElement('div');
        div.className = "bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-4 animate-fade-in-up";
        div.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <div class="flex items-center">
                    <div class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mr-3"><i class="fa-solid fa-user"></i></div>
                    <div>
                        <p class="font-bold text-sm text-gray-800 flex items-center">${p.autor} ${badgeAutor} ${puntosHtml}</p>
                        <p class="text-xs text-gray-400">${new Date(p.fechaPublicacion).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="text-xl ${iconoCat}" title="${p.categoria}"><i class="fa-solid ${iconoCat.split(' ')[0]}"></i></div>
            </div>
            <h4 class="font-bold text-lg text-gray-900 mb-1">${p.titulo}</h4>
            <p class="text-gray-600 text-sm mb-4 leading-relaxed">${p.contenido}</p>
            <div class="border-t border-gray-100 pt-3">
                <div id="contenedor-comentarios-${p.id}" class="mb-2 space-y-2">${btnMasComentarios}${htmlComentarios}</div>
                ${inputComentario}
            </div>
        `;
        container.appendChild(div);
    });
}

function crearHtmlComentario(c) {
    const badgeCom = c.esVeterinario ? `<i class="fa-solid fa-circle-check text-blue-500 ml-1" title="Vet"></i>` : '';
    const ptsCom = (c.autorPuntos > 0 && !c.esVeterinario) ? `<span class="text-[10px] text-gray-400 ml-1"><i class="fa-solid fa-star text-yellow-400"></i> ${c.autorPuntos}</span>` : '';

    return `
        <div class="bg-gray-50 p-2 rounded-lg mb-2 text-sm border-l-2 ${c.esVeterinario ? 'border-blue-400' : 'border-gray-200'}">
            <div class="flex items-center mb-1">
                <span class="font-bold text-gray-700 text-xs mr-1">${c.autor}</span>
                ${badgeCom} ${ptsCom}
            </div>
            <p class="text-gray-600">${c.contenido}</p>
        </div>
    `;
}

async function cargarTodosComentarios(postId, btn) {
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
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

    if(!titulo || !contenido) return alert("Completa los campos.");

    try {
        const res = await fetch(`${API_URL}/Foro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ titulo, contenido, categoria, usuarioId: currentUser.id })
        });

        if(res.ok) {
            const data = await res.json();
            const pts = data.nuevosPuntos || data.NuevosPuntos;
            if(pts !== undefined) {
                currentUser.puntos = pts;
                localStorage.setItem('zoonosis_user', JSON.stringify(currentUser));
                if(typeof actualizarEstadoUsuario === 'function') actualizarEstadoUsuario();
            }

            if(categoria === 'Historia') alert(`¡Gracias por compartir! +50 Puntos.`);
            else alert(`Publicado.`);
            
            document.getElementById('post-titulo').value = '';
            document.getElementById('post-contenido').value = '';
            cargarMuro(true); 
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