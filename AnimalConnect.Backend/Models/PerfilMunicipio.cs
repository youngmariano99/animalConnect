using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnimalConnect.Backend.Models
{
    public class PerfilMunicipio
    {
        [Key]
        public int Id { get; set; }

        public int UsuarioId { get; set; }
        [ForeignKey("UsuarioId")]
        public virtual Usuario? Usuario { get; set; }

        [Required]
        public string NombreMunicipio { get; set; } = string.Empty; // Ej: "Municipalidad de Cnel. Pringles"

        [Required]
        public string Provincia { get; set; } = string.Empty;

        // COORDENADAS DEL CENTRO ADMINISTRATIVO
        public double LatitudCentro { get; set; }
        public double LongitudCentro { get; set; }

        // RADIO DE COBERTURA (En Kilómetros) para filtrar datos
        public double RadioCoberturaKm { get; set; } = 15.0; 
    }
}