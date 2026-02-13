using QRCoder;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace AnimalConnect.Backend.Services
{
    public interface IQrService
    {
        byte[] GenerateQrCode(string url);
    }

    public class QrService : IQrService
    {
        public byte[] GenerateQrCode(string url)
        {
            using (QRCodeGenerator qrGenerator = new QRCodeGenerator())
            {
                QRCodeData qrCodeData = qrGenerator.CreateQrCode(url, QRCodeGenerator.ECCLevel.Q);
                using (PngByteQRCode qrCode = new PngByteQRCode(qrCodeData))
                {
                    return qrCode.GetGraphic(20);
                }
            }
        }
    }
}
