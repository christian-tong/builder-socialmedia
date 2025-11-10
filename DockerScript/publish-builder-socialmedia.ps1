# ===============================
# 🚀 Build & Publish Script - builder-socialmedia
# ===============================

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectPath = Split-Path $ScriptDir -Parent
$ImageName = "soportewimprove/builder-socialmedia:1.0.0"
$DockerfilePath = Join-Path $ProjectPath "Dockerfile"

# ===============================
# Verificar que npm run build funciona correctamente
# ===============================
Write-Host "⚡ Verificando que 'npm run build' funciona correctamente..."
Push-Location $ProjectPath
try {
    npm run build --if-present
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm build falló. Revisa errores antes de construir la imagen."
        exit 1
    }
} finally {
    Pop-Location
}
Write-Host "✅ npm run build exitosa. Procediendo a construir la imagen Docker..."

# ===============================
# Construir imagen Docker
# ===============================
Write-Host "🛠️ Construyendo imagen Docker: $ImageName"
docker build -t $ImageName -f $DockerfilePath $ProjectPath
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir la imagen Docker."
    exit 1
}
Write-Host "✅ Imagen Docker construida correctamente."

# ===============================
# Subir imagen a Docker Hub
# ===============================
Write-Host "📤 Subiendo imagen a Docker Hub..."
docker push $ImageName
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al subir la imagen a Docker Hub."
    exit 1
}
Write-Host "✅ Imagen publicada correctamente: $ImageName"
