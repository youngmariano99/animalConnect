using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AnimalConnect.Backend.Data;
using AnimalConnect.Backend.Models;

namespace AnimalConnect.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VeterinariasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public VeterinariasController(ApplicationDbContext context)
        {
            _context = context;
        }

        // --- 1. GET PÚBLICO: Obtener veterinarias aprobadas para el mapa ---
        [HttpGet]
        public async Task<ActionResult> GetVeterinarias()
        {
            var veterinarias = await _context.PerfilesVeterinarios
                .Include(v => v.Usuario) // Para tener acceso a datos de usuario si hace falta
                .Where(v => v.EstadoVerificacion == "Aprobado")
                .Select(v => new
                {
                    v.Id,
                    v.NombreVeterinaria,
                    v.Direccion,
                    v.TelefonoProfesional,
                    v.HorariosAtencion,
                    v.Biografia, // <--- NUEVO
                    v.LogoUrl,   // <--- NUEVO
                    v.Latitud,
                    v.Longitud,
                    v.EsDeTurno,
                    v.MatriculaProfesional
                })
                .ToListAsync();

            return Ok(veterinarias);
        }

        // --- 2. ADMIN: Establecer veterinaria de turno ---
        // PUT: api/Veterinarias/turno/5
        // Este endpoint desmarca a todas y marca solo a la elegida (Lógica "Radio Button")
        [HttpPut("turno/{id}")]
        public async Task<IActionResult> SetTurno(int id)
        {
            var todas = await _context.PerfilesVeterinarios.ToListAsync();
            var seleccionada = todas.FirstOrDefault(v => v.Id == id);

            if (seleccionada == null) return NotFound("Veterinaria no encontrada.");

            // LÓGICA TOGGLE:
            // Si la seleccionada YA estaba de turno, la apagamos (nadie queda de turno).
            if (seleccionada.EsDeTurno)
            {
                seleccionada.EsDeTurno = false;
                await _context.SaveChangesAsync();
                return Ok(new { message = $"Se ha desactivado el turno de {seleccionada.NombreVeterinaria}." });
            }

            // Si NO estaba de turno, apagamos a todas las demás y la encendemos a ella.
            foreach (var v in todas) v.EsDeTurno = false;
            
            seleccionada.EsDeTurno = true;
            await _context.SaveChangesAsync();
            
            return Ok(new { message = $"Ahora {seleccionada.NombreVeterinaria} está de turno." });
        }
    }
}