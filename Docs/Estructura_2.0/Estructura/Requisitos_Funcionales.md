# Módulo A: Identidad, Autenticación y Perfiles

RF-A1 (Registro Progresivo): El sistema permitirá el registro simple mediante email/contraseña o OAuth (Google/Facebook). Los usuarios comienzan con un perfil base ("Ciudadano") y pueden evolucionar.

RF-A2 (Sesión Segura): Implementación de JWT con Refresh Tokens para mantener sesiones largas y seguras en dispositivos móviles, permitiendo revocar accesos en caso de robo.

RF-A3 (Verificación Híbrida de Roles):

Mecanismo: Veterinarios, Comerciantes y ONGs pueden subir documentación probatoria.

Flexibilidad: Se soporta un flujo de "Validación Comunitaria" (Vouching) para agilizar el alta sin trabas burocráticas iniciales, o validación estricta para obtener insignias oficiales.

RF-A4 (Validación de Identidad - KYC): Integración opcional con servicio de terceros (Didit) para validar biométricamente que el usuario es una persona real (anti-bots) y otorgar la insignia de "Identidad Verificada".

RF-A5 (Insignias Visuales): Los perfiles mostrarán distintivos claros (Tilde Azul, Icono de Rol, Nivel de Karma) en toda la plataforma.

# Módulo B: Núcleo Geoespacial

RF-B1 (Permiso y Geolocalización): La PWA solicitará acceso al GPS.

RF-B2 (Filtrado por Radio Inteligente): Las listas se filtrarán por defecto en un radio configurable (ej: 5km). El sistema sugerirá radios automáticos según la especie (200m para gatos, 2km para perros).

RF-B3 (Ubicación Manual): Si no hay GPS, el usuario puede fijar su "Hogar" manualmente en el mapa.

# Módulo C: Perdidos y Encontrados (Viralidad)

RF-C1 (Publicar Alerta Geolocalizada): Creación de reportes con fotos, descripción, especie y punto exacto en el mapa.

RF-C2 (Cartel Inteligente con QR): [NUEVO] Al crear un reporte de "Perdido", el sistema genera automáticamente un PDF A4 listo para imprimir que incluye la foto, datos clave y un Código QR único.

RF-C3 (Escaneo de QR): [NUEVO] Al escanear el QR del cartel, cualquier persona accede al perfil de la mascota en la Web App para reportar el avistamiento inmediatamente.

RF-C4 (Filtros y Mapa de Calor): Visualización de pines diferenciados (Perdido/Encontrado) y filtros por características físicas (color, tamaño).

# Módulo D: Adopciones (Match Algorítmico)

RF-D1 (Perfil de Adoptante): Cuestionario sobre estilo de vida (tipo de vivienda, horas disponibles, patio, niños).

RF-D2 (Perfil del Animal): Carga detallada de niveles de energía, necesidades de espacio y sociabilidad.

RF-D3 (Algoritmo de Compatibilidad): El backend calculará un % de coincidencia cruzando las 4 variables críticas: Energía, Tiempo, Espacio y Experiencia del dueño.

RF-D4 (Explicación Visual del Match): Semáforo de compatibilidad (Verde/Amarillo/Rojo) explicando el "Por qué" (ej: "✅ Compatible con tu departamento", "❌ Requiere más tiempo").

# Módulo E: Comunidad y Foros

RF-E1 (Categorización): Foros temáticos: "Historias de Éxito", "Consultas Veterinarias", "Alertas Vecinales".

RF-E2 (Destacado Profesional): Las respuestas de Veterinarios verificados aparecen resaltadas y primeras en las consultas.

RF-E3 (Alertas Zonales): Las publicaciones críticas (ej: veneno) generan notificaciones Push a usuarios en el radio cercano.

# Módulo F: Mapas de Servicios y Comercios

RF-F1 (Farmacias de Turno Colaborativas): Mapa de farmacias con carga base oficial. Incluye funcionalidad tipo "Waze" para que usuarios/vets marquen manualmente "De Turno Ahora" y mantengan el mapa actualizado.

RF-F2 (Directorio de Comercios): Mapa y lista de PetShops/Peluquerías. Perfil del comercio con catálogo simple de productos/servicios y horarios.

RF-F3 (Eventos Zoonosis/ONG): Calendario y mapa de campañas (vacunación, castración) con fecha, hora y ubicación.

# Módulo G: Gestión Privada (ONGs y Hogares)

RF-G1 (Red de Hogares de Tránsito): Registro de voluntarios indicando capacidad y dirección real (privada).

RF-G2 (Visibilidad Restringida): CRÍTICO. La dirección exacta y contacto de un Hogar de Tránsito SOLO son visibles para ONGs verificadas.

RF-G3 (Panel de Gestión ONG): Dashboard para que las organizaciones administren sus animales, miembros y red de tránsitos.

RF-G4 (Transferencia Digital): Al concretar una adopción, la ONG puede transferir la "Ficha Digital" del animal al perfil del nuevo dueño.

# Módulo H: Interacción Real-Time

RF-H1 (Chat Directo): Mensajería instantánea interna entre usuarios (ej: Dueño-Rescatista) sin exponer teléfonos.

RF-H2 (Notificaciones Push): Alertas sobre comentarios, mensajes de chat, alertas zonales y recordatorios de salud.

# Módulo I: Panel Municipal (B2G Analítico)

RF-I1 (Mapa de Calor de Zoonosis): Visualización de zonas calientes de perdidos o incidentes para planificación urbana.

RF-I2 (Estadísticas Poblacionales): Gráficos de vacunación y estimación de población animal por barrio.

# Módulo J: Gestión de Vida Animal (Salud)

RF-J1 (Libreta Sanitaria Digital): El usuario carga vacunas y desparasitaciones.

RF-J2 (Lectura OCR con IA): [NUEVO] Integración con servicio de IA (Azure/Google) para intentar leer automáticamente la fecha y etiqueta de la vacuna desde una foto (con edición manual si falla).

RF-J3 (Recordatorios Inteligentes): El sistema envía alertas automáticas (Push/Email) cuando una vacuna está por vencer.

# Módulo K: Reputación y Gamificación (Karma)

RF-K1 (Puntaje de Karma): Sistema de puntos por acciones positivas: Cargar Vacuna, Registrar Paseo (Cronómetro), Reportar Reencuentro, Recibir "Gracias".

RF-K2 (Niveles de Prestigio): Escala visual de reputación: Turista -> Vecino -> Guardián -> Héroe.

RF-K3 (Aval Social / Vouching): Usuarios de alto nivel pueden "Avalar" a nuevos usuarios para subir su confianza inicial.

# Módulo M: Auditoría y Seguridad de Datos

RF-M1 (Trazabilidad de Datos): Todas las entidades críticas (Usuarios, Publicaciones, Comentarios) implementarán el patrón de "Entidad Auditable" registrando fecha de creación, última modificación y usuario responsable.

RF-M2 (Borrado Lógico - Soft Delete): Las publicaciones eliminadas por el usuario o moderadores permanecerán en la base de datos con una marca de tiempo (DeletedAt) por un periodo de retención (ej: 90 días) para fines legales o de reversión, antes de su purgado físico definitivo.

RF-M3 (Log de Acciones Sensibles): El sistema registrará en un log inmutable los cambios de roles (ej: promover a Veterinario) y las acciones de moderación (ej: banear usuario, ocultar post).

# Módulo N: Inteligencia Visual AI (Post-MVP)

Este módulo se integrará como una mejora de la búsqueda de mascotas, basándose en el pilar de la Esperanza.
+2


RNF-13.1 (Animal Re-Identification - Re-ID): Implementación de modelos de Deep Learning (como MegaDescriptor) para extraer firmas digitales únicas de las mascotas basadas en patrones de pelaje y rasgos faciales.
+1

RNF-13.2 (Búsqueda Vectorial Automática): Al subir una foto, el sistema comparará automáticamente el vector de imagen contra la base de datos de "Encontrados" en un radio específico. El cálculo de coincidencia se basará en la Distancia Coseno:


RNF-13.3 (Feedback de Coincidencia): Los resultados deben presentarse con una insignia de confianza usando el color Sunrise Gold (#FFB703) para resaltar posibles reencuentros.

# Módulo O: Ecosistema de Hardware (GPS y Chips)

Módulo centrado en la Salud y la Seguridad de la mascota mediante la integración de dispositivos físicos.
+1

RNF-14.1 (Identidad Digital Inmutable - Chip): Vinculación del número de microchip RFID a la Libreta Sanitaria Digital. El sistema permitirá el acceso rápido al historial clínico al escanear el chip en centros veterinarios verificados.
+1

RNF-14.2 (Seguimiento Real-Time - GPS): Integración de dispositivos GPS activos mediante Webhooks o APIs de terceros. La ubicación debe reflejarse en el Núcleo Geoespacial con una frecuencia de actualización configurable para optimizar batería y datos.

RNF-14.3 (Geovallas de Protección): Capacidad de definir perímetros seguros en el mapa. El cruce de estos límites disparará alertas críticas con el color de advertencia Alert Amber (#D97706).

# Módulo P: RNF 15: Integración B2G (Smart City Monitoring)

Funcionalidad avanzada de analítica y seguridad en colaboración con municipios.
+2


RNF-15.1 (Nodos de Visión Municipal): Capacidad del sistema para recibir alertas de avistamiento procesadas por las cámaras del centro de monitoreo municipal, integrando los datos con los perfiles de búsqueda activos en la plataforma.
+2


RNF-15.2 (Mapas de Calor de Zoonosis): Generación de Heatmaps inteligentes basados en la ubicación de mascotas registradas, casos de salud reportados y áreas de pérdida frecuente, utilizando la fuente Inter para la visualización de datos técnicos