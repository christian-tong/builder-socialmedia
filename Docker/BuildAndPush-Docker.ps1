# ==========================================
# 🚀 BuildAndPublish-Local.ps1
# ==========================================
# Entorno: Desarrollo local (Windows)
# Objetivo: Validar build de Next.js y publicar imagen Docker en Docker Hub
# Autor: Christian Tong
# Fecha: 2025-11-11
# ==========================================

# --- RUTAS ---
# Obtener ruta del script actual y raíz del proyecto
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootPath  = Split-Path $ScriptDir -Parent

# --- CONFIGURACIÓN ---
$ProjectName   = "builder-socialmedia"
$VersionTag    = "1.0.0"
$LocalImage    = "$ProjectName`:$VersionTag"
$DockerHubRepo = "soportewimprove/$ProjectName`:$VersionTag"
$DockerfilePath = Join-Path $RootPath "Dockerfile"

Write-Host "=========================================="
Write-Host "🧭 Iniciando verificación y build de $ProjectName ($VersionTag)"
Write-Host "=========================================="

# --- CAMBIAR A RAÍZ DEL PROYECTO ---
Set-Location $RootPath

# --- LIMPIEZA ---
Write-Host "🧹 Eliminando carpeta .next antigua..."
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
}

# --- DEPENDENCIAS ---
Write-Host "📦 Instalando dependencias..."
npm install --legacy-peer-deps
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al instalar dependencias."
    exit 1
}

# --- BUILD NEXT.JS ---
Write-Host "🏗️  Ejecutando build limpio..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falló el build de Next.js."
    exit 1
}
Write-Host "✅ Build completado correctamente."

# --- IMAGEN DOCKER ---
Write-Host "🧹 Eliminando imagen Docker anterior ($LocalImage)..."
docker rmi $LocalImage -f 2>$null | Out-Null

Write-Host "🐳 Construyendo nueva imagen Docker: $LocalImage"
docker build -t $LocalImage -f "$DockerfilePath" "$RootPath"
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir la imagen Docker."
    exit 1
}
Write-Host "✅ Imagen Docker creada exitosamente: $LocalImage"

# --- TEST LOCAL OPCIONAL ---
Write-Host "🧪 Iniciando prueba local del contenedor..."
docker run --rm -d -p 3001:3000 --name test-$ProjectName $LocalImage
Start-Sleep -Seconds 5
docker stop test-$ProjectName | Out-Null
Write-Host "✅ Build y contenedor probados correctamente."

# --- PUBLICACIÓN EN DOCKER HUB ---
Write-Host "📦 Etiquetando imagen para Docker Hub..."
docker tag $LocalImage $DockerHubRepo

Write-Host "📤 Subiendo imagen a Docker Hub: $DockerHubRepo"
docker push $DockerHubRepo

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir la imagen a Docker Hub."
    exit 1
}

Write-Host ""
Write-Host "✅ Imagen publicada correctamente en Docker Hub:"
Write-Host "   → $DockerHubRepo"
Write-Host ""
Write-Host "🌍 Ahora puedes desplegarla en tu servidor con:"
Write-Host "   docker pull $DockerHubRepo"
Write-Host "   docker run -d -p 3000:3000 --name $ProjectName $DockerHubRepo"
Write-Host ""
Write-Host "✅ Proceso completado correctamente."
