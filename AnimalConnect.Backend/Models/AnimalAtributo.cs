using System.ComponentModel.DataAnnotations.Schema;

namespace AnimalConnect.Backend.Models
{
    public class AnimalAtributo
    {
        public int Id { get; set; }

        public int AnimalId { get; set; }
        [ForeignKey("AnimalId")]
        public virtual Animal? Animal { get; set; }

        public int AtributoId { get; set; }
        [ForeignKey("AtributoId")]
        public virtual Atributo? Atributo { get; set; }

        public int Valor { get; set; } // 0=No/1=Si para booleanos, o 1-5 para escalas
    }
}