using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AnimalConnect.Backend.Models
{
    public class Post
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Titulo { get; set; } = string.Empty;

        [Required]
        public string Contenido { get; set; } = string.Empty;

        public DateTime FechaPublicacion { get; set; } = DateTime.Now;

        // Categoría: "Duda", "Historia", "Aviso"
        public string Categoria { get; set; } = "Duda"; 

        public string? ImagenUrl { get; set; } // Foto opcional (ej: del reencuentro)

        public int UsuarioId { get; set; }
        [ForeignKey("UsuarioId")]
        public virtual Usuario? Usuario { get; set; }

        public virtual ICollection<Comentario>? Comentarios { get; set; }
        public double? Latitud { get; set; }
        public double? Longitud { get; set; }
    }
}