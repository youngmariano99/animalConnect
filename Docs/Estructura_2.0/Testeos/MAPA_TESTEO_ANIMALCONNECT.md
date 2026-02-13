# MAPA DE TESTEO INTEGRAL - ANIMALCONNECT 2.0

**Rol:** Lead QA Engineer
**Fecha Actualización:** 2026-02-12
**Estado:** **Versión Definitiva para MVP y Escalado**
**Contexto:** Plataforma Bio-Tech Humanista (C#/.NET, PostgreSQL/PostGIS, React/Vite)

Este documento define la estrategia de Calidad Total (TQM) para AnimalConnect. Basado en el análisis de código fuente (`Backend` y `Frontend`), se han identificado puntos críticos que requieren validación inmediata.

---

## 1. Matriz de Prioridades y Riesgos Detectados

| Nivel | Módulos / Funcionalidades | Riesgo Detectado en Código | Tipo de Test Mandatorio |
| :--- | :--- | :--- | :--- |
| **CRÍTICO 🚨** | **Auth & Identidad (Frontend)**<br>- `Login.tsx` | Manejo de sesión inseguro (`localStorage.setItem('usuario', JSON.stringify(...)`). Datos sensibles expuestos XSS. | Security (Audit) |
| **CRÍTICO 🚨** | **Seguridad de Datos (Backend)**<br>- `DeleteComercio` en `ComerciosController` | **VULNERABILIDAD IDOR:** No valida propiedad del recurso. | Security (Penetration Test) |
| **ALTA 🔥** | **Reporte de Perdidos (Frontend)**<br>- `ReportWizard.tsx` | Lógica Hardcoded: Especie ('1', '2') y falta de validación de tipos de archivo en subida de imagen. | E2E (Negative Testing) |
| **ALTA 🔥** | **Algoritmo de Match (Fullstack)**<br>- `MatchService.ts` & `MatchController` | Discrepancia de tipos: Frontend espera `razonesMatch` y Backend devuelve `Etiquetas`. | Integration (Contract Testing) |
| **ALTA 🔥** | **Rendimiento Geoespacial**<br>- Filtros por Radio | Filtrado en memoria en lugar de DB (`PostGIS`). | Performance (Load Test) |
| **MEDIA ⚠️** | **UX/UI (Adopcion.tsx)**<br>- Filtros | Lógica de filtrado "estricto" vs "flexible" hecha en cliente sobre todos los resultados. | Unit (Frontend Logic) |

---

## 2. Estrategia de Testing por Capas (Pyramid Testing)

### A. Pruebas Unitarias (Backend - xUnit / Frontend - Vitest)
*Foco: Reglas de Negocio, Algoritmos y Utilidades.*

1.  **Backend (Lógica Pura):**
    *   **MatchController:** Validar límites de `NivelSociabilidad` (< 7).
    *   **GeoService:** Validar fórmula Haversine (aunque se debe migrar a PostGIS).
2.  **Frontend (Componentes & Hooks):**
    *   **ReportWizard:** Simular paso a paso sin llenar datos obligatorios -> Verificar alertas `alert()`. *Mejorar a Toasts en el futuro.*
    *   **Login:** Verificar que al fallar la API, se limpie el estado de carga y muestre error.
    *   **MatchLogic:** Verificar que el filtro "Estricto" oculte items con score < 80.

### B. Pruebas de Integración (Backend - TestContainers)
*Foco: Interacción con PostgreSQL, Lógica de Controladores y Side-Effects.*

1.  **Persistencia y Consultas:**
    *   **Geo-Performance:** Insertar 1,000 comercios. Ejecutar `GetComercios`. Validar timeout.
    *   **Lazy Cleanup:** Verificar desactivación de clínicas tras 24hs.
2.  **Seguridad (IDOR Exploit):**
    *   **Prueba:** Usuario A intenta `DELETE /api/comercios/{id_B}` -> Esperar 403 (Actual: 200).
3.  **Contrato API (Frontend-Backend):**
    *   Validar que el JSON de respuesta de `MatchController` coincide *exactamente* con la interfaz `MatchResult` en TypeScript.

### C. Pruebas End-to-End (Playwright)
*Foco: Flujos de Usuario Críticos.*

1.  **Flujo Crítico 1: "Emergencia: Perdí mi Perro"**
    *   Login -> Click "Pánico" -> Wizard -> Subir Foto -> Validar que el ID se retorna y el botón "Descargar Cartel" aparece.
2.  **Flujo Crítico 2: "Quiero Adoptar" (Match)**
    *   Login -> Adopción -> Verificar que `fetchMatches` se llama con las coordenadas mockeadas (-38, -61). *Nota: Esto debe cambiarse a geolocalización real.*

### D. Pruebas de Seguridad y Calidad de Código
1.  **Linting & Tipado:** Ejecutar `tsc --noEmit` para detectar discrepancias de tipos (ej: `razonesMatch` vs `Etiquetas`).
2.  **XSS Scan:** Verificar inputs de texto en `ReportWizard` (Nombre, Descripción).

---

## 3. Escenarios "Happy Path" Detallados

### Happy Path 4: Reporte Completo (Frontend Flow)
1.  **Usuario** abre `ReportWizard`.
2.  **Paso 1:** Sube imagen válida (JPG/PNG).
3.  **Paso 2:** Llena Nombre y selecciona "Perro".
4.  **Paso 3:** Hace click en mapa -> se guarda `lat/lng`.
5.  **Paso 4:** Ingresa teléfono.
6.  **Submit:** Recibe ID -> Botón Descargar habilitado -> Click -> Abre PDF en nueva pestaña.

---

## 4. Estructura de Directorios para Tests

```text
/Tests
  /AnimalConnect.Backend.Tests
    /Unit
      /Controllers/MatchControllerTests.cs
    /Integration
      /Controllers/ComerciosControllerTests.cs
  
  /AnimalConnect.Frontend.Tests
    /Unit (Vitest)
      /pages/Adopcion.test.tsx      <-- Mock fetch & filter logic
      /components/ReportWizard.test.tsx <-- User interaction
    /E2E (Playwright)
      /specs/lost-pet.spec.ts
```

## 5. Datos de Prueba (Seeding Strategy)

*   **Usuarios:** Admin, Vet, ONG, Ciudadano.
*   **Mascotas:**
    *   "Rex": Perro, Energía Alta.
    *   "Luna": Gata.
*   **Coordenadas Mock:** (-38.0, -61.0) para pruebas de frontend defaults.
