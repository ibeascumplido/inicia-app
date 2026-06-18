# Asistente de publicacion - INICIA
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host ""
Write-Host "========================================"
Write-Host "  PUBLICAR INICIA EN VERCEL"
Write-Host "========================================"
Write-Host ""

Write-Host "PASO 1 - MongoDB Atlas"
Write-Host "En Atlas: Database Access -> copia el NOMBRE DE USUARIO (sin espacios)"
Write-Host "Ejemplo URI: mongodb+srv://mi_usuario:mi_password@cluster0.xxxxx.mongodb.net/"
Write-Host ""
$mongo = Read-Host "Pega aqui tu MONGO_URL"

if ($mongo -notmatch "^mongodb") {
    Write-Host "ERROR: La URI debe empezar por mongodb" -ForegroundColor Red
    Read-Host "Pulsa Enter para salir"
    exit 1
}

if ($mongo -match "[<>]" -or $mongo -match "\s") {
    Write-Host ""
    Write-Host "AVISO: La URI no debe tener espacios ni < >" -ForegroundColor Yellow
    Write-Host "Usa el usuario de Atlas (ej: daniel_admin), no tu nombre con espacios." -ForegroundColor Yellow
    Write-Host ""
}

$dbName = Read-Host "Nombre de la base de datos [menu_facturacion_inicia]"
if ([string]::IsNullOrWhiteSpace($dbName)) {
    $dbName = "menu_facturacion_inicia"
}

$envFile = Join-Path $Root ".env"
"MONGO_URL=$mongo`nDB_NAME=$dbName" | Set-Content -Path $envFile -Encoding UTF8
Write-Host "OK - Guardado en .env" -ForegroundColor Green

Write-Host ""
Write-Host "PASO 2 - Crear admin (opcional, puedes saltarlo)"
cmd /c "python -m pip install motor pymongo python-dotenv -q >nul 2>&1"
cmd /c "python `"$Root\scripts\seed_admin.py`""
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Admin: admin@inicia.com / admin123" -ForegroundColor Green
} else {
    Write-Host "AVISO: Admin no creado ahora. Continua con Vercel igualmente." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "PASO 3 - Abrir Vercel"
Write-Host ""
Write-Host "En Vercel configura:"
Write-Host "  Root Directory: VACIO"
Write-Host "  Branch: Ultimo"
Write-Host "  MONGO_URL = (la URI corregida, sin espacios en el usuario)"
Write-Host "  DB_NAME = $dbName"
Write-Host ""

Start-Process "https://vercel.com/new/import?s=https://github.com/ibeascumplido/menu-facturacion-inicia"

Write-Host "Deploy en Vercel -> luego abre: https://TU-URL.vercel.app/login"
Read-Host "Pulsa Enter para cerrar"
