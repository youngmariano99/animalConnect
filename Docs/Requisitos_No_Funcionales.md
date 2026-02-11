RNF 1: Usabilidad y Experiencia (Mobile First)

RNF-1.1 (PWA): Aplicación Web Progresiva instalable en Android/iOS con icono y pantalla completa.

RNF-1.2 (Ergonomía): Diseño táctil con botones grandes (>48px) y flujos simples. (Dedo gordo friendly)

RNF-1.3 (Modo Offline): Capacidad de consultar datos cacheados (como la Libreta Sanitaria) sin conexión a internet.

RNF 4: Escalabilidad

RNF-4.1 (Arquitectura Stateless): Backend desacoplado que permite crecimiento horizontal.

RNF-4.2 (Preparación Híbrida): El código Frontend (React) debe mantenerse limpio para poder empaquetarse con Capacitor y subirse a tiendas (Play Store/App Store) en el futuro sin reescribir la lógica.

RNF 5: Mantenimiento y Evolución

RNF-5.1 (Código Limpio): Uso de patrones de diseño (Repository, DTOs) y principios SOLID para facilitar actualizaciones.

RNF-5.2 (Migración Progresiva): El Frontend en React debe coexistir con la versión Vanilla JS durante la transición, permitiendo desplegar una sin afectar a la otra.

RNF-5.3 (Documentación): Actualización constante de DOCS_TECNICA.md y SprintLogs.md con cada cambio significativo. Acompañado de documentación dentro del código para entender la lógica.

RNF-5.4 Uso de vocabulario ideal para entener el código por personas que estan aprendiendo a programar y en cuanto al diseño usar un lenguaje claro y sencillo en el idioma español latinoamericano con excepción de los términos técnicos que se usan en inglés en el mundo de la programación.

RNF 6: Rendimiento y Optimización

RNF-6.1 (Carga Inicial): El Frontend debe cargar en menos de 2 segundos en conexiones 4G.

RNF-6.2 (Mapas): Uso de Leaflet con clustering de marcadores para manejar miles de puntos sin congelar el navegador.

RNF-6.3 (Backend): Implementación de paginación y filtros por defecto para evitar consultas masivas a la base de datos.

RNF 7: Seguridad

RNF-7.1 (Autenticación): Implementación de JWT con expiración y refresh tokens.

RNF-7.2 (Protección de Rutas): Uso de middleware para restringir acceso a rutas privadas.

RNF-7.3 (Validación de Datos): Validación estricta de datos de entrada para prevenir inyección SQL y XSS.

RNF 8: Identidad Visual y Sistema de Diseño (Bio-Tech Humanista)
Este sistema busca equilibrar la calidez del mundo animal con la precisión tecnológica, bajo el concepto de un "ecosistema vivo".

RNF-8.1 (Paleta de Colores "Vital-Ecosystem"):
La aplicación debe implementar un sistema de color de alto contraste compatible con WCAG AAA para garantizar visibilidad y carga emocional.

Health (Salud): #006D77 (Bio-Teal). Uso en navegación y botones primarios.

Love (Amor): #E27364 (Living Coral). Uso en adopciones, favoritos y voluntarios.

Hope (Esperanza): #FFB703 (Sunrise Gold). Uso en Call to Action (CTA) críticos y reportes de pérdida.

Tech (Neutro): #264653 (Midnight Navy). Uso en títulos y texto principal para evitar el negro puro.

Nature (Acento): #83C5BE (Soft Sage). Uso en fondos secundarios para reducir ansiedad.

Canvas (Fondo): #F8F9FA (Cloud White). Fondo general para evitar deslumbramiento en móviles.

RNF-8.2 (Tipografía y Jerarquía):
Se debe aplicar una jerarquía dual que separe la "personalidad" de la "legibilidad".

Display (Títulos): Fuente Nunito. Por su estilo Rounded, comunica suavidad y seguridad.

Body (Cuerpo): Fuente Inter o Lato. Optimizada para interfaces y datos densos como historias clínicas.



Escalado: Los títulos deben usar pesos font-extrabold (800), mientras que las etiquetas de formularios usarán font-semibold (600).


RNF-8.3 (Iconografía y Recursos Gráficos):
Para mantener el rendimiento y la coherencia visual, se prohíben imágenes rasterizadas (PNG/JPG) en la interfaz, priorizando SVGs.

Iconos: Uso exclusivo de la librería Lucide React. Se debe configurar el strokeLinecap="round" para que los iconos armonicen con la redondez de la fuente Nunito.



Ilustraciones: Estilo Organic Flat usando la librería Undraw (personalizada con el color #006D77) y Open Peeps para representar a la comunidad humana.


Avatares: Implementación de React-Animals para generar perfiles de mascotas predeterminados.

RNF-8.4 (Micro-interacciones y Animación):
La interfaz debe sentirse "viva" mediante el uso de Framer Motion.



Feedback Emocional: Al marcar "Favorito", el icono debe tener un efecto de "latido" mediante física de resorte (spring physics).


Deleite en la Carga: Sustituir spinners genéricos por animaciones Lottie de animales (ej. un perro moviendo la cola) para transformar la espera en una conexión positiva.

RNF-8.5 (UI Polimórfica por Stakeholder):
La interfaz debe adaptar su densidad visual según el usuario que la utilice.


Veterinario: Layout de alta densidad, predominio de Bio-Teal y uso de Recharts para datos médicos.



ONG/Rescatista: Layout enfocado en tarjetas grandes de acción con bordes de color que indiquen el estado (Oro = En adopción).



Ciudadano: Estética "Soft" con bordes muy redondeados (1rem o rounded-2xl) y un Floating Action Button (FAB) de pánico siempre visible en Sunrise Gold.


RNF 9: Accesibilidad e Inclusión (A11y)
Garantizar que la plataforma sea utilizable por todos, incluyendo adultos mayores y personas con discapacidades visuales.


RNF-9.1 (Estándares de Contraste):
El sistema debe cumplir estrictamente con WCAG 2.1 Nivel AA como mínimo.

La combinación de texto Midnight Navy sobre fondo blanco debe mantener un ratio superior a 10:1 para facilitar la lectura sin fatiga.

RNF-9.2 (Diseño Inclusivo):
Daltonismo: No se permite usar el color como único medio para transmitir información. Todo estado (ej. Sano/Enfermo) debe ir acompañado de un icono descriptivo (Check / Alert).


Navegación: Los elementos interactivos deben tener un anillo de foco (focus ring) de 3px en color Sunrise Gold para navegación por teclado.


Lectores de Pantalla: Uso de etiquetas aria-label descriptivas en iconos funcionales y aria-hidden="true" en elementos puramente decorativos.

Configuración Técnica Sugerida para la Guía IA (Tailwind)
Para que la IA configure el proyecto correctamente, incluye este bloque de código en tus requisitos:

// Referencia de implementación técnica para el Frontend
{
  theme: {
    extend: {
      colors: {
        health: '#006D77', // Bio-Teal (Salud)
        love: '#E27364',   // Living Coral (Amor)
        hope: '#FFB703',   // Sunrise Gold (Esperanza)
        nature: '#83C5BE', // Soft Sage (Medioambiente)
        tech: '#264653',   // Midnight Navy (Texto/Autoridad)
        canvas: '#F8F9FA'  // Cloud White (Fondo)
      },
      fontFamily: {
        heading: ['Nunito', 'sans-serif'], // Emocional/Redondeada
        body: ['Inter', 'sans-serif']      // Funcional/Legible
      },
      borderRadius: {
        'pet': '1.5rem' // Bordes extra suaves para tarjetas
      }
    }
  }
}

RNF 10: Coherencia y Sistema de Componentes (Design System)
Para evitar que la IA genere estilos inconsistentes entre el panel del veterinario y el del ciudadano, se debe trabajar bajo un esquema de componentes compartidos.
+1


RNF-10.1 (Arquitectura de Componentes): El Frontend debe construirse utilizando una arquitectura de componentes atómicos (Átomos, Moléculas, Organismos). Elementos como botones, inputs y tarjetas deben compartir el mismo borderRadius: pet (1.5rem) para mantener la identidad visual "redondeada y segura" en toda la plataforma.
+4


RNF-10.2 (Visualización de Datos Humanista): En los paneles de gestión (especialmente Veterinarios y ONGs), el uso de gráficos (Recharts) debe seguir la psicología del color: Bio-Teal para métricas positivas/estables y Living Coral para métricas que requieren atención emocional. Los datos densos deben presentarse con la fuente Inter para maximizar la eficiencia técnica sin perder la estética general.
+3

RNF 11: Feedback Empático y Gestión de Estados
La "confianza empática" mencionada en el informe debe reflejarse en cómo la aplicación responde a las acciones del usuario.


RNF-11.1 (Micro-copy y Lenguaje): Los mensajes de error o confirmación deben usar un lenguaje claro y sencillo en español latinoamericano, evitando códigos técnicos intimidantes. Por ejemplo: En lugar de "Error 404", usar "Parece que esta mascota se ha alejado un poco. Volvamos al camino principal" acompañado de una ilustración de Open Peeps.



RNF-11.2 (Estados de Carga y Transiciones): No se permiten cambios bruscos de pantalla. Se deben usar Skeleton Screens que sigan la estructura de las "Tarjetas de Mascota" para reducir la percepción de espera. Las transiciones entre rutas deben ser suaves (fundidos de 300ms) usando Framer Motion para evocar calma y control.


RNF 12: Adaptabilidad y Modos de Visualización
Dado que el proyecto es "Mobile First" pero será usado por profesionales en clínicas (Desktop), la adaptabilidad es clave.


RNF-12.1 (Layout Polimórfico): La IA debe priorizar un layout de una sola columna para ciudadanos en móviles, pero expandirse a dashboards multi-columna de "Alta Densidad" para veterinarios en tablets o computadoras.



RNF-12.2 (Protección Visual / Dark Mode): El sistema debe estar preparado para un "Modo Nocturno" donde el Cloud White se transforme en una variante más profunda del Midnight Navy, manteniendo el Sunrise Gold para elementos críticos, garantizando que el personal de guardia no sufra fatiga visual.

