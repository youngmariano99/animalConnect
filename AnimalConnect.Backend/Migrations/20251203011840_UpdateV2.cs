using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace AnimalConnect.Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Atributos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Tipo = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Atributos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Campanias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Titulo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    FechaHora = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UbicacionLat = table.Column<double>(type: "float", nullable: false),
                    UbicacionLon = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Campanias", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Especies",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Especies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Estados",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Estados", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NombreUsuario = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Rol = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Animales",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Descripcion = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    EdadAproximada = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ImagenUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UbicacionLat = table.Column<double>(type: "float", nullable: true),
                    UbicacionLon = table.Column<double>(type: "float", nullable: true),
                    FechaPublicacion = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TelefonoContacto = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    IdEspecie = table.Column<int>(type: "int", nullable: false),
                    IdEstado = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Animales", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Animales_Especies_IdEspecie",
                        column: x => x.IdEspecie,
                        principalTable: "Especies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Animales_Estados_IdEstado",
                        column: x => x.IdEstado,
                        principalTable: "Estados",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PerfilesAdoptantes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UsuarioId = table.Column<int>(type: "int", nullable: false),
                    TelefonoContacto = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfilesAdoptantes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PerfilesAdoptantes_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AnimalAtributos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    AtributoId = table.Column<int>(type: "int", nullable: false),
                    Valor = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnimalAtributos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnimalAtributos_Animales_AnimalId",
                        column: x => x.AnimalId,
                        principalTable: "Animales",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AnimalAtributos_Atributos_AtributoId",
                        column: x => x.AtributoId,
                        principalTable: "Atributos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PreferenciasAdoptantes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PerfilAdoptanteId = table.Column<int>(type: "int", nullable: false),
                    AtributoId = table.Column<int>(type: "int", nullable: false),
                    ValorPreferido = table.Column<int>(type: "int", nullable: false),
                    Importancia = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PreferenciasAdoptantes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PreferenciasAdoptantes_Atributos_AtributoId",
                        column: x => x.AtributoId,
                        principalTable: "Atributos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PreferenciasAdoptantes_PerfilesAdoptantes_PerfilAdoptanteId",
                        column: x => x.PerfilAdoptanteId,
                        principalTable: "PerfilesAdoptantes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "Atributos",
                columns: new[] { "Id", "Nombre", "Tipo" },
                values: new object[,]
                {
                    { 1, "Nivel de Energía", "Escala" },
                    { 2, "Requiere Patio", "Booleano" },
                    { 3, "Apto con Niños", "Booleano" },
                    { 4, "Apto con Mascotas", "Booleano" },
                    { 5, "Tiempo Requerido", "Escala" },
                    { 6, "Tamaño", "Escala" },
                    { 7, "Nivel Experiencia", "Escala" }
                });

            migrationBuilder.InsertData(
                table: "Especies",
                columns: new[] { "Id", "Nombre" },
                values: new object[,]
                {
                    { 1, "Perro" },
                    { 2, "Gato" }
                });

            migrationBuilder.InsertData(
                table: "Estados",
                columns: new[] { "Id", "Nombre" },
                values: new object[,]
                {
                    { 1, "En Adopción" },
                    { 2, "Perdido" },
                    { 3, "Encontrado" }
                });

            migrationBuilder.InsertData(
                table: "Usuarios",
                columns: new[] { "Id", "NombreUsuario", "PasswordHash", "Rol" },
                values: new object[] { 1, "admin", "admin123", "Administrador" });

            migrationBuilder.InsertData(
                table: "Animales",
                columns: new[] { "Id", "Descripcion", "EdadAproximada", "FechaPublicacion", "IdEspecie", "IdEstado", "ImagenUrl", "Nombre", "TelefonoContacto", "UbicacionLat", "UbicacionLon" },
                values: new object[,]
                {
                    { 1, "Perro guardián, mucha energía.", "2 años", new DateTime(2025, 12, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 1, "http://127.0.0.1:5269/uploads/PerroAdoptar1.png", "Rocky", null, -37.994, -61.353000000000002 },
                    { 2, "Gatita de departamento.", "4 años", new DateTime(2025, 12, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 2, 1, "http://127.0.0.1:5269/uploads/GatoAdoptar1.png", "Mishi", null, -37.996000000000002, -61.354999999999997 },
                    { 3, "Gigante y bonachón, necesita patio.", "3 años", new DateTime(2025, 12, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), 1, 1, "http://127.0.0.1:5269/uploads/PerroAdoptar2.png", "Hulk", null, -37.991, -61.350000000000001 }
                });

            migrationBuilder.InsertData(
                table: "AnimalAtributos",
                columns: new[] { "Id", "AnimalId", "AtributoId", "Valor" },
                values: new object[,]
                {
                    { 1, 1, 1, 3 },
                    { 2, 1, 2, 1 },
                    { 3, 1, 3, 0 },
                    { 4, 1, 4, 1 },
                    { 5, 1, 5, 2 },
                    { 6, 1, 6, 2 },
                    { 7, 1, 7, 2 },
                    { 8, 2, 1, 1 },
                    { 9, 2, 2, 0 },
                    { 10, 2, 3, 1 },
                    { 11, 2, 4, 0 },
                    { 12, 2, 5, 1 },
                    { 13, 2, 6, 1 },
                    { 14, 2, 7, 1 },
                    { 15, 3, 1, 2 },
                    { 16, 3, 2, 1 },
                    { 17, 3, 3, 1 },
                    { 18, 3, 4, 1 },
                    { 19, 3, 5, 2 },
                    { 20, 3, 6, 3 },
                    { 21, 3, 7, 1 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnimalAtributos_AnimalId",
                table: "AnimalAtributos",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_AnimalAtributos_AtributoId",
                table: "AnimalAtributos",
                column: "AtributoId");

            migrationBuilder.CreateIndex(
                name: "IX_Animales_IdEspecie",
                table: "Animales",
                column: "IdEspecie");

            migrationBuilder.CreateIndex(
                name: "IX_Animales_IdEstado",
                table: "Animales",
                column: "IdEstado");

            migrationBuilder.CreateIndex(
                name: "IX_PerfilesAdoptantes_UsuarioId",
                table: "PerfilesAdoptantes",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_PreferenciasAdoptantes_AtributoId",
                table: "PreferenciasAdoptantes",
                column: "AtributoId");

            migrationBuilder.CreateIndex(
                name: "IX_PreferenciasAdoptantes_PerfilAdoptanteId",
                table: "PreferenciasAdoptantes",
                column: "PerfilAdoptanteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnimalAtributos");

            migrationBuilder.DropTable(
                name: "Campanias");

            migrationBuilder.DropTable(
                name: "PreferenciasAdoptantes");

            migrationBuilder.DropTable(
                name: "Animales");

            migrationBuilder.DropTable(
                name: "Atributos");

            migrationBuilder.DropTable(
                name: "PerfilesAdoptantes");

            migrationBuilder.DropTable(
                name: "Especies");

            migrationBuilder.DropTable(
                name: "Estados");

            migrationBuilder.DropTable(
                name: "Usuarios");
        }
    }
}
