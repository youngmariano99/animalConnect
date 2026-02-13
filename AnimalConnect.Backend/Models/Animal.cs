using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;
using System.Text.Json.Serialization;

namespace AnimalConnect.Backend.Models
{
    public class Animal
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Nombre { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Descripcion { get; set; } = string.Empty;

        [MaxLength(50)]
        public string EdadAproximada { get; set; } = string.Empty;

        public string? ImagenUrl { get; set; } // Puede ser nulo si no tiene foto aún
        [NotMapped] 
        public IFormFile? Foto { get; set; }

        // Geolocalización (Refactor PostGIS)
        [JsonIgnore]
        [Column(TypeName = "geometry(Point, 4326)")]
        public Point? Ubicacion { get; set; }

        [NotMapped]
        public double? UbicacionLat
        {
            get => Ubicacion?.Y ?? _tempLat;
            set => _tempLat = value;
        }
        private double? _tempLat;

        [NotMapped]
        public double? UbicacionLon
        {
            get => Ubicacion?.X ?? _tempLon;
            set => _tempLon = value;
        }
        private double? _tempLon;


        // Fechas del Ciclo de Vida
        public DateTime FechaPublicacion { get; set; } = DateTime.Now;

        // NUEVO: Para saber cuándo vence (Fecha + 15 días)
        public DateTime FechaUltimaRenovacion { get; set; } = DateTime.Now;

        // Datos opcionales del contacto
        [MaxLength(20)]
        public string? TelefonoContacto { get; set; } 

        // Relación con Usuario (quién publicó el animal)
        public int? UsuarioId { get; set; } 
        [ForeignKey("UsuarioId")]
        public virtual Usuario? Usuario { get; set; }

        // Relación dinámica para el Match
        public virtual ICollection<AnimalAtributo>? Atributos { get; set; }

        // --- RELACIONES (Foreign Keys) ---

        // 1. Relación con Especie
        public int IdEspecie { get; set; } // La columna FK en la tabla
        
        [ForeignKey("IdEspecie")]
        public virtual Especie? Especie { get; set; } // El objeto para navegar (hacer Joins)

        // 2. Relación con Estado
        public int IdEstado { get; set; }
        
        [ForeignKey("IdEstado")]
        public virtual Estado? Estado { get; set; }

        // --- MODULO BIO-TECH: ETOLOGÍA Y MATCH (Escala 1-10) ---
        public int NivelEnergia { get; set; } = 5; // 1 (Sofá) - 10 (Atleta)
        public int NivelInstintoPresa { get; set; } = 1; // 1 (Bajo) - 10 (Alto/Cazador)
        public int NivelSociabilidadNinos { get; set; } = 5; // 1 (Peligroso) - 10 (Niñera)
        public int NivelSociabilidadPerros { get; set; } = 5;
        public int NivelSociabilidadGatos { get; set; } = 5;
        public int ToleranciaSoledad { get; set; } = 5; // 1 (Ansiedad) - 10 (Independiente)
        public int NivelMantenimiento { get; set; } = 1; // 1 (Básico) - 4 (Cuidados Paliativos/Complejo)

        // --- MODULO SALUD: LIBRETA SANITARIA V1 ---
        public double PesoActual { get; set; } // En kg
        
        public virtual ICollection<Vacuna>? Vacunas { get; set; }

    }
}