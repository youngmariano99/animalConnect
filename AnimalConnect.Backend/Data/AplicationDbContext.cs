using AnimalConnect.Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace AnimalConnect.Backend.Data
{
    // Esta clase hereda de DbContext, que es la pieza fundamental de Entity Framework
    public class ApplicationDbContext : DbContext
    {
        // El constructor recibe las opciones de configuración (como la cadena de conexión)
        // y se las pasa a la clase base (DbContext).
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Aquí definimos las tablas (DbSet)
        // El nombre de la propiedad será el nombre de la tabla en SQL Server.
        public DbSet<Animal> Animales { get; set; }
        public DbSet<Especie> Especies { get; set; }
        public DbSet<Estado> Estados { get; set; }
        public DbSet<Usuario> Usuarios { get; set; }

        // Este método sirve para configurar datos iniciales (Seeding) o relaciones complejas
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // --- DATA SEEDING (Datos Semilla) ---
            // Esto es genial: Cuando crees la BD, automáticamente insertará estos datos.
            // Sirve para no tener las tablas vacías al probar.

            // 1. Cargar Especies básicas
            modelBuilder.Entity<Especie>().HasData(
                new Especie { Id = 1, Nombre = "Perro" },
                new Especie { Id = 2, Nombre = "Gato" },
                new Especie { Id = 3, Nombre = "Otro" }
            );

            // 2. Cargar Estados básicos
            modelBuilder.Entity<Estado>().HasData(
                new Estado { Id = 1, Nombre = "En Adopción" },
                new Estado { Id = 2, Nombre = "Perdido" },
                new Estado { Id = 3, Nombre = "Encontrado" },
                new Estado { Id = 4, Nombre = "Adoptado" }
            );
        }
    }
}