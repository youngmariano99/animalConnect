using AnimalConnect.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace AnimalConnect.Backend.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {

            context.Database.Migrate();

            // 2. ¿Ya hay usuarios? Si es así, no hacemos nada (ya se sembró)
            if (context.Usuarios.Any())
            {
                return;   
            }

            // --- A. CATALOGOS BASE ---
            var especies = new Especie[]
            {
                new Especie { Nombre = "Perro" },
                new Especie { Nombre = "Gato" }
            };
            context.Especies.AddRange(especies);

            var estados = new Estado[]
            {
                new Estado { Nombre = "En Adopción" },
                new Estado { Nombre = "Perdido" },
                new Estado { Nombre = "Encontrado" }
            };
            context.Estados.AddRange(estados);

            var atributos = new Atributo[]
            {
                new Atributo { Nombre = "Nivel de Energía", Tipo = "Escala" },    // Id 1
                new Atributo { Nombre = "Requiere Patio", Tipo = "Booleano" },    // Id 2
                new Atributo { Nombre = "Apto con Niños", Tipo = "Booleano" },    // Id 3
                new Atributo { Nombre = "Apto con Mascotas", Tipo = "Booleano" }, // Id 4
                new Atributo { Nombre = "Tiempo Requerido", Tipo = "Escala" },    // Id 5
                new Atributo { Nombre = "Tamaño", Tipo = "Escala" },              // Id 6
                new Atributo { Nombre = "Nivel Experiencia", Tipo = "Escala" }    // Id 7
            };
            context.Atributos.AddRange(atributos);
            context.SaveChanges(); // Guardamos catálogos primero para tener sus IDs

            // --- B. USUARIOS ---
            // 1. Admin
            var admin = new Usuario { NombreUsuario = "admin", PasswordHash = "admin123", Rol = "Administrador" };
            
            // 2. Veterinario
            var vet = new Usuario { NombreUsuario = "vet_demo", PasswordHash = "vet123", Rol = "Veterinario" };
            var perfilVet = new PerfilVeterinario
            {
                Usuario = vet,
                NombreVeterinaria = "Veterinaria San Roque",
                MatriculaProfesional = "MP-9999",
                Direccion = "Av. Principal 123",
                TelefonoProfesional = "5491112345678",
                HorariosAtencion = "Lun a Vie: 09:00-18:00",
                EstadoVerificacion = "Aprobado",
                EsDeTurno = true, // ¡De turno por defecto!
                Biografia = "Especialistas en pequeños animales y urgencias 24hs.",
                Latitud = -37.994, 
                Longitud = -61.353
            };

            // 3. Ciudadano (Para las pruebas de adopción)
            var ciudadano = new Usuario { NombreUsuario = "juan", PasswordHash = "1234", Rol = "Ciudadano" };
            var perfilCiu = new PerfilCiudadano { Usuario = ciudadano, NombreCompleto = "Juan Perez", FechaRegistro = DateTime.Now };

            context.Usuarios.AddRange(admin, vet, ciudadano);
            context.PerfilesVeterinarios.Add(perfilVet);
            context.PerfilesCiudadanos.Add(perfilCiu);
            context.SaveChanges();

            // --- C. ANIMALES DE PRUEBA ---
            string baseUrl = "http://127.0.0.1:5269/uploads/"; // Ajusta tu puerto si cambia

            var animales = new Animal[]
            {
                new Animal 
                { 
                    Nombre = "Rocky", 
                    Descripcion = "Perro guardián, mucha energía.", 
                    EdadAproximada = "2 años", 
                    ImagenUrl = baseUrl + "PerroAdoptar1.png", 
                    UbicacionLat = -37.994, UbicacionLon = -61.353, 
                    FechaPublicacion = DateTime.Now, FechaUltimaRenovacion = DateTime.Now,
                    Especie = especies[0], // Perro
                    Estado = estados[0],   // Adopción
                    Usuario = ciudadano    // Creado por Juan
                },
                new Animal 
                { 
                    Nombre = "Mishi", 
                    Descripcion = "Gatita de departamento.", 
                    EdadAproximada = "4 años", 
                    ImagenUrl = baseUrl + "GatoAdoptar1.png", 
                    UbicacionLat = -37.996, UbicacionLon = -61.355, 
                    FechaPublicacion = DateTime.Now, FechaUltimaRenovacion = DateTime.Now,
                    Especie = especies[1], // Gato
                    Estado = estados[0],   // Adopción
                    Usuario = ciudadano
                }
            };
            context.Animales.AddRange(animales);
            context.SaveChanges();

            // --- D. ATRIBUTOS DE ANIMALES (MATCH) ---
            // Rocky (Energía Alta, Patio SI...)
            context.AnimalAtributos.AddRange(
                new AnimalAtributo { Animal = animales[0], Atributo = atributos[0], Valor = 3 },
                new AnimalAtributo { Animal = animales[0], Atributo = atributos[1], Valor = 1 },
                new AnimalAtributo { Animal = animales[0], Atributo = atributos[5], Valor = 2 } // Tamaño Mediano
            );
            
            context.SaveChanges();
        }
    }
}