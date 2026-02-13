export interface Animal {
    id: number;
    nombre: string;
    descripcion: string;
    edadAproximada: number;
    imagenUrl?: string; // Optional
    especieId: number;
    especie?: { id: number; nombre: string };
    estadoId: number;
    estado?: { id: number; nombre: string };
    usuarioId: number;
    ubicacionLat?: number;
    ubicacionLon?: number;
    fechaCreacion: string;
    fechaUltimaRenovacion: string;

    // Bio-Tech Fields
    nivelEnergia: number;
    nivelInstintoPresa: number;
    nivelSociabilidadNinos: number;
    nivelSociabilidadPerros: number;
    nivelSociabilidadGatos: number;
    toleranciaSoledad: number;
    nivelMantenimiento: number;

    // Health Book
    pesoActual: number;
    vacunas?: Vacuna[];
}

export interface Vacuna {
    id: number;
    nombre: string;
    marca?: string;
    lote?: string;
    fechaAplicacion: string;
    fechaProximaDosis?: string;
    veterinario?: string;
    animalId: number;
}
