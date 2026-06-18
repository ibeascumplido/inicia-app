# Asistente de publicacion - INICIA
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host ""
Write-Host "========================================"
Write-Host "  PUBLICAR INICIA EN VERCEL"
Write-Host "========================================"
Write-Host ""

Write-Host "PASO 1 - MongoDB Atlas"
Write-Host "En Atlas: Database -> Connect -> Conductores (Drivers)"
Write-Host "Copia la URI mongodb+srv://..."
Write-Host ""
$mongo = Read-Host "Pega aqui tu MONGO_URL"

if ($mongo -notmatch "^mongodb") {
    Write-Host "ERROR: La URI debe empezar por mongodb" -ForegroundColor Red
    Read-Host "Pulsa Enter para salir"
    exit 1
}

$dbName = Read-Host "Nombre de la base de datos [menu_facturacion_inicia]"
if ([string]::IsNullOrWhiteSpace($dbName)) {
    $dbName = "menu_facturacion_inicia"
}

$envFile = Join-Path $Root ".env"
"MONGO_URL=$mongo`nDB_NAME=$dbName" | Set-Content -Path $envFile -Encoding UTF8
Write-Host "OK - Guardado en .env" -ForegroundColor Green

Write-Host ""
Write-Host "PASO 2 - Crear usuario administrador"
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Host "ERROR: No se encontro Python. Instala Python desde python.org" -ForegroundColor Red
    Read-Host "Pulsa Enter para salir"
    exit 1
}

pip install motor pymongo python-dotenv -q 2>$null
python (Join-Path $Root "scripts\seed_admin.py")
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al crear admin. Revisa MONGO_URL y Network Access en Atlas (0.0.0.0/0)" -ForegroundColor Red
    Read-Host "Pulsa Enter para salir"
    exit 1
}

Write-Host "OK - Admin: admin@inicia.com / admin123" -ForegroundColor Green

Write-Host ""
Write-Host "PASO 3 - Abrir Vercel en el navegador"
Write-Host ""
Write-Host "Configura en Vercel:"
Write-Host "  Root Directory: VACIO (raiz del repo)"
Write-Host "  Branch: Ultimo"
Write-Host "  MONGO_URL = (la misma URI que pegaste)"
Write-Host "  DB_NAME = $dbName"
Write-Host "  NO anadas REACT_APP_BACKEND_URL"
Write-Host ""

$vercelUrl = "https://vercel.com/new/import?s=https://github.com/ibeascumplido/menu-facturacion-inicia"
Start-Process $vercelUrl

Write-Host "Cuando termine el deploy, abre: https://TU-URL.vercel.app/login"
Write-Host ""
Read-Host "Pulsa Enter para cerrar"
