// js/hogar-wizard.js

let currentStep = 1;
const totalSteps = 3;
let mapHogar, markerHogar, coordsSelected = null;
let modoEdicion = false; // Nueva bandera
let hogarId = null;      // Para guardar el ID si editamos
const user = getUsuario();

// Validación inicial
if (!user) window.location.href = 'login.html';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Detectar si venimos a EDITAR (buscamos parámetro en URL)
    const params = new URLSearchParams(window.location.search);
    if (params.get('editar') === 'true') {
        modoEdicion = true;
        document.title = "Editar Hogar - Animal Connect";
        // Cambiamos textos visuales
        const titulo = document.querySelector('h3') || document.querySelector('.text-xl'); 
        if(titulo) titulo.innerHTML = '<i class="fa-solid fa-pen-to-square mr-2"></i> Editar mi Hogar';
        
        // Cargar datos existentes
        await cargarDatosExistentes();
    }

    AppState.onReady((loc) => {
        // Si ya cargamos coords en modo edición, usamos esas, sino la del GPS
        const centro = coordsSelected || loc; 
        initMap(centro);
    });
});

async function cargarDatosExistentes() {
    try {
        const res = await fetch(`${API_URL}/Hogares/mi-hogar/${user.id}`);
        if(res.ok) {
            const h = await res.json();
            hogarId = h.id;
            
            // --- LLENAR CAMPOS ---
            
            // Paso 1: Ubicación
            document.getElementById('h-direccion').value = h.direccionAproximada;
            coordsSelected = { lat: h.latitud, lng: h.longitud }; // Guardar coords
            document.getElementById('coords-msg').innerText = "Ubicación cargada (Puedes cambiarla)";
            document.getElementById('coords-msg').className = "text-center text-xs text-blue-600 font-bold mt-2";

            // Paso 2: Características
            // Radio Buttons (Vivienda)
            const radioVivienda = document.querySelector(`input[name="tipo"][value="${h.tipoVivienda}"]`);
            if(radioVivienda) radioVivienda.checked = true;

            // Checkboxes
            document.getElementById('chk-patio').checked = h.tienePatioCerrado;
            document.getElementById('chk-mascotas').checked = h.tieneOtrasMascotas;
            document.getElementById('chk-ninos').checked = h.tieneNinos;

            // Paso 3: Disponibilidad
            const radioDisp = document.querySelector(`input[name="disp"][value="${h.disponibilidadHoraria}"]`);
            if(radioDisp) radioDisp.checked = true;

            document.getElementById('sel-tiempo').value = h.tiempoCompromiso;
            document.getElementById('chk-cuidados').checked = h.aceptaCuidadosEspeciales;

            // Cambiar texto del botón final
            document.getElementById('btn-submit').innerText = "Guardar Cambios";
        }
    } catch(e) { console.error(e); }
}

function cambiarPaso(delta) {
    // Validaciones
    if (delta > 0) {
        if (currentStep === 1) {
            if (!document.getElementById('h-direccion').value) return Swal.fire('Falta Dirección', 'Escribe una referencia de barrio o calle.', 'warning');
            if (!coordsSelected) return Swal.fire('Falta Ubicación', 'Por favor marca tu casa en el mapa.', 'warning');
        }
    }

    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    currentStep += delta;
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');

    actualizarUI();
}

function actualizarUI() {
    // Barra
    const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    document.getElementById('progress-bar').style.width = `${percent}%`;

    // Indicadores
    for (let i = 1; i <= totalSteps; i++) {
        const ind = document.getElementById(`ind-${i}`);
        if (i <= currentStep) {
            ind.className = "w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all";
        } else {
            ind.className = "w-8 h-8 bg-white border-2 border-gray-200 text-gray-400 rounded-full flex items-center justify-center font-bold text-sm";
        }
    }

    // Botones
    document.getElementById('btn-prev').disabled = (currentStep === 1);
    
    if (currentStep === totalSteps) {
        document.getElementById('btn-next').classList.add('hidden');
        document.getElementById('btn-submit').classList.remove('hidden');
    } else {
        document.getElementById('btn-next').classList.remove('hidden');
        document.getElementById('btn-submit').classList.add('hidden');
    }
}

function initMap(loc) {
    if (mapHogar) return;
    mapHogar = L.map('map-hogar').setView([loc.lat, loc.lng], 15);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapHogar);
    
    const iconHome = L.divIcon({
        html: '<i class="fa-solid fa-house-chimney text-3xl text-teal-600 drop-shadow-md"></i>',
        className: 'bg-transparent',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });

    // Si estamos en edición, poner el marcador de una
    if (modoEdicion && coordsSelected) {
        markerHogar = L.marker(coordsSelected, {icon: iconHome}).addTo(mapHogar);
    }

    mapHogar.on('click', e => {
        coordsSelected = e.latlng;
        if (markerHogar) markerHogar.setLatLng(e.latlng);
        else markerHogar = L.marker(e.latlng, {icon: iconHome}).addTo(mapHogar);
        
        document.getElementById('coords-msg').innerText = "Ubicación actualizada";
        document.getElementById('coords-msg').className = "text-center text-xs text-green-600 font-bold mt-2";
    });
}

async function finalizarHogarWizard(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit');
    const textoOriginal = btn.innerText;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Procesando...';
    btn.disabled = true;

    const dto = {
        usuarioId: user.id,
        direccion: document.getElementById('h-direccion').value,
        latitud: coordsSelected.lat,
        longitud: coordsSelected.lng,
        tipoVivienda: document.querySelector('input[name="tipo"]:checked').value,
        tienePatio: document.getElementById('chk-patio').checked,
        tieneMascotas: document.getElementById('chk-mascotas').checked,
        tieneNinos: document.getElementById('chk-ninos').checked,
        disponibilidad: parseInt(document.querySelector('input[name="disp"]:checked').value),
        tiempo: document.getElementById('sel-tiempo').value,
        cuidadosEsp: document.getElementById('chk-cuidados').checked
    };

    try {
        let url = `${API_URL}/Hogares`;
        let method = 'POST';

        // LÓGICA DE EDICIÓN VS CREACIÓN
        if (modoEdicion && hogarId) {
            url = `${API_URL}/Hogares/${hogarId}`;
            method = 'PUT';
        }

        const res = await fetch(url, {
            method: method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(dto)
        });

        if (res.ok) {
            await Swal.fire({
                title: modoEdicion ? '¡Actualizado!' : '¡Hogar Registrado!',
                text: modoEdicion ? 'Los datos de tu hogar se han actualizado correctamente.' : 'Gracias por unirte a la red de tránsito.',
                icon: 'success',
                confirmButtonColor: '#0d9488'
            });
            window.location.href = 'perfil.html';
        } else {
            const txt = await res.text();
            throw new Error(txt);
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Error', 'No se pudo guardar: ' + err.message, 'error');
        btn.innerText = textoOriginal;
        btn.disabled = false;
    }
}