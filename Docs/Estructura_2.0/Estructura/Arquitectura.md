Arquitectura del Sistema: Ecosistema "Bio-Tech Humanista"
Esta arquitectura está diseñada para una Plataforma Web Progresiva (PWA) de alta disponibilidad, centrada en datos geoespaciales y el bienestar animal. Se divide en los siguientes pilares:

1. Frontend y Capa de Usuario (The Interface)
Core: Aplicación desarrollada en React y desplegada en Netlify.

Estrategia PWA: Instalable en dispositivos móviles con capacidades de funcionamiento offline y optimización de carga mediante Code Splitting y Lazy Loading.

Visualización Geoespacial: Uso de Leaflet integrado con OpenStreetMap para renderizar mapas interactivos de servicios y reportes.

Gestión de Medios: Las imágenes son optimizadas y servidas a través de Cloudinary (con firmas digitales para seguridad).

2. Backend y Lógica de Negocio (The Engine)
Core API: Desarrollada en .NET Core y alojada en Render. Gestiona la comunicación vía API REST (JSON) y WebSockets (vía Pusher) para notificaciones y chats en tiempo real.

Servicios Especializados:

Identidad: Integración con Didit para validación biométrica (KYC/DNI + FaceID) y autenticación mediante JWT (JSON Web Tokens) con refresh tokens.

Inteligencia Artificial: Uso de Google Vision API para lectura OCR de libretas sanitarias manuscritas y FF Ore para el procesamiento de datos.

Generación de Documentos: Uso de QuestPDF para crear carteles de búsqueda con códigos QR únicos de manera dinámica.

3. Capa de Datos y Persistencia (The Memory)
Base de Datos Principal: PostgreSQL alojado en Neon, potenciado con la extensión PostGIS para ejecutar consultas espaciales complejas (ej: filtrado de mascotas perdidas por radio de kilómetros).

Caché de Alta Velocidad: Implementación de Redis (vía Upstash) para almacenar datos de acceso frecuente como el feed de noticias, farmacias de turno y eventos de zoonosis, reduciendo la latencia de la base de datos principal.

4. Seguridad y Gobernanza (The Shield)
Privacidad: Implementación de Geo-Fuzzing para proteger la ubicación exacta de hogares de tránsito y usuarios.

Protección de Tráfico: Capas de Rate Limiting para prevenir abusos y ataques de denegación de servicio.

Auditoría: Sistema de logs inmutables para trazabilidad de cambios de roles (moderación) y borrado lógico (Soft Delete) de 90 días para cumplimiento legal.