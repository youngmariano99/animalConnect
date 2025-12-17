using AnimalConnect.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace AnimalConnect.Backend.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // 1. Aplicar Migraciones pendientes
            context.Database.Migrate();

            // 2. Verificar si ya existen datos para no duplicar
            if (context.Usuarios.Any()) return;

            Console.WriteLine("--> INICIANDO SEMBRADO DE DATOS COMPLETO (ALL SPRINTS)...");
            
            // URL Base para imágenes (Asegúrate de que coincida con tu puerto)
            string baseUrl = "http://127.0.0.1:5269/uploads/";

            // ==============================================================================
            // 1. CATÁLOGOS BASE (Especies, Estados, Atributos)
            // ==============================================================================
            var perro = new Especie { Nombre = "Perro" };
            var gato = new Especie { Nombre = "Gato" };
            context.Especies.AddRange(perro, gato);

            var estAdopcion = new Estado { Nombre = "En Adopción" };
            var estPerdido = new Estado { Nombre = "Perdido" };
            var estEncontrado = new Estado { Nombre = "Encontrado" };
            var estFinalizado = new Estado { Nombre = "Finalizado" };
            context.Estados.AddRange(estAdopcion, estPerdido, estEncontrado, estFinalizado);

            // Atributos para el Match
            var atrEnergia = new Atributo { Nombre = "Nivel de Energía", Tipo = "Escala" };
            var atrPatio = new Atributo { Nombre = "Requiere Patio", Tipo = "Booleano" };
            var atrNinos = new Atributo { Nombre = "Apto con Niños", Tipo = "Booleano" };
            var atrMascotas = new Atributo { Nombre = "Apto con Mascotas", Tipo = "Booleano" };
            var atrTiempo = new Atributo { Nombre = "Tiempo Requerido", Tipo = "Escala" };
            var atrTamano = new Atributo { Nombre = "Tamaño", Tipo = "Escala" };
            
            context.Atributos.AddRange(atrEnergia, atrPatio, atrNinos, atrMascotas, atrTiempo, atrTamano);
            context.SaveChanges(); // Guardamos para obtener IDs

            // ==============================================================================
            // 2. USUARIOS (ACTORES DEL SISTEMA)
            // ==============================================================================
            // Password genérica: 1234
            var userVet = new Usuario { NombreUsuario = "vet_juan", PasswordHash = "1234", Rol = "Veterinario" };
            var userOng = new Usuario { NombreUsuario = "patitas_ong", PasswordHash = "1234", Rol = "Ciudadano" }; // Admin de ONG
            var userComercio = new Usuario { NombreUsuario = "petshop_loco", PasswordHash = "1234", Rol = "Ciudadano" }; // Dueño Comercio
            var userCiudadano = new Usuario { NombreUsuario = "vecino_marcos", PasswordHash = "1234", Rol = "Ciudadano" };
            var userHogar = new Usuario { NombreUsuario = "ana_transito", PasswordHash = "1234", Rol = "Ciudadano" };

            context.Usuarios.AddRange(userVet, userOng, userComercio, userCiudadano, userHogar);
            context.SaveChanges();

            // ==============================================================================
            // 3. PERFILES DE USUARIOS
            // ==============================================================================
            
            // A. Perfil Ciudadano (Para todos)
            context.PerfilesCiudadanos.AddRange(
                new PerfilCiudadano { UsuarioId = userVet.Id, NombreCompleto = "Juan Veterinario", Barrio = "Centro", Puntos = 50, FechaRegistro = DateTime.Now },
                new PerfilCiudadano { UsuarioId = userOng.Id, NombreCompleto = "Admin Patitas", Barrio = "Roca", Puntos = 1000, FechaRegistro = DateTime.Now },
                new PerfilCiudadano { UsuarioId = userComercio.Id, NombreCompleto = "Carlos Vendedor", Barrio = "Boulevard", Puntos = 10, FechaRegistro = DateTime.Now },
                new PerfilCiudadano { UsuarioId = userCiudadano.Id, NombreCompleto = "Marcos Pérez", Barrio = "San Martín", Puntos = 25, FechaRegistro = DateTime.Now, LatitudHome = -37.994, LongitudHome = -61.353 },
                new PerfilCiudadano { UsuarioId = userHogar.Id, NombreCompleto = "Ana García", Barrio = "Pringles Viejo", Puntos = 200, FechaRegistro = DateTime.Now }
            );

            // B. Perfil Veterinario
            var perfilVet = new PerfilVeterinario { 
                UsuarioId = userVet.Id, 
                MatriculaProfesional = "MP-9988", 
                EstadoVerificacion = "Aprobado", 
                Biografia = "Especialista en cirugía y traumatología." 
            };
            context.PerfilesVeterinarios.Add(perfilVet);
            context.SaveChanges();

            // ==============================================================================
            // 4. MÓDULO SALUD (VETERINARIAS)
            // ==============================================================================
            var clinica1 = new Clinica {
                Nombre = "Clínica San Roque",
                Direccion = "Av. 25 de Mayo 1200",
                Telefono = "2922-411111",
                Latitud = -37.9945, Longitud = -61.3530,
                EsDeTurno = true,
                FechaInicioTurno = DateTime.Now, // Turno activo hoy
                PerfilVeterinarioId = perfilVet.Id,
                HorariosEstructurados = "L-V 8-20hs | Sáb 9-13hs"
            };
            
            var clinica2 = new Clinica {
                Nombre = "Consultorio Dr. Juan",
                Direccion = "Sáenz Peña 400",
                Telefono = "2922-422222",
                Latitud = -37.9980, Longitud = -61.3580,
                EsDeTurno = false,
                PerfilVeterinarioId = perfilVet.Id,
                HorariosEstructurados = "L-V 16-20hs"
            };
            context.Clinicas.AddRange(clinica1, clinica2);

            // ==============================================================================
            // 5. MÓDULO MARKETPLACE (COMERCIOS Y PRODUCTOS)
            // ==============================================================================
            var tienda1 = new Comercio {
                UsuarioId = userComercio.Id,
                Nombre = "PetShop El Hueso",
                Descripcion = "Todo para tu mascota. Alimento balanceado premium y accesorios.",
                Telefono = "2922123456",
                Whatsapp = "2922123456",
                Direccion = "Dorrego 850",
                Latitud = -37.9920, Longitud = -61.3550,
                Etiquetas = "Alimento,Accesorios,Juguetes",
                NivelPlan = 1, // Plan Pago
                EsDestacado = true,
                FechaRegistro = DateTime.Now
            };

            var tienda2 = new Comercio {
                UsuarioId = userComercio.Id,
                Nombre = "Peluquería Canina Guau",
                Descripcion = "Baño y corte para todas las razas. Turnos por WhatsApp.",
                Telefono = "2922987654",
                Whatsapp = "2922987654",
                Direccion = "Mitre 200",
                Latitud = -37.9960, Longitud = -61.3510,
                Etiquetas = "Peluquería,Estética",
                NivelPlan = 0,
                EsDestacado = false,
                FechaRegistro = DateTime.Now
            };
            context.Comercios.AddRange(tienda1, tienda2);
            context.SaveChanges(); // Guardar para tener IDs de comercios

            // Catálogo Tienda 1
            context.ItemsCatalogo.AddRange(
                new ItemCatalogo { ComercioId = tienda1.Id, Nombre = "Royal Canin 15kg", Descripcion = "Alimento Adulto Raza Mediana", Precio = 45000, ImagenUrl = null },
                new ItemCatalogo { ComercioId = tienda1.Id, Nombre = "Correa Extensible", Descripcion = "Hasta 5 metros, reforzada", Precio = 8500, ImagenUrl = null }
            );
            // Catálogo Tienda 2
            context.ItemsCatalogo.AddRange(
                new ItemCatalogo { ComercioId = tienda2.Id, Nombre = "Baño Completo", Descripcion = "Incluye corte de uñas", Precio = 6000, ImagenUrl = null }
            );

            // ==============================================================================
            // 6. MÓDULO ONG Y HOGARES
            // ==============================================================================
            
            // Organización
            var org = new PerfilOrganizacion {
                Nombre = "Refugio Patitas Pringles",
                Descripcion = "Rescatamos animales en situación de calle desde 2010.",
                Barrio = "Periférico",
                Ciudad = "Cnel. Pringles",
                EstadoVerificacion = "Aprobado",
                FechaRegistro = DateTime.Now
            };
            context.PerfilesOrganizaciones.Add(org);
            context.SaveChanges();

            // Miembro
            context.MiembrosOrganizaciones.Add(new MiembroOrganizacion {
                UsuarioId = userOng.Id,
                PerfilOrganizacionId = org.Id,
                RolEnOrganizacion = "Admin"
            });

            // Hogar de Tránsito
            var hogar = new HogarTransitorio {
                UsuarioId = userHogar.Id,
                DireccionAproximada = "Zona Plaza Pringles",
                Latitud = -37.994, Longitud = -61.353,
                TipoVivienda = "Casa",
                TienePatioCerrado = true,
                TieneOtrasMascotas = true,
                TieneNinos = false,
                DisponibilidadHoraria = 2, // Media
                TiempoCompromiso = "Hasta que se adopte",
                AceptaCuidadosEspeciales = false,
                Estado = "Activo",
                FechaAlta = DateTime.Now,
                UltimaActualizacion = DateTime.Now
            };
            context.HogaresTransitorios.Add(hogar);

            // ==============================================================================
            // 7. ANIMALES Y MATCH
            // ==============================================================================
            
            // Animal 1: En Adopción (Para Match)
            var animal1 = new Animal {
                Nombre = "Toby",
                Descripcion = "Perrito muy juguetón, ideal para familias con patio. Se lleva bien con todos.",
                EdadAproximada = "2 años",
                FechaPublicacion = DateTime.Now.AddDays(-2),
                FechaUltimaRenovacion = DateTime.Now,
                UsuarioId = userOng.Id, // Lo publicó la ONG
                IdEspecie = perro.Id,
                IdEstado = estAdopcion.Id,
                UbicacionLat = -37.993, UbicacionLon = -61.354,
                ImagenUrl = baseUrl + "PerroAdoptar1.png" // Usando nombre de archivo real si existe
            };

            // Animal 2: Perdido (Para Mapa)
            var animal2 = new Animal {
                Nombre = "Michi",
                Descripcion = "Se perdió ayer cerca de la terminal. Tiene collar rojo.",
                EdadAproximada = "3 años",
                FechaPublicacion = DateTime.Now,
                FechaUltimaRenovacion = DateTime.Now,
                UsuarioId = userCiudadano.Id,
                IdEspecie = gato.Id,
                IdEstado = estPerdido.Id,
                UbicacionLat = -37.999, UbicacionLon = -61.350,
                ImagenUrl = baseUrl + "GatoPerdido1.png"
            };

            context.Animales.AddRange(animal1, animal2);
            context.SaveChanges();

            // Atributos de Toby (Para que el match funcione)
            context.AnimalAtributos.AddRange(
                new AnimalAtributo { AnimalId = animal1.Id, AtributoId = atrEnergia.Id, Valor = 5 }, // Mucha energía
                new AnimalAtributo { AnimalId = animal1.Id, AtributoId = atrPatio.Id, Valor = 1 },   // Sí requiere patio (1=True)
                new AnimalAtributo { AnimalId = animal1.Id, AtributoId = atrNinos.Id, Valor = 1 },   // Apto niños
                new AnimalAtributo { AnimalId = animal1.Id, AtributoId = atrMascotas.Id, Valor = 1 } // Apto mascotas
            );

            // ==============================================================================
            // 8. COMUNIDAD Y CAMPAÑAS
            // ==============================================================================
            
            context.Posts.Add(new Post {
                Titulo = "¡Gracias por adoptar!",
                Contenido = "Hoy Toby encontró un hogar. Gracias a todos por compartir.",
                FechaPublicacion = DateTime.Now,
                Categoria = "Final Feliz",
                UsuarioId = userOng.Id
            });

            context.Campanias.Add(new Campania {
                Titulo = "Vacunación Antirrábica",
                Descripcion = "Plaza San Martín | Fin: 13:00 | Tel: Muni",
                FechaHora = DateTime.Now.AddDays(2),
                UbicacionLat = -37.994, UbicacionLon = -61.353
            });

            context.SaveChanges();
            Console.WriteLine("--> SEMBRADO EXITOSO. BASE DE DATOS LISTA PARA DEMO.");
        }
    }
}