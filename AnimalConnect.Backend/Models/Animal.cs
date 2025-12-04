using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

        // Geolocalización (usamos double para lat/lon)
        public double? UbicacionLat { get; set; }
        public double? UbicacionLon { get; set; }


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

        
    }
}