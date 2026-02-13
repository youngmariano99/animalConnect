using AnimalConnect.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace AnimalConnect.Backend.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // 1. Migrar BD
            context.Database.Migrate();

            // 2. Si ya hay usuarios, asumimos que está llena. 
            // TIP: Borra la BD antes de correr esto para regenerar todo.
            if (context.Usuarios.Any()) return;

            Console.WriteLine("--> INICIANDO POBLADO MASIVO (MEGA DEMO PRINGLES)...");
            
            // Coordenadas Centro Pringles: -37.994, -61.353
            // Usaremos un generador aleatorio para dispersar los pines
            var rnd = new Random();
            double GetLat() => -37.994 + (rnd.NextDouble() * 0.02 - 0.01); // +/- 1km aprox
            double GetLng() => -61.353 + (rnd.NextDouble() * 0.02 - 0.01);
            
            string baseUrl = "http://127.0.0.1:5269/uploads/";
            string[] imgsPerros = { "PerroAdoptar1.png", "PerroAdoptar2.png", "PerroPerdido2.png", "ffef89b1-b90e-4de7-aa1e-a1be97d4c0e5.png" };
            string[] imgsGatos = { "GatoAdoptar1.png", "GatoAdoptar2.png", "GatoPerdido1.png" };

            // ==============================================================================
            // 1. CATÁLOGOS BASE
            // ==============================================================================
            var perro = new Especie { Nombre = "Perro" };
            var gato = new Especie { Nombre = "Gato" };
            context.Especies.AddRange(perro, gato);

            var estAdopcion = new Estado { Nombre = "En Adopción" };
            var estPerdido = new Estado { Nombre = "Perdido" };
            var estEncontrado = new Estado { Nombre = "Encontrado" };
            var estFinalizado = new Estado { Nombre = "Finalizado" };
            context.Estados.AddRange(estAdopcion, estPerdido, estEncontrado, estFinalizado);

            var atrEnergia = new Atributo { Nombre = "Nivel de Energía", Tipo = "Escala" };
            var atrPatio = new Atributo { Nombre = "Requiere Patio", Tipo = "Booleano" };
            var atrNinos = new Atributo { Nombre = "Apto con Niños", Tipo = "Booleano" };
            var atrMascotas = new Atributo { Nombre = "Apto con Mascotas", Tipo = "Booleano" };
            var atrTiempo = new Atributo { Nombre = "Tiempo Requerido", Tipo = "Escala" };
            var atrTamano = new Atributo { Nombre = "Tamaño", Tipo = "Escala" };
            context.Atributos.AddRange(atrEnergia, atrPatio, atrNinos, atrMascotas, atrTiempo, atrTamano);
            
            context.SaveChanges();

            // ==============================================================================
            // 2. USUARIOS Y PERFILES (GENERACIÓN MASIVA)
            // ==============================================================================
            
            // A. Veterinarios (3)
            var usersVet = new List<Usuario>();
            for(int i=1; i<=3; i++) {
                var u = new Usuario { NombreUsuario = $"vet_{i}", PasswordHash = "1234", Rol = "Veterinario" };
                usersVet.Add(u);
                context.Usuarios.Add(u);
            }
            context.SaveChanges();

            context.PerfilesVeterinarios.Add(new PerfilVeterinario { UsuarioId = usersVet[0].Id, MatriculaProfesional = "MP-1001", EstadoVerificacion = "Aprobado", Biografia = "Espec. Pequeños Animales" });
            context.PerfilesVeterinarios.Add(new PerfilVeterinario { UsuarioId = usersVet[1].Id, MatriculaProfesional = "MP-2002", EstadoVerificacion = "Aprobado", Biografia = "Cirugía y Trauma" });
            context.PerfilesVeterinarios.Add(new PerfilVeterinario { UsuarioId = usersVet[2].Id, MatriculaProfesional = "MP-3003", EstadoVerificacion = "Pendiente", Biografia = "Recién graduado" });
            
            // Agregarles perfil ciudadano también para que tengan nombre en el foro
            context.PerfilesCiudadanos.Add(new PerfilCiudadano { UsuarioId = usersVet[0].Id, NombreCompleto = "Dr. Juan Pérez", Barrio = "Centro", Puntos = 50, FechaRegistro = DateTime.Now });
            context.PerfilesCiudadanos.Add(new PerfilCiudadano { UsuarioId = usersVet[1].Id, NombreCompleto = "Dra. Ana López", Barrio = "Roca", Puntos = 80, FechaRegistro = DateTime.Now });
            context.PerfilesCiudadanos.Add(new PerfilCiudadano { UsuarioId = usersVet[2].Id, NombreCompleto = "Vet. Carlos Ruiz", Barrio = "Mitre", Puntos = 10, FechaRegistro = DateTime.Now });

            // B. Comerciantes (3)
            var usersShop = new List<Usuario>();
            for(int i=1; i<=3; i++) {
                var u = new Usuario { NombreUsuario = $"shop_{i}", PasswordHash = "1234", Rol = "Ciudadano" };
                usersShop.Add(u);
                context.Usuarios.Add(u);
            }
            context.SaveChanges();
            // Perfiles ciudadanos para ellos
            context.PerfilesCiudadanos.Add(new PerfilCiudadano { UsuarioId = usersShop[0].Id, NombreCompleto = "Dueño PetShop Huesos", Barrio = "Centro", Puntos = 20, FechaRegistro = DateTime.Now });
            context.PerfilesCiudadanos.Add(new PerfilCiudadano { UsuarioId = usersShop[1].Id, NombreCompleto = "Gerente Forrajería", Barrio = "Estación", Puntos = 30, FechaRegistro = DateTime.Now });
            context.PerfilesCiudadanos.Add(new PerfilCiudadano { UsuarioId = usersShop[2].Id, NombreCompleto = "Peluquería Canina", Barrio = "Sur", Puntos = 15, FechaRegistro = DateTime.Now });

            // C. Ciudadanos / Transitantes (10)
            var usersCiu = new List<Usuario>();
            string[] nombres = { "Maria", "Pedro", "Sofia", "Lucas", "Elena", "Martin", "Lucia", "Jorge", "Valentina", "Diego" };
            string[] barrios = { "Centro", "Roca", "San Martin", "Mitre", "Belgrano", "Pringles Viejo", "Independencia", "Obrero" };

            for(int i=0; i<10; i++) {
                var u = new Usuario { NombreUsuario = $"vecino_{i}", PasswordHash = "1234", Rol = "Ciudadano" };
                usersCiu.Add(u);
                context.Usuarios.Add(u);
            }
            context.SaveChanges();

            foreach(var (user, idx) in usersCiu.Select((val, i) => (val, i))) {
                context.PerfilesCiudadanos.Add(new PerfilCiudadano { 
                    UsuarioId = user.Id, 
                    NombreCompleto = $"{nombres[idx]} Apellido", 
                    Barrio = barrios[rnd.Next(barrios.Length)], 
                    Puntos = rnd.Next(0, 500), 
                    FechaRegistro = DateTime.Now.AddDays(-rnd.Next(1, 365)),
                    LatitudHome = GetLat(),
                    LongitudHome = GetLng()
                });
                
                // Creamos perfil adoptante para todos
                context.PerfilesAdoptantes.Add(new PerfilAdoptante { UsuarioId = user.Id, TelefonoContacto = $"2922-{rnd.Next(400000, 499999)}" });
            }
            context.SaveChanges();

            // ==============================================================================
            // 3. CLÍNICAS VETERINARIAS
            // ==============================================================================
            var perfilVetId1 = context.PerfilesVeterinarios.First(p => p.UsuarioId == usersVet[0].Id).Id;
            var perfilVetId2 = context.PerfilesVeterinarios.First(p => p.UsuarioId == usersVet[1].Id).Id;

            context.Clinicas.AddRange(
                new Clinica { Nombre = "San Roque", Direccion = "Av. 25 de Mayo 1200", Telefono = "2922-411111", Latitud = -37.9945, Longitud = -61.3530, EsDeTurno = true, FechaInicioTurno = DateTime.Now, PerfilVeterinarioId = perfilVetId1, HorariosEstructurados = "L-V 8-20hs" },
                new Clinica { Nombre = "Patitas Felices", Direccion = "Mitre 450", Telefono = "2922-422222", Latitud = -37.9980, Longitud = -61.3580, EsDeTurno = false, PerfilVeterinarioId = perfilVetId2, HorariosEstructurados = "L-S 9-13hs" },
                new Clinica { Nombre = "Veterinaria Central", Direccion = "Dorrego 800", Telefono = "2922-433333", Latitud = -37.9920, Longitud = -61.3550, EsDeTurno = false, PerfilVeterinarioId = perfilVetId1, HorariosEstructurados = "L-V 9-17hs" },
                new Clinica { Nombre = "Consultorio Sur", Direccion = "Pringles 2300", Telefono = "2922-444444", Latitud = -38.0010, Longitud = -61.3490, EsDeTurno = false, PerfilVeterinarioId = perfilVetId2, HorariosEstructurados = "L-V 16-20hs" },
                new Clinica { Nombre = "Emergencias Vet", Direccion = "Italia 150", Telefono = "2922-455555", Latitud = -37.9900, Longitud = -61.3600, EsDeTurno = false, PerfilVeterinarioId = perfilVetId1, HorariosEstructurados = "24hs" },
                new Clinica { Nombre = "Vida Animal", Direccion = "San Martín 500", Telefono = "2922-466666", Latitud = -37.9960, Longitud = -61.3510, EsDeTurno = false, PerfilVeterinarioId = perfilVetId2, HorariosEstructurados = "L-S 9-20hs" }
            );
            context.SaveChanges();

            // ==============================================================================
            // 4. COMERCIOS (MARKETPLACE)
            // ==============================================================================
            var comercios = new List<Comercio> {
                new Comercio { UsuarioId = usersShop[0].Id, Nombre = "PetShop El Hueso", Descripcion = "Alimento premium y accesorios.", Telefono = "2922111", Whatsapp="2922111", Direccion = "Dorrego 850", Latitud = GetLat(), Longitud = GetLng(), Etiquetas = "Alimento,Accesorios", NivelPlan = 1, EsDestacado = true, FechaRegistro = DateTime.Now },
                new Comercio { UsuarioId = usersShop[1].Id, Nombre = "Forrajería El Campo", Descripcion = "Alimento balanceado por bolsa.", Telefono = "2922222", Whatsapp="2922222", Direccion = "Roca 200", Latitud = GetLat(), Longitud = GetLng(), Etiquetas = "Alimento,Farmacia", NivelPlan = 0, EsDestacado = false, FechaRegistro = DateTime.Now },
                new Comercio { UsuarioId = usersShop[2].Id, Nombre = "Estética Canina Guau", Descripcion = "Baños y cortes.", Telefono = "2922333", Whatsapp="2922333", Direccion = "Mitre 1500", Latitud = GetLat(), Longitud = GetLng(), Etiquetas = "Peluquería,Estética", NivelPlan = 1, EsDestacado = true, FechaRegistro = DateTime.Now },
                new Comercio { UsuarioId = usersShop[0].Id, Nombre = "Juguetes y Mas", Descripcion = "Todo para divertir a tu mascota.", Telefono = "2922444", Whatsapp="2922444", Direccion = "Pringles 500", Latitud = GetLat(), Longitud = GetLng(), Etiquetas = "Accesorios,Juguetes", NivelPlan = 0, EsDestacado = false, FechaRegistro = DateTime.Now },
                new Comercio { UsuarioId = usersShop[1].Id, Nombre = "Farmacia Vet Pringles", Descripcion = "Medicamentos veterinarios.", Telefono = "2922555", Whatsapp="2922555", Direccion = "25 de Mayo 800", Latitud = GetLat(), Longitud = GetLng(), Etiquetas = "Farmacia", NivelPlan = 1, EsDestacado = true, FechaRegistro = DateTime.Now }
            };
            context.Comercios.AddRange(comercios);
            context.SaveChanges();

            // Productos aleatorios para cada comercio
            string[] prodNombres = { "Alimento 15kg", "Correa", "Hueso Goma", "Pipeta", "Shampoo", "Cucha", "Rascador" };
            foreach(var c in comercios) {
                for(int k=0; k<rnd.Next(3, 8); k++) {
                    context.ItemsCatalogo.Add(new ItemCatalogo { 
                        ComercioId = c.Id, 
                        Nombre = prodNombres[rnd.Next(prodNombres.Length)] + $" {k+1}", 
                        Descripcion = "Producto de excelente calidad.", 
                        Precio = rnd.Next(1000, 50000), 
                        ImagenUrl = null 
                    });
                }
            }

            // ==============================================================================
            // 5. ONG Y HOGARES
            // ==============================================================================
            // Organización
            var org = new PerfilOrganizacion { Nombre = "Refugio Patitas", Descripcion = "Ayudamos a los sin voz.", Barrio = "Periférico", Ciudad = "Cnel. Pringles", EstadoVerificacion = "Aprobado", FechaRegistro = DateTime.Now };
            context.PerfilesOrganizaciones.Add(org);
            context.SaveChanges();
            context.MiembrosOrganizaciones.Add(new MiembroOrganizacion { UsuarioId = usersCiu[0].Id, PerfilOrganizacionId = org.Id, RolEnOrganizacion = "Admin" });

            // Hogares de Tránsito (8 usuarios random)
            for(int i=2; i<10; i++) {
                context.HogaresTransitorios.Add(new HogarTransitorio {
                    UsuarioId = usersCiu[i].Id,
                    DireccionAproximada = $"Barrio {barrios[rnd.Next(barrios.Length)]}",
                    Latitud = GetLat(), Longitud = GetLng(),
                    TipoVivienda = (i % 2 == 0) ? "Casa con Patio" : "Departamento",
                    TienePatioCerrado = (i % 2 == 0),
                    TieneOtrasMascotas = true,
                    TieneNinos = (i % 3 == 0),
                    DisponibilidadHoraria = rnd.Next(1, 4),
                    TiempoCompromiso = "Indefinido",
                    AceptaCuidadosEspeciales = (i > 7),
                    Estado = (i == 9) ? "Pausado" : "Activo", // Uno pausado para probar filtros
                    FechaAlta = DateTime.Now.AddDays(-rnd.Next(10, 100)),
                    UltimaActualizacion = DateTime.Now.AddDays(-rnd.Next(0, 25))
                });
            }
            context.SaveChanges();

            // ==============================================================================
            // 6. ANIMALES (ADOPCIÓN, PERDIDOS, ENCONTRADOS)
            // ==============================================================================
            string[] nombresMascotas = { "Toby", "Luna", "Rocky", "Lola", "Coco", "Mia", "Thor", "Nina", "Max", "Simba", "Kiara", "Bruno", "Mora", "Zeus", "Frida" };
            
            for(int i=0; i<25; i++) {
                var esPerro = rnd.NextDouble() > 0.3; // 70% perros
                var estadoId = rnd.Next(1, 4); // 1: Adopción, 2: Perdido, 3: Encontrado
                var img = esPerro 
                    ? baseUrl + imgsPerros[rnd.Next(imgsPerros.Length)] 
                    : baseUrl + imgsGatos[rnd.Next(imgsGatos.Length)];

                var animal = new Animal {
                    Nombre = nombresMascotas[rnd.Next(nombresMascotas.Length)],
                    Descripcion = $"{(esPerro ? "Perro" : "Gato")} {(estadoId==1 ? "muy cariñoso busca hogar" : "se busca desesperadamente")}. Color { (i%2==0?"Negro":"Marrón") }.",
                    EdadAproximada = $"{rnd.Next(1, 10)} años",
                    FechaPublicacion = DateTime.Now.AddDays(-rnd.Next(0, 14)), // Publicados hace poco
                    FechaUltimaRenovacion = DateTime.Now,
                    UsuarioId = usersCiu[rnd.Next(usersCiu.Count)].Id,
                    IdEspecie = esPerro ? perro.Id : gato.Id,
                    IdEstado = estadoId,
                    UbicacionLat = GetLat(),
                    UbicacionLon = GetLng(),
                    ImagenUrl = img,

                    // BIO-TECH FIELDS (Sprint 4)
                    NivelEnergia = rnd.Next(1, 11), // 1-10
                    NivelInstintoPresa = rnd.Next(1, 11),
                    NivelSociabilidadNinos = rnd.Next(1, 11),
                    NivelSociabilidadPerros = rnd.Next(1, 11),
                    NivelSociabilidadGatos = rnd.Next(1, 11),
                    ToleranciaSoledad = rnd.Next(1, 11),
                    NivelMantenimiento = rnd.Next(1, 6), // 1-5
                    PesoActual = rnd.Next(5, 40) // kg
                };

                // Add Vaccines (Libreta Sanitaria)
                if (estadoId == 1 || estadoId == 3) // Adoptables o Encontrados
                {
                    animal.Vacunas = new List<Vacuna>
                    {
                        new Vacuna { Nombre = "Antirrábica", FechaAplicacion = DateTime.Now.AddMonths(-rnd.Next(1, 12)), Veterinario = "Dr. Seed" },
                        new Vacuna { Nombre = "Quíntuple", FechaAplicacion = DateTime.Now.AddMonths(-rnd.Next(1, 6)), Veterinario = "Dr. Seed" }
                    };
                }

                context.Animales.Add(animal);
                context.SaveChanges();

                // Atributos legacy (mantener por compatibilidad si se usa en filtros viejos)
                if(estadoId == 1) { 
                    context.AnimalAtributos.Add(new AnimalAtributo { AnimalId = animal.Id, AtributoId = atrEnergia.Id, Valor = animal.NivelEnergia }); // Sync
                    context.AnimalAtributos.Add(new AnimalAtributo { AnimalId = animal.Id, AtributoId = atrPatio.Id, Valor = rnd.Next(0, 2) });
                    context.AnimalAtributos.Add(new AnimalAtributo { AnimalId = animal.Id, AtributoId = atrNinos.Id, Valor = animal.NivelSociabilidadNinos > 5 ? 1 : 0 });
                    context.AnimalAtributos.Add(new AnimalAtributo { AnimalId = animal.Id, AtributoId = atrMascotas.Id, Valor = animal.NivelSociabilidadPerros > 5 ? 1 : 0 });
                    context.AnimalAtributos.Add(new AnimalAtributo { AnimalId = animal.Id, AtributoId = atrTamano.Id, Valor = rnd.Next(1, 4) });
                }
            }
            context.SaveChanges();

            // ==============================================================================
            // 7. COMUNIDAD Y CAMPAÑAS
            // ==============================================================================
            context.Posts.AddRange(
                new Post { Titulo = "¡Gracias por adoptar!", Contenido = "Toby ya está feliz con su familia.", FechaPublicacion = DateTime.Now.AddDays(-1), Categoria = "Final Feliz", UsuarioId = usersCiu[0].Id },
                new Post { Titulo = "¿Alguien vio a mi gato?", Contenido = "Se perdió por zona céntrica.", FechaPublicacion = DateTime.Now, Categoria = "Ayuda", UsuarioId = usersCiu[1].Id },
                new Post { Titulo = "Campaña de Castración", Contenido = "Excelente iniciativa municipal.", FechaPublicacion = DateTime.Now.AddDays(-2), Categoria = "General", UsuarioId = usersVet[0].Id },
                new Post { Titulo = "Duda sobre alimento", Contenido = "¿Qué marca recomiendan para cachorros?", FechaPublicacion = DateTime.Now.AddDays(-3), Categoria = "Consulta", UsuarioId = usersCiu[2].Id },
                new Post { Titulo = "Encontré perro", Contenido = "Tiene collar rojo, lo tengo en tránsito.", FechaPublicacion = DateTime.Now, Categoria = "Ayuda", UsuarioId = usersCiu[3].Id }
            );

            context.Campanias.AddRange(
                new Campania { Titulo = "Vacunación Plaza San Martín", Descripcion = "Antirrábica Gratuita | Fin: 13:00", FechaHora = DateTime.Now.AddDays(2), UbicacionLat = -37.994, UbicacionLon = -61.353 },
                new Campania { Titulo = "Castración Móvil Barrio Roca", Descripcion = "Con turno previo | Tel: Muni", FechaHora = DateTime.Now.AddDays(5), UbicacionLat = -37.989, UbicacionLon = -61.345 },
                new Campania { Titulo = "Charla Tenencia Responsable", Descripcion = "Casa del Bicentenario | 18:00hs", FechaHora = DateTime.Now.AddDays(10), UbicacionLat = -37.995, UbicacionLon = -61.358 }
            );

            context.SaveChanges();
            Console.WriteLine("--> POBLADO EXITOSO: La base de datos ahora está llena de vida.");
        }
    }
}