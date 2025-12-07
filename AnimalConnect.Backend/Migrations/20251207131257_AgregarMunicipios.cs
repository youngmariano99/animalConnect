using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnimalConnect.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AgregarMunicipios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PerfilesMunicipios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    NombreMunicipio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Provincia = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LatitudCentro = table.Column<double>(type: "float", nullable: false),
                    LongitudCentro = table.Column<double>(type: "float", nullable: false),
                    RadioCoberturaKm = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfilesMunicipios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PerfilesMunicipios_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PerfilesMunicipios_UsuarioId",
                table: "PerfilesMunicipios",
                column: "UsuarioId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PerfilesMunicipios");
        }
    }
}
