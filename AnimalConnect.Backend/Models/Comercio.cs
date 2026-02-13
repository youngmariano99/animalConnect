using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;
using System.Text.Json.Serialization;

namespace AnimalConnect.Backend.Models
{
    public class Comercio
    {
        public int Id { get; set; }

        [Required]
        public string Nombre { get; set; } = string.Empty;
        public string Descripcion { get; set; } = string.Empty;
        
        // Contacto
        public string Telefono { get; set; } = string.Empty;
        public string Whatsapp { get; set; } = string.Empty; // Direct link
        public string Direccion { get; set; } = string.Empty;

        // Geo (Refactor PostGIS)
        [JsonIgnore]
        [Column(TypeName = "geometry(Point, 4326)")]
        public Point Ubicacion { get; set; }

        [NotMapped]
        public double Latitud
        {
            get => Ubicacion?.Y ?? _tempLat;
            set => _tempLat = value;
        }
        private double _tempLat;

        [NotMapped]
        public double Longitud
        {
            get => Ubicacion?.X ?? _tempLon;
            set => _tempLon = value;
        }
        private double _tempLon;

        // Tags para filtros (Separados por coma: "Alimento,Juguetes,Baño")
        public string Etiquetas { get; set; } = string.Empty; 
        
        // Imagen Principal
        public string? LogoUrl { get; set; }

        // --- SCALABILITY (Monetización Futura) ---
        public int NivelPlan { get; set; } = 0; // 0: Free, 1: Básico, 2: Premium
        public bool EsDestacado { get; set; } = false; // Para aparecer primero o en banners
        public DateTime FechaRegistro { get; set; } = DateTime.Now;

        // Relación con Usuario Dueño
        public int UsuarioId { get; set; }
        [ForeignKey("UsuarioId")]
        public virtual Usuario? Dueño { get; set; }

        // Relación con Catálogo
        public virtual ICollection<ItemCatalogo>? Catalogo { get; set; }
    }
}