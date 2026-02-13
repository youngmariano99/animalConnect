using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;
using AnimalConnect.Backend.Services;
using Microsoft.AspNetCore.Hosting; 
using System.IO;                    
using System;
using NetTopologySuite.Geometries; // Geo
using NetTopologySuite; // For NtsGeometryServices

namespace AnimalConnect.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnimalesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IPdfService _pdfService;
        private readonly IQrService _qrService;

        public AnimalesController(ApplicationDbContext context, IWebHostEnvironment env, IPdfService pdfService, IQrService qrService) 
        {
            _context = context;
            _env = env;
            _pdfService = pdfService;
            _qrService = qrService;
        }

        // --- 5. CARTEL SE BUSCA (PDF) ---
        [HttpGet("{id}/cartel")]
        public async Task<IActionResult> GetCartel(int id)
        {
            var animal = await _context.Animales.Include(a => a.Especie).FirstOrDefaultAsync(a => a.Id == id);
            if (animal == null) return NotFound();

            // 1. Generar URL pública para el QR
            // Apunta al frontend: http://localhost:5173/alerta/{id}
            // TODO: Usar variable de entorno para el Host del Frontend
            string publicUrl = $"http://localhost:5173/alerta/{id}";

            // 2. Generar QR
            var qrBytes = _qrService.GenerateQrCode(publicUrl);

            // 3. Generar PDF
            var pdfBytes = await _pdfService.GeneratePoster(animal, qrBytes);

            return File(pdfBytes, "application/pdf", $"Cartel_{animal.Nombre}.pdf");
        }

        // --- 6. QR IMAGEN (PNG) ---
        [HttpGet("{id}/qr")]
        public IActionResult GetQr(int id)
        {
            string publicUrl = $"http://localhost:5173/alerta/{id}";
            var qrBytes = _qrService.GenerateQrCode(publicUrl);
            return File(qrBytes, "image/png");
        }

        // --- 7. OBTENER POR ID (Para Alerta Pública y Detalle) ---
        [HttpGet("{id}")]
        public async Task<ActionResult<Animal>> GetAnimal(int id)
        {
            var animal = await _context.Animales
                                       .Include(a => a.Especie)
                                       .Include(a => a.Estado)
                                       .Include(a => a.Vacunas) // Incluir vacunas
                                       .FirstOrDefaultAsync(a => a.Id == id);
                                       
            if (animal == null) return NotFound();
            return Ok(animal);
        }

        // --- 1. OBTENER PÚBLICOS (Solo activos y recientes) ---
        // GET: api/Animales?lat=-37.99&lng=-61.35&radio=50
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Animal>>> GetAnimales([FromQuery] double? lat, [FromQuery] double? lng, [FromQuery] double radio = 50)
        {
            var fechaLimite = DateTime.Now.AddDays(-15);

            // 1. Traemos los activos de la BD (Adopción, Perdido, Encontrado)
            var query = _context.Animales
                                .Include(a => a.Especie)
                                .Include(a => a.Estado)
                                .Include(a => a.Usuario)
                                    .ThenInclude(u => u.Organizaciones)
                                    .ThenInclude(mo => mo.Organizacion)
                                .Where(a => a.FechaUltimaRenovacion >= fechaLimite && 
                                            (a.IdEstado == 1 || a.IdEstado == 2 || a.IdEstado == 3));

            var listaInicial = await query.ToListAsync();

            // 2. Si no hay coordenadas, devolvemos todo (Comportamiento legacy)
            if (lat == null || lng == null)
            {
                return Ok(listaInicial);
            }

            // 3. FILTRO SAAS: Filtrar en memoria usando GeoService
            // Solo devolvemos los que están dentro del radio km
            var filtrados = listaInicial.Where(a => 
                a.UbicacionLat.HasValue && a.UbicacionLon.HasValue &&
                GeoService.CalcularDistanciaKm(lat.Value, lng.Value, a.UbicacionLat.Value, a.UbicacionLon.Value) <= radio
            ).ToList();

            return Ok(filtrados);
        }

        // --- 2. OBTENER MIS PUBLICACIONES (Panel Privado) ---
        [HttpGet("usuario/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<Animal>>> GetMisPublicaciones(int usuarioId)
        {
            var misAnimales = await _context.Animales
                                            .Include(a => a.Especie)
                                            .Include(a => a.Estado)
                                            .Include(a => a.Vacunas) // Ver mis libretas sanitarias
                                            .Where(a => a.UsuarioId == usuarioId)
                                            .OrderByDescending(a => a.FechaUltimaRenovacion)
                                            .ToListAsync();
            return Ok(misAnimales);
        }

        // --- 3. RENOVAR PUBLICACIÓN (Marketplace Logic) ---
        [HttpPut("renovar/{id}")]
        public async Task<IActionResult> RenovarPublicacion(int id)
        {
            var animal = await _context.Animales.FindAsync(id);
            if (animal == null) return NotFound();

            animal.FechaUltimaRenovacion = DateTime.Now;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Publicación renovada por 15 días más." });
        }

        // --- 4. CAMBIAR ESTADO (Finalizar) ---
        [HttpPut("estado/{id}")]
        public async Task<IActionResult> CambiarEstado(int id, [FromBody] int nuevoEstadoId)
        {
            var animal = await _context.Animales.FindAsync(id);
            if (animal == null) return NotFound();

            animal.IdEstado = nuevoEstadoId;
            // Opcional: Al finalizar, podríamos querer que deje de aparecer o se archive.
            // Por ahora solo cambiamos el estado.
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Estado actualizado correctamente." });
        }

        // --- 8. AGREGAR VACUNA (Libreta Sanitaria) ---
        [HttpPost("{id}/vacunas")]
        public async Task<ActionResult<Vacuna>> AddVacuna(int id, [FromBody] Vacuna vacuna)
        {
            var animal = await _context.Animales.FindAsync(id);
            if (animal == null) return NotFound("Animal no encontrado");

            vacuna.AnimalId = id; // Asegurar FK
            _context.Vacunas.Add(vacuna);
            await _context.SaveChangesAsync();

            return Ok(vacuna);
        }

        // --- CREAR (Actualizado con UsuarioId) ---
       [HttpPost]
        public async Task<ActionResult<Animal>> PostAnimal([FromForm] Animal animal)
        {
            try 
            {
                // GEO: Crear Point si vienen coordenadas
                if (animal.UbicacionLat.HasValue && animal.UbicacionLon.HasValue)
                {
                     var geometryFactory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
                     animal.Ubicacion = geometryFactory.CreatePoint(new Coordinate(animal.UbicacionLon.Value, animal.UbicacionLat.Value));
                }

                // A. LÓGICA DE GUARDADO DE IMAGEN
                // Verificamos si llegó una foto válida
                if (animal.Foto != null && animal.Foto.Length > 0)
                {
                    // 1. Ruta: wwwroot/uploads
                    // Usamos _env.WebRootPath para ir a la carpeta correcta en el servidor
                    string uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");

                    // Crear carpeta si no existe
                    if (!Directory.Exists(uploadsFolder))
                        Directory.CreateDirectory(uploadsFolder);

                    // 2. Nombre único para la imagen
                    string uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(animal.Foto.FileName);
                    string filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    // 3. Guardar el archivo en disco
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await animal.Foto.CopyToAsync(stream);
                    }

                    // 4. Crear URL pública para guardarla en la BD
                    // Ejemplo: http://localhost:5269/uploads/foto-abc.jpg
                    string baseUrl = $"{Request.Scheme}://{Request.Host}";
                    animal.ImagenUrl = $"{baseUrl}/uploads/{uniqueFileName}";
                }

                // B. COMPLETAR DATOS FALTANTES
                animal.FechaPublicacion = DateTime.Now;
                animal.FechaUltimaRenovacion = DateTime.Now;

                // C. GUARDAR EN BASE DE DATOS
                _context.Animales.Add(animal);
                await _context.SaveChangesAsync();

                return Ok(animal);
            }
            catch (Exception ex)
            {
                // Si algo falla, devolvemos error 500 con el mensaje para que sepas qué pasó
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }

        // ... (Mantener Delete y Get por ID igual que antes) ...
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAnimal(int id)
        {
            var animal = await _context.Animales.FindAsync(id);
            if (animal == null) return NotFound();
            _context.Animales.Remove(animal);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}