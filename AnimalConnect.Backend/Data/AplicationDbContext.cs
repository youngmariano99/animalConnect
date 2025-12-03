using AnimalConnect.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace AnimalConnect.Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Animal> Animales { get; set; }
        public DbSet<Especie> Especies { get; set; }
        public DbSet<Estado> Estados { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Campania> Campanias { get; set; }
        public DbSet<Atributo> Atributos { get; set; }
        public DbSet<AnimalAtributo> AnimalAtributos { get; set; }
        public DbSet<PerfilAdoptante> PerfilesAdoptantes { get; set; }
        public DbSet<PreferenciaAdoptante> PreferenciasAdoptantes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Especies y Estados
            modelBuilder.Entity<Especie>().HasData(new Especie { Id = 1, Nombre = "Perro" }, new Especie { Id = 2, Nombre = "Gato" });
            modelBuilder.Entity<Estado>().HasData(new Estado { Id = 1, Nombre = "En Adopción" }, new Estado { Id = 2, Nombre = "Perdido" }, new Estado { Id = 3, Nombre = "Encontrado" });

            // 2. ATRIBUTOS (¡Nuevos agregados!)
            modelBuilder.Entity<Atributo>().HasData(
                new Atributo { Id = 1, Nombre = "Nivel de Energía", Tipo = "Escala" },    // 1-3 (Bajo, Medio, Alto)
                new Atributo { Id = 2, Nombre = "Requiere Patio", Tipo = "Booleano" },    // 1=Si, 0=No
                new Atributo { Id = 3, Nombre = "Apto con Niños", Tipo = "Booleano" },    // 1=Si, 0=No
                new Atributo { Id = 4, Nombre = "Apto con Mascotas", Tipo = "Booleano" }, // 1=Si, 0=No
                new Atributo { Id = 5, Nombre = "Tiempo Requerido", Tipo = "Escala" },    // 1=Poco, 3=Mucho
                new Atributo { Id = 6, Nombre = "Tamaño", Tipo = "Escala" },              // 1=Pequeño, 2=Mediano, 3=Grande
                new Atributo { Id = 7, Nombre = "Nivel Experiencia", Tipo = "Escala" }    // 1=Principiante, 2=Intermedio, 3=Experto
            );

            // 3. Usuarios Admin
            modelBuilder.Entity<Usuario>().HasData(new Usuario { Id = 1, NombreUsuario = "admin", PasswordHash = "admin123", Rol = "Administrador" });

            // 4. Animales (Fechas Fijas)
            string baseUrl = "http://127.0.0.1:5269/uploads/";
            var fechaFija = DateTime.Parse("2025-12-01");

            modelBuilder.Entity<Animal>().HasData(
                new Animal { Id = 1, Nombre = "Rocky", Descripcion = "Perro guardián, mucha energía.", EdadAproximada = "2 años", ImagenUrl = baseUrl + "PerroAdoptar1.png", UbicacionLat = -37.994, UbicacionLon = -61.353, FechaPublicacion = fechaFija, IdEspecie = 1, IdEstado = 1 },
                new Animal { Id = 2, Nombre = "Mishi", Descripcion = "Gatita de departamento.", EdadAproximada = "4 años", ImagenUrl = baseUrl + "GatoAdoptar1.png", UbicacionLat = -37.996, UbicacionLon = -61.355, FechaPublicacion = fechaFija, IdEspecie = 2, IdEstado = 1 },
                new Animal { Id = 3, Nombre = "Hulk", Descripcion = "Gigante y bonachón, necesita patio.", EdadAproximada = "3 años", ImagenUrl = baseUrl + "PerroAdoptar2.png", UbicacionLat = -37.991, UbicacionLon = -61.350, FechaPublicacion = fechaFija, IdEspecie = 1, IdEstado = 1 }
            );

            // 5. VALORES DE LOS ANIMALES (Aquí definimos su personalidad para el Match)
            modelBuilder.Entity<AnimalAtributo>().HasData(
                // Rocky (Energía Alta, Patio SI, Niños NO, Perros SI, Tamaño Mediano, Experiencia Media)
                new AnimalAtributo { Id = 1, AnimalId = 1, AtributoId = 1, Valor = 3 }, // Energía Alta
                new AnimalAtributo { Id = 2, AnimalId = 1, AtributoId = 2, Valor = 1 }, // Patio SI
                new AnimalAtributo { Id = 3, AnimalId = 1, AtributoId = 3, Valor = 0 }, // Niños NO (Bloqueante)
                new AnimalAtributo { Id = 4, AnimalId = 1, AtributoId = 4, Valor = 1 }, // Mascotas SI
                new AnimalAtributo { Id = 5, AnimalId = 1, AtributoId = 5, Valor = 2 }, // Tiempo Medio
                new AnimalAtributo { Id = 6, AnimalId = 1, AtributoId = 6, Valor = 2 }, // Tamaño Mediano
                new AnimalAtributo { Id = 7, AnimalId = 1, AtributoId = 7, Valor = 2 }, // Experiencia Intermedia

                // Mishi (Energía Baja, Patio NO, Niños SI, Perros NO, Tamaño Pequeño, Experiencia Baja)
                new AnimalAtributo { Id = 8, AnimalId = 2, AtributoId = 1, Valor = 1 }, // Energía Baja
                new AnimalAtributo { Id = 9, AnimalId = 2, AtributoId = 2, Valor = 0 }, // Patio NO
                new AnimalAtributo { Id = 10, AnimalId = 2, AtributoId = 3, Valor = 1 }, // Niños SI
                new AnimalAtributo { Id = 11, AnimalId = 2, AtributoId = 4, Valor = 0 }, // Mascotas NO (Bloqueante si tienes perro)
                new AnimalAtributo { Id = 12, AnimalId = 2, AtributoId = 5, Valor = 1 }, // Tiempo Poco
                new AnimalAtributo { Id = 13, AnimalId = 2, AtributoId = 6, Valor = 1 }, // Tamaño Pequeño
                new AnimalAtributo { Id = 14, AnimalId = 2, AtributoId = 7, Valor = 1 }, // Experiencia Baja

                // Hulk (Energía Media, Patio SI, Niños SI, Perros SI, Tamaño Grande, Experiencia Baja)
                new AnimalAtributo { Id = 15, AnimalId = 3, AtributoId = 1, Valor = 2 }, 
                new AnimalAtributo { Id = 16, AnimalId = 3, AtributoId = 2, Valor = 1 }, // Requiere Patio
                new AnimalAtributo { Id = 17, AnimalId = 3, AtributoId = 3, Valor = 1 },
                new AnimalAtributo { Id = 18, AnimalId = 3, AtributoId = 4, Valor = 1 },
                new AnimalAtributo { Id = 19, AnimalId = 3, AtributoId = 5, Valor = 2 },
                new AnimalAtributo { Id = 20, AnimalId = 3, AtributoId = 6, Valor = 3 }, // Tamaño Grande
                new AnimalAtributo { Id = 21, AnimalId = 3, AtributoId = 7, Valor = 1 }
            );
        }
    }
}