using System.ComponentModel.DataAnnotations;

namespace AnimalConnect.Backend.Models
{
    public class Campania
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Titulo { get; set; } = string.Empty; // Ej: "Castración Barrio Roca"

        [MaxLength(500)]
        public string Descripcion { get; set; } = string.Empty; // Ej: "Traer ayuno de 12hs"

        public DateTime FechaHora { get; set; } // Cuándo es

        // Dónde es (para el mapa)
        public double UbicacionLat { get; set; }
        public double UbicacionLon { get; set; }
    }
}