using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnimalConnect.Backend.Models
{
    public class HogarTransitorio
    {
        public int Id { get; set; }

        // Vinculado a un usuario (Ciudadano)
        public int UsuarioId { get; set; }
        [ForeignKey("UsuarioId")]
        public virtual Usuario? Usuario { get; set; }

        // --- Datos Físicos del Hogar ---
        [Required]
        public string DireccionAproximada { get; set; } = string.Empty; // "Barrio Norte, Pringles"
        public double Latitud { get; set; }
        public double Longitud { get; set; }

        public string TipoVivienda { get; set; } = "Casa"; // Casa, Depto, PH
        public bool TienePatioCerrado { get; set; }
        public bool TieneOtrasMascotas { get; set; }
        public bool TieneNinos { get; set; }

        // --- Disponibilidad ---
        // 1: Baja (<2hs), 2: Media, 3: Alta (Dedicación total)
        public int DisponibilidadHoraria { get; set; } 
        
        // "¿Cuánto tiempo podés tenerlo?"
        public string TiempoCompromiso { get; set; } = "Indefinido"; // "15 días", "Hasta adopción"

        // Capacidad técnica (Sabe dar remedios, inyectar, etc)
        public bool AceptaCuidadosEspeciales { get; set; }

        // --- Estado del Hogar ---
        // "Activo" (Busca animal), "Ocupado" (Ya tiene tránsito), "Pausa" (No molestar)
        public string Estado { get; set; } = "Activo";
        
        public DateTime FechaAlta { get; set; } = DateTime.Now;
        public DateTime UltimaActualizacion { get; set; } = DateTime.Now; // Para el "Check-in" periódico
    }
}