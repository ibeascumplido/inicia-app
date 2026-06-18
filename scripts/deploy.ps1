# Despliegue en Vercel (monorepo)
#
# Uso:
#   1. Copia env.example a .env y rellena MONGO_URL
#   2. Ejecuta: .\scripts\deploy.ps1
#
# Requiere (se instalan solos si faltan):
#   - Node portable en .tools/node (el script lo descarga)
#   - Git (GitHub Desktop en este PC)
#   - VERCEL_TOKEN en .env o variable de entorno

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Get-Git {
    $candidates = @(
        "C:\Program Files\Git\bin\git.exe",
        "$env:LOCALAPPDATA\GitHubDesktop\app-*\resources\app\git\cmd\git.exe"
    )
    foreach ($pattern in $candidates) {
        $found = Get-Item $pattern -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) { return $found.FullName }
    }
    throw "No se encontró git.exe. Instala GitHub Desktop o Git for Windows."
}

function Ensure-Node {
    $nodeDir = Join-Path $Root ".tools\node"
    $nodeExe = Join-Path $nodeDir "node.exe"
    if (-not (Test-Path $nodeExe)) {
        Write-Host "Descargando Node portable..."
        New-Item -ItemType Directory -Force -Path (Join-Path $Root ".tools") | Out-Null
        $zip = Join-Path $Root ".tools\node.zip"
        Invoke-WebRequest -Uri "https://nodejs.org/dist/v20.19.2/node-v20.19.2-win-x64.zip" -OutFile $zip
        Expand-Archive -Path $zip -DestinationPath (Join-Path $Root ".tools") -Force
        Rename-Item (Join-Path $Root ".tools\node-v20.19.2-win-x64") $nodeDir -Force
    }
    $env:PATH = "$nodeDir;$env:PATH"
}

if (Test-Path (Join-Path $Root ".env")) {
    Get-Content (Join-Path $Root ".env") | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
        }
    }
}

if (-not $env:VERCEL_TOKEN) {
    Write-Host ""
    Write-Host "FALTA VERCEL_TOKEN" -ForegroundColor Yellow
    Write-Host "1. Entra en https://vercel.com/account/tokens"
    Write-Host "2. Crea un token y añádelo a .env:"
    Write-Host "   VERCEL_TOKEN=tu_token_aqui"
    Write-Host ""
    exit 1
}

if (-not $env:MONGO_URL) {
    Write-Host ""
    Write-Host "FALTA MONGO_URL" -ForegroundColor Yellow
    Write-Host "Copia env.example a .env y rellena MONGO_URL (desde Emergent o MongoDB Atlas)"
    Write-Host ""
    exit 1
}

Ensure-Node
$git = Get-Git

Write-Host "Subiendo código a GitHub..."
& $git add -A
& $git commit -m "Deploy: configuración Vercel monorepo" 2>$null
& $git push origin HEAD

Write-Host "Desplegando en Vercel..."
npx --yes vercel@latest deploy --prod --yes --token $env:VERCEL_TOKEN

Write-Host ""
Write-Host "Sembrando usuario admin en MongoDB..."
python (Join-Path $Root "scripts\seed_admin.py")

Write-Host ""
Write-Host "Listo. Abre la URL que muestra Vercel arriba." -ForegroundColor Green
