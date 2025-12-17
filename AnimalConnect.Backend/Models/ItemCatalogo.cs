using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnimalConnect.Backend.Models
{
    public class ItemCatalogo
    {
        public int Id { get; set; }
        
        [Required]
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        public decimal Precio { get; set; } // Opcional, puede ser 0 si es "Consultar"
        public string? ImagenUrl { get; set; }
        
        public int ComercioId { get; set; }
        [ForeignKey("ComercioId")]
        public virtual Comercio? Comercio { get; set; }
    }
}