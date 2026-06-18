# Asistente de publicación — ejecuta esto y sigue las preguntas
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PUBLICAR INICIA EN VERCEL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# --- Paso 1: MongoDB ---
Write-Host "PASO 1 — MongoDB Atlas" -ForegroundColor Yellow
Write-Host "En Atlas: Database -> Connect -> Drivers"
Write-Host "Copia la URI mongodb+srv://..."
Write-Host ""
$mongo = Read-Host "Pega aqui tu MONGO_URL (mongodb+srv://...)"

if ($mongo -notmatch "^mongodb") {
    Write-Host "ERROR: La URI debe empezar por mongodb+srv://" -ForegroundColor Red
    exit 1
}

$dbName = Read-Host "Nombre de la base de datos [menu_facturacion_inicia]"
if ([string]::IsNullOrWhiteSpace($dbName)) { $dbName = "menu_facturacion_inicia" }

$envContent = @"
MONGO_URL=$mongo
DB_NAME=$dbName
"@

$envContent | Out-File -FilePath (Join-Path $Root ".env") -Encoding utf8 -NoNewline
Write-Host "OK — Guardado en .env" -ForegroundColor Green

# --- Paso 2: Crear admin ---
Write-Host ""
Write-Host "PASO 2 — Crear usuario administrador" -ForegroundColor Yellow
python (Join-Path $Root "scripts\seed_admin.py")
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "Si fallo Python, instala dependencias:" -ForegroundColor Yellow
    Write-Host "  pip install motor pymongo python-dotenv"
    Write-Host "Luego vuelve a ejecutar: .\scripts\publicar.ps1"
    exit 1
}
Write-Host "OK — Admin: admin@inicia.com / admin123" -ForegroundColor Green

# --- Paso 3: Abrir Vercel ---
Write-Host ""
Write-Host "PASO 3 — Vercel (en el navegador)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Se abrira Vercel. Configura ASI:" -ForegroundColor White
Write-Host "  - Root Directory: DEJAR VACIO (raiz del repo)" -ForegroundColor White
Write-Host "  - Branch: Ultimo" -ForegroundColor White
Write-Host "  - Variables de entorno (copiar y pegar):" -ForegroundColor White
Write-Host ""
Write-Host "    MONGO_URL = $mongo" -ForegroundColor Gray
Write-Host "    DB_NAME   = $dbName" -ForegroundColor Gray
Write-Host ""
Write-Host "  - NO anadas REACT_APP_BACKEND_URL" -ForegroundColor White
Write-Host "  - Pulsa Deploy" -ForegroundColor White
Write-Host ""

$vercelUrl = "https://vercel.com/new/import?s=https://github.com/ibeascumplido/menu-facturacion-inicia&project-name=menu-facturacion-inicia"
Start-Process $vercelUrl

Write-Host "Cuando termine el deploy, abre:" -ForegroundColor Cyan
Write-Host "  https://TU-URL.vercel.app/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pega aqui la URL de Vercel cuando la tengas y la revisamos." -ForegroundColor Cyan
Write-Host ""
