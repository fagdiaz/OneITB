using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using OneItb.Data;

#nullable disable

namespace Data.Migrations
{
    [DbContext(typeof(OneItbContext))]
    [Migration("20260615211900_SeedCareersAndSocialGraphData")]
    public partial class SeedCareersAndSocialGraphData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DECLARE @Careers TABLE ([Name] nvarchar(150) NOT NULL);
                INSERT INTO @Careers ([Name])
                VALUES
                    (N'Analisis de Sistemas'),
                    (N'Diseno Industrial'),
                    (N'Enfermeria'),
                    (N'Radiologia'),
                    (N'Higiene Seguridad y Ambiente Laboral'),
                    (N'Comunicacion Multimedial'),
                    (N'Administracion Contable'),
                    (N'Administracion de PyMES'),
                    (N'Ciencia de Datos e Inteligencia Artificial');

                INSERT INTO [dbo].[Careers] ([Name], [IsActive], [CreationDate], [CreationUser], [ModificationDate], [ModificationUser], [Disabled])
                SELECT c.[Name], CAST(1 AS bit), SYSUTCDATETIME(), N'seed', SYSUTCDATETIME(), N'seed', CAST(0 AS bit)
                FROM @Careers c
                WHERE NOT EXISTS (
                    SELECT 1 FROM [dbo].[Careers] existing WHERE existing.[Name] = c.[Name]
                );
                """);

            migrationBuilder.Sql("""
                DECLARE @SubjectCareerSeeds TABLE ([SubjectCode] varchar(10) NOT NULL, [CareerName] nvarchar(150) NOT NULL);
                INSERT INTO @SubjectCareerSeeds ([SubjectCode], [CareerName])
                VALUES
                    ('PROG1', N'Analisis de Sistemas'),
                    ('BDD', N'Analisis de Sistemas'),
                    ('ADS', N'Analisis de Sistemas'),
                    ('REDES', N'Analisis de Sistemas'),
                    ('MAT', N'Analisis de Sistemas'),
                    ('MAT', N'Ciencia de Datos e Inteligencia Artificial'),
                    ('BDD', N'Ciencia de Datos e Inteligencia Artificial'),
                    ('ADS', N'Administracion de PyMES'),
                    ('MAT', N'Administracion Contable'),
                    ('PROG1', N'Comunicacion Multimedial');

                INSERT INTO [dbo].[SubjectCareers] ([SubjectId], [CareerId])
                SELECT s.[Id], c.[Id]
                FROM @SubjectCareerSeeds seed
                INNER JOIN [dbo].[Subjects] s ON s.[Code] = seed.[SubjectCode]
                INNER JOIN [dbo].[Careers] c ON c.[Name] = seed.[CareerName]
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM [dbo].[SubjectCareers] existing
                    WHERE existing.[SubjectId] = s.[Id] AND existing.[CareerId] = c.[Id]
                );
                """);

            migrationBuilder.Sql("""
                DECLARE @UserCareerSeeds TABLE ([Email] nvarchar(150) NOT NULL, [CareerName] nvarchar(150) NOT NULL);
                INSERT INTO @UserCareerSeeds ([Email], [CareerName])
                VALUES
                    (N'admin@itbeltran.com.ar', N'Analisis de Sistemas'),
                    (N'student@itbeltran.com.ar', N'Analisis de Sistemas'),
                    (N'student@itbeltran.com.ar', N'Ciencia de Datos e Inteligencia Artificial'),
                    (N'teacher@itbeltran.com.ar', N'Analisis de Sistemas'),
                    (N'moderator@itbeltran.com.ar', N'Comunicacion Multimedial'),
                    (N'employer@itbeltran.com.ar', N'Administracion de PyMES'),
                    (N'camila.torres@itbeltran.com.ar', N'Diseno Industrial'),
                    (N'tomas.gimenez@itbeltran.com.ar', N'Higiene Seguridad y Ambiente Laboral'),
                    (N'paula.arias@itbeltran.com.ar', N'Ciencia de Datos e Inteligencia Artificial'),
                    (N'diego.molina@itbeltran.com.ar', N'Administracion Contable'),
                    (N'julieta.castro@itbeltran.com.ar', N'Enfermeria');

                INSERT INTO [dbo].[UserCareers] ([UserId], [CareerId])
                SELECT u.[Id], c.[Id]
                FROM @UserCareerSeeds seed
                INNER JOIN [dbo].[Accounts] a ON a.[Email] = seed.[Email]
                INNER JOIN [dbo].[Users] u ON u.[Id] = a.[Id]
                INNER JOIN [dbo].[Careers] c ON c.[Name] = seed.[CareerName]
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM [dbo].[UserCareers] existing
                    WHERE existing.[UserId] = u.[Id] AND existing.[CareerId] = c.[Id]
                );
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DELETE FROM [dbo].[UserCareers];
                DELETE FROM [dbo].[SubjectCareers];
                DELETE FROM [dbo].[Careers]
                WHERE [Name] IN (
                    N'Analisis de Sistemas',
                    N'Diseno Industrial',
                    N'Enfermeria',
                    N'Radiologia',
                    N'Higiene Seguridad y Ambiente Laboral',
                    N'Comunicacion Multimedial',
                    N'Administracion Contable',
                    N'Administracion de PyMES',
                    N'Ciencia de Datos e Inteligencia Artificial'
                );
                """);
        }
    }
}
