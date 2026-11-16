$ErrorActionPreference = "Stop"

$root = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..\..")
$url = "http://127.0.0.1:5124/graphql"
$logPath = Join-Path $PSScriptRoot "populate-profile-demo-data.log"
$errPath = Join-Path $PSScriptRoot "populate-profile-demo-data.err.log"
$projectPath = Join-Path $root "API Graphql/OneITB/GraphQL.csproj"
$quotedProjectPath = '"' + $projectPath + '"'

Remove-Item -LiteralPath $logPath, $errPath -Force -ErrorAction SilentlyContinue

function Invoke-GraphQL {
    param(
        [string]$Query,
        [hashtable]$Variables = @{},
        [string]$Token = ""
    )

    $headers = @{}
    if (-not [string]::IsNullOrWhiteSpace($Token)) {
        $headers.Authorization = "Bearer $Token"
    }

    $body = @{ query = $Query; variables = $Variables } | ConvertTo-Json -Depth 100
    $response = Invoke-RestMethod -Method Post -Uri $url -ContentType "application/json" -Headers $headers -Body $body
    if ($response.errors) {
        throw ($response.errors | ConvertTo-Json -Compress)
    }
    return $response.data
}

function New-Slug {
    param([string]$Value)
    return ($Value.ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-')
}

function New-ProfileDefaults {
    param(
        [object]$User,
        [int]$Index
    )

    $fullName = "$($User.firstName) $($User.lastName)".Trim()
    $slug = New-Slug $fullName
    $phoneSuffix = (1000 + $Index).ToString()
    $role = $User.role

    switch ($role) {
        "Administrador" {
            $headline = "Gestion academica, gobierno de plataforma y mejora de procesos institucionales."
            $company = "Instituto Tecnico Beltran"
            $position = "Coordinacion academica y tecnologica"
            $project = "Normalizacion de procesos academicos"
            $skills = @("Gestion academica", "Moderacion institucional", "Analisis de datos", "Mejora continua")
        }
        "Profesor" {
            $headline = "Docente orientado a acompanamiento academico, evaluacion continua y proyectos aplicados."
            $company = "Instituto Tecnico Beltran"
            $position = "Docente de carrera tecnica"
            $project = "Materiales de cursada y evaluacion integradora"
            $skills = @("Didactica", "Planificacion de clases", "Evaluacion", "Acompanamiento estudiantil")
        }
        "Moderador" {
            $headline = "Referente de convivencia digital, seguridad comunitaria y seguimiento de reportes."
            $company = "Comunidad OneITB"
            $position = "Moderacion de comunidad academica"
            $project = "Protocolo de convivencia y reportes"
            $skills = @("Resolucion de conflictos", "Comunicacion", "Revision de contenido", "Trazabilidad")
        }
        "Empleador" {
            $headline = "Vinculacion entre estudiantes, egresados y oportunidades profesionales del sector."
            $company = "Red de empleadores ITB"
            $position = "Vinculacion profesional"
            $project = "Busqueda de perfiles tecnicos junior"
            $skills = @("Seleccion de talento", "Vinculacion institucional", "Entrevistas", "Networking")
        }
        default {
            $headline = "Estudiante tecnico con interes en proyectos colaborativos, aprendizaje aplicado y desarrollo profesional."
            $company = "Proyecto academico OneITB"
            $position = "Participante academico"
            $project = "Portfolio academico y seguimiento de cursada"
            $skills = @("Trabajo en equipo", "Comunicacion", "Resolucion de problemas", "Aprendizaje continuo")
        }
    }

    $cv = @{
        experience = @(
            @{
                id = "exp-demo-1"
                company = $company
                role = $position
                startDate = "2025-03"
                endDate = "Presente"
                location = "Buenos Aires, Argentina"
                description = "Participacion activa en actividades academicas, seguimiento de objetivos y colaboracion con la comunidad institucional."
                hidden = $false
            }
        )
        education = @(
            @{
                id = "edu-demo-1"
                institution = "Instituto Tecnico Beltran"
                degree = "Trayectoria academica vinculada a OneITB"
                startDate = "2024-03"
                endDate = "Presente"
                location = "Buenos Aires, Argentina"
                description = "Formacion orientada a competencias tecnicas, proyectos integradores y participacion comunitaria."
                hidden = $false
            }
        )
        projects = @(
            @{
                id = "proj-demo-1"
                name = $project
                role = "Participacion principal"
                startDate = "2026-03"
                endDate = "Presente"
                url = "oneitb.local/$slug"
                description = "Proyecto de referencia para mostrar experiencia, intereses y aportes dentro de la plataforma."
                hidden = $false
            }
        )
        skills = @($skills | ForEach-Object {
            @{ id = "skill-" + (New-Slug $_); name = $_; hidden = $false }
        })
        languages = @(
            @{ id = "lang-es"; name = "Espanol"; level = "Nativo"; hidden = $false },
            @{ id = "lang-en"; name = "Ingles"; level = "Intermedio"; hidden = $false }
        )
    }

    return @{
        biography = $headline
        linkedIn = "https://linkedin.com/in/$slug"
        facebook = "https://facebook.com/$slug"
        instagram = "https://instagram.com/$slug"
        phone = "+54 11 5555-$phoneSuffix"
        cvDataJson = ($cv | ConvertTo-Json -Depth 100 -Compress)
    }
}

$process = $null
try {
    $process = Start-Process -FilePath "dotnet" `
        -ArgumentList @(
            "run",
            "--configuration", "Release",
            "--no-build",
            "--project", $quotedProjectPath,
            "--urls", "http://127.0.0.1:5124"
        ) `
        -WorkingDirectory $root `
        -RedirectStandardOutput $logPath `
        -RedirectStandardError $errPath `
        -PassThru `
        -WindowStyle Hidden

    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        Start-Sleep -Seconds 1
        if ($process.HasExited) {
            throw "Backend exited before GraphQL became ready."
        }

        try {
            $smoke = Invoke-GraphQL -Query "query { __typename }"
            if ($smoke.__typename -eq "Query") {
                $ready = $true
                break
            }
        } catch {
            Start-Sleep -Milliseconds 250
        }
    }
    if (-not $ready) {
        throw "GraphQL did not become ready at $url"
    }

    $loginQuery = @"
mutation Login(`$input: LoginInput!) {
  login(input: `$input) {
    token
    role
    isAuthenticated
  }
}
"@
    $login = Invoke-GraphQL -Query $loginQuery -Variables @{
        input = @{ email = "admin@itbeltran.com.ar"; password = "Test1234!" }
    }
    $token = $login.login.token
    if (-not $token -or $login.login.role -ne "Administrador") {
        throw "Admin login failed."
    }

    $usersQuery = @"
query Users {
  users {
    id
    firstName
    lastName
    email
    role
  }
}
"@
    $usersData = Invoke-GraphQL -Query $usersQuery -Token $token
    $users = @($usersData.users)
    if ($users.Count -eq 0) {
        throw "No users returned by admin query."
    }

    $updateQuery = @"
mutation UpdateProfile(`$input: UpdateProfileInput!) {
  updateProfile(input: `$input) {
    id
    success
    message
  }
}
"@

    $updated = 0
    for ($i = 0; $i -lt $users.Count; $i++) {
        $user = $users[$i]
        $defaults = New-ProfileDefaults -User $user -Index ($i + 1)
        $result = Invoke-GraphQL -Query $updateQuery -Token $token -Variables @{
            input = @{
                id = $user.id
                biography = $defaults.biography
                linkedIn = $defaults.linkedIn
                facebook = $defaults.facebook
                instagram = $defaults.instagram
                phone = $defaults.phone
                cvDataJson = $defaults.cvDataJson
            }
        }
        if (-not $result.updateProfile.success) {
            throw "UpdateProfile failed for $($user.email): $($result.updateProfile.message)"
        }
        $updated++
    }

    Write-Output "PASS populated profile demo data for $updated users."
} finally {
    if ($process -and -not $process.HasExited) {
        Stop-Process -Id $process.Id -Force
    }
}
