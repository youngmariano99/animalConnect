using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;
using System.Text.Json.Serialization;

namespace AnimalConnect.Backend.Models
{
    public class Clinica
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Nombre { get; set; } = string.Empty;

        public string Direccion { get; set; } = string.Empty;
        public string Telefono { get; set; } = string.Empty;
        public string? LogoUrl { get; set; }

        // --- SAAS GEOGRÁFICO (Refactor PostGIS) ---
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

        // --- LÓGICA DE NEGOCIO ---
        public bool EsDeTurno { get; set; } = false;
        
        // [NUEVO] Para controlar la expiración de 24hs
        public DateTime? FechaInicioTurno { get; set; } 

        public string HorariosEstructurados { get; set; } = string.Empty;

        public int PerfilVeterinarioId { get; set; }
        [ForeignKey("PerfilVeterinarioId")]
        public virtual PerfilVeterinario? Dueño { get; set; }

        public virtual ICollection<HorarioClinica>? Horarios { get; set; }
    }
}