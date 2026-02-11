# 🗺️ Hoja de Ruta SCRUM: Ecosistema AnimalConnect 2.0

> **Visión:** Crear un MVP "Corazón del Pueblo" que genere confianza inmediata, resuelva urgencias reales (pérdidas/guardias) y siente las bases técnicas para escalar.

---

## 🚀 Fase 1: El MVP "Corazón del Pueblo" (Meses 1-3)
**Objetivo:** Lanzamiento funcional validar tracción. Prioridad en **Estética (Confianza)**, **Geolocalización (Utilidad)** y **Viralidad (Crecimiento)**.

### SPRINT 1: Identidad "Bio-Tech" y Cimientos (Semanas 1-2) ✅ Completado (2026-02-11)
*El objetivo es que la web "se sienta" profesional y segura desde el día 1.*

- [x] **Historia 1.1 (Frontend):** Configurar `tailwind.config.js` con la paleta oficial (Bio-Teal, Living Coral, Sunrise Gold) y tipografías (Nunito/Inter).
- [x] **Historia 1.2 (Frontend):** Crear componentes atómicos base (Botones, Cards, Inputs) con `borderRadius: 'pet'` (1.5rem).
- [x] **Historia 1.3 (Backend):** Instalación de paquetes NuGet críticos: `NetTopologySuite` (PostGIS) y `CloudinaryDotNet`.
- [x] **Historia 1.4 (Infra):** Configuración de PostgreSQL en desarrollo con la extensión PostGIS activada.

### SPRINT 2: El Motor Geoespacial (Semanas 3-4)
*Migrar de cálculos manuales a potencia de base de datos real.*

- [ ] **Historia 2.1 (Backend):** Refactorizar entidad `Mascota`, `Comercio` y `Veterinaria` para usar tipos `Point` (geometría) en lugar de `double Lat/Lon`.
- [ ] **Historia 2.2 (Backend):** Reescribir `GeoService` para ejecutar consultas espaciales en BD (`ST_DWithin`) optimizando el filtro por radio.
- [ ] **Historia 2.3 (Backend):** Implementar "Farmacias de Turno" con lógica de expiración automática (Lazy Cleanup).
- [ ] **Historia 2.4 (Frontend):** Integrar mapa Leaflet con los nuevos endpoints geoespaciales y marcadores personalizados (Iconos SVG).

### SPRINT 3: El Gancho Viral (Perdidos y Encontrados) (Semanas 5-6)
*La característica que atrae usuarios masivamente.*

- [ ] **Historia 3.1 (Backend):** Integrar **QuestPDF** para generar el PDF A4 del cartel de búsqueda dinámicamente.
- [ ] **Historia 3.2 (Backend):** Endpoint para generar código CodeQR único que enlace al perfil público de la mascota.
- [ ] **Historia 3.3 (Frontend):** Flujo de "Reportar Perdido": Formulario simple + Subida de fotos a Cloudinary + Botón "Descargar Cartel".
- [ ] **Historia 3.4 (Frontend):** Vista pública de "Alerta" (Landing page al escanear QR) optimizada para móviles (carga rápida).

### SPRINT 4: Adopción y Conexión Emocional (Semanas 7-8)
*Cerrar el ciclo de valor con adopciones.*

- [ ] **Historia 4.1 (Backend):** Implementar lógica de bloqueo (Hard Filters) en `MatchController` (ej: Niños vs Perro no sociable).
- [ ] **Historia 4.2 (Frontend):** UI de "Quiz de Compatibilidad" animada (Framer Motion) conectada al backend.
- [ ] **Historia 4.3 (Frontend):** Visualización del resultado del Match con "Semáforo de Compatibilidad" (Verde/Amarillo/Rojo) y explicaciones claras.
- [ ] **Historia 4.4 (Backend):** CRUD básico de "Mis Mascotas" (Libreta Sanitaria **Manual** V1) para fomentar el registro proactivo.

### 🏁 Hito 1: Lanzamiento Beta (MVP)
*Funcionalidades: Mapa de Servicios, Reporte de Perdidos con Cartel QR, Adopción con Match, Perfil Básico.*

---

## 🛠️ Fase 2: Consolidación y "Cerebro" (Meses 4-6)
**Objetivo:** Retención y Automatización. Una vez que hay usuarios, les damos herramientas para gestionar la salud y la comunidad.

### SPRINT 5: Salud Digital (Libreta 2.0)
- [ ] **Historia 5.1:** Estructura completa de BD para Vacunas, Desparasitaciones y Eventos Médicos (según `LibretaSanitaria.md`).
- [ ] **Historia 5.2:** Integración **Google Vision API (OCR)** para lectura automática de fotos de libretas manuales.
- [ ] **Historia 5.3:** Sistema de Recordatorios (Email/Push) para vencimiento de vacunas.

### SPRINT 6: Comunidad Real-Time
- [ ] **Historia 6.1:** Integración de **Pusher/WebSockets** para chat privado (Dueño-Rescatista) sin exponer teléfonos.
- [ ] **Historia 6.2:** Sistema de Notificaciones in-app (Alerta de zona, Comentario en post).

### SPRINT 7: Seguridad y Auditoría
- [ ] **Historia 7.1:** Implementar **Geo-Fuzzing** (Desplazamiento aleatorio 200m) para Hogares de Tránsito.
- [ ] **Historia 7.2:** Soft Delete global (Interceptors EF Core) y Logs de Auditoría para acciones sensibles.

---

## 🛰️ Fase 3: Smart City & Futuro (Meses 7+)
**Objetivo:** Integración Masiva y Hardware.

- **Smart City:** Dashboard para Zoonosis con "Heatmap de Incidentes" (usando datos reales acumulados).
- **Hardware:** Integración de Chips RFID con perfil digital único.
- **IA Avanzada:** Reconocimiento facial de mascotas (Re-ID) para matchear fotos de "Encontrados" con "Perdidos" automáticamente.

---

## 💡 Conclusión del Analista (Antigravity)

Coincido plenamente con tu veredicto: **"PostGIS + QuestPDF + Estilo Bio-Tech" es la fórmula ganadora para el MVP.**

1.  **PostGIS** no es negociable: Sin él, el mapa será lento y los filtros de radio imprecisos, destruyendo la utilidad principal.
2.  **QuestPDF (Carteles)** es tu marketing gratuito: Cada cartel pegado en un poste es un anuncio de AnimalConnect.
3.  **Estilo Bio-Tech**: Es lo que diferencia tu app de un "formulario gubernamental aburrido". La confianza visual es clave para que la gente suba fotos de sus mascotas.

**Ajuste Estratégico:** He incluido una **"Libreta Sanitaria Manual V1"** en la **Fase 1 (Sprint 4)**. ¿Por qué? Porque si solo sirven para "Perdidos", los usuarios borran la app cuando encuentran al perro. Si pueden guardar la fecha de la vacuna (aunque sea manual), se quedan. La IA (OCR) llega en la Fase 2 para facilitar la carga, pero el valor ya está entregado.
