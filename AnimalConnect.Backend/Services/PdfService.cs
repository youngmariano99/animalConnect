using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using AnimalConnect.Backend.Models;
using System.Net.Http;
using System.Threading.Tasks;

namespace AnimalConnect.Backend.Services
{
    public interface IPdfService
    {
        Task<byte[]> GeneratePoster(Animal animal, byte[] qrImage);
    }

    public class PdfService : IPdfService
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public PdfService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<byte[]> GeneratePoster(Animal animal, byte[] qrImage)
        {
            // Descargar imagen de la mascota si existe
            byte[]? petImageBytes = null;
            if (!string.IsNullOrEmpty(animal.ImagenUrl))
            {
                try 
                {
                    var client = _httpClientFactory.CreateClient();
                    petImageBytes = await client.GetByteArrayAsync(animal.ImagenUrl);
                }
                catch { /* Fallback si falla descarga */ }
            }

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(20).FontFamily("Arial"));

                    page.Header()
                        .Text("¡SE BUSCA!")
                        .SemiBold().FontSize(60).FontColor(Colors.Red.Medium).AlignCenter();

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(x =>
                        {
                            x.Spacing(20);

                            // FOTO
                            if (petImageBytes != null)
                            {
                                x.Item().Height(10, Unit.Centimetre).AlignCenter().Image(petImageBytes).FitArea();
                            }
                            else
                            {
                                x.Item().Height(5, Unit.Centimetre).AlignCenter().Text("[Sin Foto]").FontSize(20).FontColor(Colors.Grey.Medium);
                            }

                            // NOMBRE
                            x.Item().AlignCenter().Text(animal.Nombre).FontSize(48).Bold();

                            // DESCRIPCION
                            x.Item().AlignCenter().Text(animal.Descripcion).FontSize(24);

                            // DETALLES
                            x.Item().PaddingTop(1, Unit.Centimetre).Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn();
                                    columns.RelativeColumn();
                                });

                                table.Cell().Text($"Raza/Especie: {animal.Especie?.Nombre ?? "Desconocida"}").FontSize(20);
                                table.Cell().Text($"Zona: Pringles").FontSize(20);
                            });

                             // CONTACTO
                            x.Item().PaddingTop(1, Unit.Centimetre).AlignCenter()
                                .Background(Colors.Yellow.Medium) 
                                .Padding(10)
                                .Text($"TEL: {animal.TelefonoContacto ?? "N/A"}")
                                .FontSize(40).Bold();
                        });

                    page.Footer()
                        .AlignCenter()
                        .Row(row =>
                        {
                            row.RelativeItem().Column(col => 
                            {
                                col.Item().Text("Escaneá para ver el perfil y ayudar:").FontSize(16);
                                col.Item().Text("AnimalConnect Pringles").FontSize(12).FontColor(Colors.Grey.Medium);
                            });
                            
                            row.AutoItem().Width(4, Unit.Centimetre).Image(qrImage);
                        });
                });
            });

            return document.GeneratePdf();
        }
    }
}
