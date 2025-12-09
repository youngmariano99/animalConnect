using AnimalConnect.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace AnimalConnect.Backend.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            context.Database.Migrate();

            // Si hay usuarios, ya se sembró.
            if (context.Usuarios.Any()) return;

            Console.WriteLine("--> INICIANDO CARGA MASIVA (REFACTOR CLINICAS)...");
            var hoy = DateTime.Now;
            string baseUrl = "http://127.0.0.1:5269/uploads/";

            // 1. CATALOGOS
            if (!context.Especies.Any())
                context.Especies.AddRange(new Especie { Nombre = "Perro" }, new Especie { Nombre = "Gato" });
            
            if (!context.Estados.Any())
                context.Estados.AddRange(new Estado { Nombre = "En Adopción" }, new Estado { Nombre = "Perdido" }, new Estado { Nombre = "Encontrado" }, new Estado { Nombre = "Reencuentro" });

            if (!context.Atributos.Any())
                context.Atributos.AddRange(
                    new Atributo { Nombre = "Nivel de Energía", Tipo = "Escala" },
                    new Atributo { Nombre = "Requiere Patio", Tipo = "Booleano" },
                    new Atributo { Nombre = "Apto con Niños", Tipo = "Booleano" },
                    new Atributo { Nombre = "Apto con Mascotas", Tipo = "Booleano" },
                    new Atributo { Nombre = "Tiempo Requerido", Tipo = "Escala" },
                    new Atributo { Nombre = "Tamaño", Tipo = "Escala" },
                    new Atributo { Nombre = "Nivel Experiencia", Tipo = "Escala" }
                );
            context.SaveChanges();

            // 2. USUARIOS VETERINARIOS (Personas)
            var vetUser1 = new Usuario { NombreUsuario = "vet_juan", PasswordHash = "1234", Rol = "Veterinario" };
            var vetUser2 = new Usuario { NombreUsuario = "vet_ana", PasswordHash = "1234", Rol = "Veterinario" };
            
            context.Usuarios.AddRange(vetUser1, vetUser2);
            context.SaveChanges(); // Guardamos para tener IDs

            // 3. PERFILES VETERINARIOS
            var perfilVet1 = new PerfilVeterinario { UsuarioId = vetUser1.Id, MatriculaProfesional = "MP-111", EstadoVerificacion = "Aprobado", Biografia = "Cirujano General" };
            var perfilVet2 = new PerfilVeterinario { UsuarioId = vetUser2.Id, MatriculaProfesional = "MP-222", EstadoVerificacion = "Aprobado", Biografia = "Especialista en Gatos" };

            context.PerfilesVeterinarios.AddRange(perfilVet1, perfilVet2);
            context.SaveChanges(); // Guardamos para tener IDs de perfiles

            // 4. CLINICAS (Lugares Físicos) - AQUI ESTÁ EL CAMBIO GRANDE
            context.Clinicas.AddRange(
                new Clinica { 
                    Nombre = "Clínica San Roque", 
                    Direccion = "Av. 25 de Mayo 1200", 
                    Telefono = "2922-411111", 
                    Latitud = -37.9945, Longitud = -61.3530, 
                    EsDeTurno = true, 
                    PerfilVeterinarioId = perfilVet1.Id, // Dueño Juan
                    HorariosEstructurados = "L-V 8-20hs"
                },
                new Clinica { 
                    Nombre = "Patitas Felices", 
                    Direccion = "Calle 9 de Julio 450", 
                    Telefono = "2922-422222", 
                    Latitud = -37.9980, Longitud = -61.3580, 
                    EsDeTurno = false, 
                    PerfilVeterinarioId = perfilVet2.Id, // Dueño Ana
                    HorariosEstructurados = "L-S 9-13hs"
                }
            );
            context.SaveChanges();

            // 5. CIUDADANOS
            var ciudadano = new Usuario { NombreUsuario = "vecino_1", PasswordHash = "1234", Rol = "Ciudadano" };
            context.Usuarios.Add(ciudadano);
            context.SaveChanges();

            context.PerfilesCiudadanos.Add(new PerfilCiudadano { UsuarioId = ciudadano.Id, NombreCompleto = "Vecino Pringles", LatitudHome = -37.994, LongitudHome = -61.353 });
            context.PerfilesAdoptantes.Add(new PerfilAdoptante { UsuarioId = ciudadano.Id, TelefonoContacto = "123456" });
            context.SaveChanges();

            Console.WriteLine("--> DB INICIALIZADA CORRECTAMENTE.");
        }
    }
}