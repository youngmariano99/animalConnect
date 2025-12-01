using Microsoft.AspNetCore.Mvc;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ArchivosController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        // Inyectamos IWebHostEnvironment para saber dónde está la carpeta wwwroot en el disco
        public ArchivosController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost("subir")]
        public async Task<IActionResult> SubirImagen(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No se ha enviado ningún archivo.");
            }

            // 1. Generar un nombre único para evitar que se pisen archivos (Ej: guid_perro.jpg)
            var nombreArchivo = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            
            // 2. Definir la ruta física donde se guardará
            var rutaCarpeta = Path.Combine(_env.WebRootPath, "uploads");
            
            // Asegurarnos de que la carpeta exista
            if (!Directory.Exists(rutaCarpeta))
            {
                Directory.CreateDirectory(rutaCarpeta);
            }

            var rutaCompleta = Path.Combine(rutaCarpeta, nombreArchivo);

            // 3. Guardar el archivo en el disco
            using (var stream = new FileStream(rutaCompleta, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // 4. Devolver la URL pública para acceder a la imagen
            // La URL será: https://tuservidor/uploads/nombreArchivo.jpg
            var urlImagen = $"{Request.Scheme}://{Request.Host}/uploads/{nombreArchivo}";

            return Ok(new { url = urlImagen });
        }
    }
}