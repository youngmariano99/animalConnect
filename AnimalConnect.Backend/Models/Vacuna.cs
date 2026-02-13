using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace AnimalConnect.Backend.Models
{
    public class Vacuna
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty; // Ej: "Quíntuple", "Antirrábica"

        [MaxLength(100)]
        public string Marca { get; set; } = string.Empty; // Ej: "Nobivac", "Zoetis"

        [MaxLength(50)]
        public string? Lote { get; set; }

        public DateTime FechaAplicacion { get; set; }
        public DateTime? FechaProxima { get; set; } // Vencimiento

        [MaxLength(100)]
        public string? Veterinario { get; set; } // Nombre del profesional o matricula

        public int AnimalId { get; set; }
        [ForeignKey("AnimalId")]
        [JsonIgnore]
        public virtual Animal? Animal { get; set; }
    }
}
