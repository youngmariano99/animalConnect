import axios from 'axios';
import type { Animal } from '../types/Animal';

const API_URL = 'http://localhost:5269/api/Match';

export interface MatchRequest {
    nivelActividad: number;
    horasFuera: number;
    tieneNinos: boolean;
    tienePerros: boolean;
    tieneGatos: boolean;
    tipoVivienda: string;
    presupuestoMensual: number;
}

export interface MatchResult {
    animal: Animal;
    matchPercentage: number;
    etiquetas: string[];
}

export const MatchService = {
    calculateMatch: async (request: MatchRequest): Promise<MatchResult[]> => {
        const response = await axios.post<MatchResult[]>(`${API_URL}/calculate`, request);
        return response.data;
    }
};
