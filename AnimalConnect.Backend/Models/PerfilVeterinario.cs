using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnimalConnect.Backend.Models
{
    public class PerfilVeterinario
    {
        [Key]
        public int Id { get; set; }

        public int UsuarioId { get; set; }
        [ForeignKey("UsuarioId")]
        public virtual Usuario? Usuario { get; set; }

        // --- DATOS DEL PROFESIONAL (PERSONA) ---
        [Required]
        [MaxLength(50)]
        public string MatriculaProfesional { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Biografia { get; set; } // "Especialista en cirugía..."
        
        public string? FotoPerfilUrl { get; set; } // Su cara (opcional)

        // Estado: "Pendiente", "Aprobado" (Esto valida a la PERSONA)
        public string EstadoVerificacion { get; set; } = "Pendiente"; 

        // Relación: Un veterinario puede administrar muchas clínicas (o ninguna)
        public virtual ICollection<Clinica>? Clinicas { get; set; }
    }
}