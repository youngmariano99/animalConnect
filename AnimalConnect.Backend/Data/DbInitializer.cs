using AnimalConnect.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace AnimalConnect.Backend.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // 1. Asegurar que la BD exista
            context.Database.Migrate();

            // 2. Si hay más de 5 usuarios, asumimos que ya se cargó la data masiva.
            if (context.Usuarios.Count() > 5) return;

            Console.WriteLine("--> INICIANDO CARGA MASIVA DE DATOS (04/12/2025)...");

            // Fecha base simulada
            var hoy = DateTime.Parse("2025-12-04");
            string baseUrl = "http://127.0.0.1:5269/uploads/"; 

            // ============================================================
            // 1. CATALOGOS BASE
            // ============================================================
            if (!context.Especies.Any())
            {
                context.Especies.AddRange(new Especie { Nombre = "Perro" }, new Especie { Nombre = "Gato" });
            }
            if (!context.Estados.Any())
            {
                context.Estados.AddRange(new Estado { Nombre = "En Adopción" }, new Estado { Nombre = "Perdido" }, new Estado { Nombre = "Encontrado" });
            }
            if (!context.Estados.Any(e => e.Id == 4))
            {
                // Aseguramos que existan los 4 estados clave
                // 1: En Adopción
                // 2: Perdido
                // 3: Encontrado (Aviso activo)
                // 4: Reencuentro (Caso cerrado)
                context.Estados.Add(new Estado { Nombre = "Reencuentro" });
                context.SaveChanges();
            }
            if (!context.Atributos.Any())
            {
                context.Atributos.AddRange(
                    new Atributo { Nombre = "Nivel de Energía", Tipo = "Escala" },    // 1
                    new Atributo { Nombre = "Requiere Patio", Tipo = "Booleano" },    // 2
                    new Atributo { Nombre = "Apto con Niños", Tipo = "Booleano" },    // 3
                    new Atributo { Nombre = "Apto con Mascotas", Tipo = "Booleano" }, // 4
                    new Atributo { Nombre = "Tiempo Requerido", Tipo = "Escala" },    // 5
                    new Atributo { Nombre = "Tamaño", Tipo = "Escala" },              // 6
                    new Atributo { Nombre = "Nivel Experiencia", Tipo = "Escala" }    // 7
                );
            }
            context.SaveChanges();

            // ============================================================
            // 2. USUARIOS Y PERFILES
            // ============================================================
            
            // --- Veterinarios ---
            var vets = new[]
            {
                new Usuario { NombreUsuario = "vet_sanroque", PasswordHash = "1234", Rol = "Veterinario" },
                new Usuario { NombreUsuario = "vet_patitas", PasswordHash = "1234", Rol = "Veterinario" },
                new Usuario { NombreUsuario = "vet_central", PasswordHash = "1234", Rol = "Veterinario" }
            };
            context.Usuarios.AddRange(vets);
            context.SaveChanges();

            context.PerfilesVeterinarios.AddRange(
                new PerfilVeterinario { UsuarioId = vets[0].Id, NombreVeterinaria = "Clínica San Roque", Direccion = "Av. 25 de Mayo 1200", TelefonoProfesional = "2922-411111", HorariosAtencion = "L-V 8-20hs", EsDeTurno = true, Latitud = -37.9945, Longitud = -61.3530, EstadoVerificacion = "Aprobado", Biografia = "Especialistas en cirugía y rayos X. Urgencias 24hs." },
                new PerfilVeterinario { UsuarioId = vets[1].Id, NombreVeterinaria = "Patitas Felices", Direccion = "Calle 9 de Julio 450", TelefonoProfesional = "2922-422222", HorariosAtencion = "L-S 9-13hs", EsDeTurno = false, Latitud = -37.9980, Longitud = -61.3580, EstadoVerificacion = "Aprobado", Biografia = "Atención clínica general y peluquería canina." },
                new PerfilVeterinario { UsuarioId = vets[2].Id, NombreVeterinaria = "Veterinaria Central", Direccion = "Rivadavia 880", TelefonoProfesional = "2922-433333", HorariosAtencion = "Lun a Sab 8-20hs", EsDeTurno = false, Latitud = -37.9910, Longitud = -61.3490, EstadoVerificacion = "Aprobado", Biografia = "Farmacia veterinaria y alimentos balanceados." }
            );

            // --- Ciudadanos ---
            var ciudadanos = new List<Usuario>();
            for (int i = 1; i <= 10; i++)
            {
                ciudadanos.Add(new Usuario { NombreUsuario = $"vecino_{i}", PasswordHash = "1234", Rol = "Ciudadano" });
            }
            context.Usuarios.AddRange(ciudadanos);
            context.SaveChanges(); // Guardar para obtener IDs

            foreach (var c in ciudadanos)
            {
                context.PerfilesCiudadanos.Add(new PerfilCiudadano 
                { 
                    UsuarioId = c.Id, 
                    NombreCompleto = "Vecino " + c.NombreUsuario.Split('_')[1], 
                    FechaRegistro = hoy.AddMonths(-2) 
                });
                
                // Perfil adoptante para Match
                context.PerfilesAdoptantes.Add(new PerfilAdoptante
                {
                    UsuarioId = c.Id,
                    TelefonoContacto = "2922-15000" + c.Id
                });
            }
            context.SaveChanges();

            // ============================================================
            // 3. ANIMALES (Casos Reales)
            // ============================================================
            var animales = new List<Animal>
            {
                // -- EN ADOPCIÓN (Para el Match) --
                new Animal { 
                    Nombre = "Thor", Descripcion = "Ovejero alemán rescatado. Muy guardián y leal. Necesita patio grande.", 
                    EdadAproximada = "4 años", ImagenUrl = baseUrl + "PerroAdoptar1.png", 
                    UbicacionLat = -37.9930, UbicacionLon = -61.3520, FechaPublicacion = hoy.AddDays(-5), 
                    IdEspecie = 1, IdEstado = 1, UsuarioId = ciudadanos[0].Id, TelefonoContacto = "2922-111111" 
                },
                new Animal { 
                    Nombre = "Lola", Descripcion = "Perrita faldera, ideal para departamento. Muy tranquila y amorosa.", 
                    EdadAproximada = "6 años", ImagenUrl = baseUrl + "PerroAdoptar2.png", 
                    UbicacionLat = -37.9950, UbicacionLon = -61.3540, FechaPublicacion = hoy.AddDays(-2), 
                    IdEspecie = 1, IdEstado = 1, UsuarioId = ciudadanos[1].Id, TelefonoContacto = "2922-222222" 
                },
                new Animal { 
                    Nombre = "Garfield", Descripcion = "Gato naranja gigante. Solo quiere comer y dormir. Se lleva bien con perros.", 
                    EdadAproximada = "5 años", ImagenUrl = baseUrl + "GatoAdoptar1.png", 
                    UbicacionLat = -37.9970, UbicacionLon = -61.3560, FechaPublicacion = hoy.AddDays(-10), 
                    IdEspecie = 2, IdEstado = 1, UsuarioId = ciudadanos[2].Id, TelefonoContacto = "2922-333333" 
                },
                new Animal { 
                    Nombre = "Pelusa", Descripcion = "Gatita tricolor cachorra. Muy juguetona.", 
                    EdadAproximada = "3 meses", ImagenUrl = baseUrl + "GatoAdoptar2.png", 
                    UbicacionLat = -37.9925, UbicacionLon = -61.3505, FechaPublicacion = hoy.AddDays(-1), 
                    IdEspecie = 2, IdEstado = 1, UsuarioId = ciudadanos[3].Id, TelefonoContacto = "2922-444444" 
                },

                // -- PERDIDOS (Alerta Roja) --
                new Animal { 
                    Nombre = "MAX PERDIDO", Descripcion = "¡AYUDA! Se escapó anoche cerca de la plaza. Tiene collar rojo.", 
                    EdadAproximada = "2 años", ImagenUrl = baseUrl + "PerroPerdido2.png", 
                    UbicacionLat = -37.9940, UbicacionLon = -61.3530, FechaPublicacion = hoy, 
                    IdEspecie = 1, IdEstado = 2, UsuarioId = ciudadanos[4].Id, TelefonoContacto = "2922-URGENTE" 
                },
                new Animal { 
                    Nombre = "Gato Siamés", Descripcion = "Se perdió en Barrio Roca. Responde al nombre de Simón.", 
                    EdadAproximada = "Adulto", ImagenUrl = baseUrl + "GatoPerdido1.png", 
                    UbicacionLat = -37.9980, UbicacionLon = -61.3590, FechaPublicacion = hoy.AddHours(-4), 
                    IdEspecie = 2, IdEstado = 2, UsuarioId = ciudadanos[5].Id, TelefonoContacto = "2922-555555" 
                },

                // -- ENCONTRADOS (Alerta Verde) --
                new Animal { 
                    Nombre = "Perrito Encontrado", Descripcion = "Apareció en mi puerta. Parece tener dueño, está bien cuidado.", 
                    EdadAproximada = "Cachorro", ImagenUrl = baseUrl + "PerroAdoptar1.png", 
                    UbicacionLat = -37.9915, UbicacionLon = -61.3495, FechaPublicacion = hoy.AddDays(-1), 
                    IdEspecie = 1, IdEstado = 3, UsuarioId = ciudadanos[6].Id, TelefonoContacto = "2922-666666" 
                }
            };
            context.Animales.AddRange(animales);
            context.SaveChanges();

            // ============================================================
            // 4. ATRIBUTOS PARA MATCH (Solo Adopción)
            // ============================================================
            var atributosList = new List<AnimalAtributo>();

            // THOR (Perro Activo)
            atributosList.Add(new AnimalAtributo { AnimalId = animales[0].Id, AtributoId = 1, Valor = 5 });
            atributosList.Add(new AnimalAtributo { AnimalId = animales[0].Id, AtributoId = 2, Valor = 1 });
            atributosList.Add(new AnimalAtributo { AnimalId = animales[0].Id, AtributoId = 3, Valor = 0 });
            atributosList.Add(new AnimalAtributo { AnimalId = animales[0].Id, AtributoId = 5, Valor = 4 });
            atributosList.Add(new AnimalAtributo { AnimalId = animales[0].Id, AtributoId = 6, Valor = 3 });

            // LOLA (Perra Tranquila)
            atributosList.Add(new AnimalAtributo { AnimalId = animales[1].Id, AtributoId = 1, Valor = 1 });
            atributosList.Add(new AnimalAtributo { AnimalId = animales[1].Id, AtributoId = 2, Valor = 0 });
            atributosList.Add(new AnimalAtributo { AnimalId = animales[1].Id, AtributoId = 3, Valor = 1 });
            atributosList.Add(new AnimalAtributo { AnimalId = animales[1].Id, AtributoId = 6, Valor = 1 });

            context.AnimalAtributos.AddRange(atributosList);
            context.SaveChanges();

            // ============================================================
            // 5. CAMPAÑAS DE SALUD
            // ============================================================
            var campanas = new[]
            {
                new Campania { 
                    Titulo = "Vacunación Antirrábica Plaza Central", 
                    Descripcion = "Campaña gratuita anual. Traer correa. | Fin: 14:00 | Tel: 2922-123456", 
                    FechaHora = hoy.AddDays(2).AddHours(9), 
                    UbicacionLat = -37.9940, UbicacionLon = -61.3530 
                },
                new Campania { 
                    Titulo = "Castración Móvil Barrio Roca", 
                    Descripcion = "Solo con turno previo por WhatsApp. Ayuno 12hs. | Fin: 13:00 | Tel: 2922-987654", 
                    FechaHora = hoy.AddDays(5).AddHours(8), 
                    UbicacionLat = -37.9970, UbicacionLon = -61.3500 
                },
                new Campania { 
                    Titulo = "Charla: Tenencia Responsable", 
                    Descripcion = "Charla abierta en el Club Social. Sorteos. | Fin: 20:00", 
                    FechaHora = hoy.AddDays(10).AddHours(18), 
                    UbicacionLat = -37.9910, UbicacionLon = -61.3550 
                }
            };
            context.Campanias.AddRange(campanas);
            context.SaveChanges();

            // ============================================================
            // 6. FORO COMUNITARIO (CORREGIDO: FechaPublicacion)
            // ============================================================
            var posts = new[]
            {
                new Post { 
                    Titulo = "¿Alguien sabe si la vet San Roque está de turno?", 
                    Contenido = "Mi perro comió chocolate y estoy preocupada.", 
                    FechaPublicacion = hoy.AddHours(-2),  // <--- CORREGIDO AQUÍ
                    UsuarioId = ciudadanos[0].Id, 
                    Categoria="Consultas" 
                },
                new Post { 
                    Titulo = "Regalo cucha de madera grande", 
                    Contenido = "Tengo una cucha en buen estado para donar a quien la necesite.", 
                    FechaPublicacion = hoy.AddDays(-1),   // <--- CORREGIDO AQUÍ
                    UsuarioId = ciudadanos[2].Id, 
                    Categoria="Donaciones" 
                },
                new Post { 
                    Titulo = "Cuidado con veneno en el parque", 
                    Contenido = "Encontré comida dudosa cerca de los juegos, cuidado!!!", 
                    FechaPublicacion = hoy,               // <--- CORREGIDO AQUÍ
                    UsuarioId = ciudadanos[4].Id, 
                    Categoria="Alertas" 
                }
            };
            context.Posts.AddRange(posts);
            context.SaveChanges();

            // Comentarios
            context.Comentarios.AddRange(
                new Comentario { Post = posts[0], UsuarioId = vets[0].Id, Contenido = "Hola! Sí, estamos de guardia. Traelo ya mismo.", Fecha = hoy.AddHours(-1) },
                new Comentario { Post = posts[0], UsuarioId = ciudadanos[1].Id, Contenido = "Espero que esté bien!", Fecha = hoy.AddMinutes(-30) }
            );
            context.SaveChanges();

            Console.WriteLine("--> CARGA DE DATOS FINALIZADA CON ÉXITO.");
        }
    }
}