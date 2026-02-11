// js/state.js

const AppState = {
    // Ubicación por defecto (Pringles) para que la app no se rompa si falla el GPS
    location: { lat: -37.994, lng: -61.353 }, 
    municipioId: null, // Para el futuro SaaS
    isReady: false,
    observers: [], // Lista de funciones esperando que cargue la ubicación

    // Inicializa la detección (Llamar al principio)
    async init() {
        console.log("🌍 Buscando ubicación del usuario...");
        
        // 1. Intentar recuperar de memoria (si el usuario ya eligió antes)
        const stored = localStorage.getItem('ac_location');
        if (stored) {
            this.location = JSON.parse(stored);
            this.finalizarCarga();
            return;
        }

        // 2. Si no hay memoria, pedir GPS al navegador
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    // Guardamos para no molestar al usuario cada vez
                    localStorage.setItem('ac_location', JSON.stringify(this.location));
                    this.finalizarCarga();
                },
                (error) => {
                    console.warn("⚠️ GPS denegado o error. Usando ubicación por defecto (Pringles).");
                    // Aquí en el futuro abriremos el Modal "Selecciona tu ciudad"
                    this.finalizarCarga();
                }
            );
        } else {
            console.error("Navegador no soporta Geolocalización");
            this.finalizarCarga();
        }
    },

    // Avisa a todos los scripts que ya tenemos coordenadas
    finalizarCarga() {
        console.log("📍 Ubicación fijada:", this.location);
        this.isReady = true;
        this.observers.forEach(callback => callback(this.location));
        this.observers = []; // Limpiamos la cola
    },

    // Función que usarán index.js, adopcion.js, etc. para esperar
    onReady(callback) {
        if (this.isReady) {
            callback(this.location);
        } else {
            this.observers.push(callback);
        }
    },

    // Función para forzar cambio de ciudad manual (SaaS feature)
    cambiarUbicacion(lat, lng) {
        this.location = { lat, lng };
        localStorage.setItem('ac_location', JSON.stringify(this.location));
        location.reload(); // Recargamos para refrescar todo con la nueva zona
    }
};

// Arrancamos el motor automáticamente
AppState.init();