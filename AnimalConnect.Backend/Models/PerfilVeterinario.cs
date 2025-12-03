using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnimalConnect.Backend.Models
{
    public class PerfilVeterinario
    {
        [Key]
        public int Id { get; set; }

        // --- RELACIÓN CON USUARIO ---
        public int UsuarioId { get; set; }
        [ForeignKey("UsuarioId")]
        public virtual Usuario? Usuario { get; set; }

        // --- DATOS PROFESIONALES ---
        [Required]
        [MaxLength(100)]
        public string NombreVeterinaria { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string MatriculaProfesional { get; set; } = string.Empty;

        // --- CONTACTO Y UBICACIÓN ---
        public string Direccion { get; set; } = string.Empty;
        public string TelefonoProfesional { get; set; } = string.Empty;
        
        // Coordenadas para el mapa (Double para Leaflet)
        public double Latitud { get; set; }
        public double Longitud { get; set; }

        public string HorariosAtencion { get; set; } = string.Empty;

        // --- LOGICA DE NEGOCIO ---
        
        // Estado: "Pendiente", "Aprobado", "Rechazado"
        public string EstadoVerificacion { get; set; } = "Pendiente"; 

        // Para la funcionalidad "Farmacia de Turno"
        public bool EsDeTurno { get; set; } = false;

        // Descripción o especialidades (ej: "Emergencias 24hs", "Exóticos")
        [MaxLength(500)]
        public string? Biografia { get; set; }
        public string? LogoUrl { get; set; }
    }
}