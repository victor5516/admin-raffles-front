#!/bin/bash

# Script de deploy para Admin - Rifas el Torito Ese
# Construye la aplicación y la despliega a S3 con invalidación de CloudFront

set -e

echo "🚀 Iniciando deploy del Admin de Rifas el Torito Ese..."

# Configuración
export ADMIN_BUCKET=''
export ADMIN_DIST=''

echo "📦 Configuración:"
echo "   Bucket: $ADMIN_BUCKET"
echo "   Distribution ID: $ADMIN_DIST"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio del admin."
    exit 1
fi

# Verificar que AWS CLI está instalado
if ! command -v aws &> /dev/null; then
    echo "❌ Error: AWS CLI no está instalado. Por favor instálalo primero."
    exit 1
fi

# Verificar que estamos autenticados con AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: No estás autenticado con AWS. Ejecuta 'aws configure' primero."
    exit 1
fi

# Usar versión de Node con nvm si está disponible
if [ -f .nvmrc ]; then
  if [ -s "$NVM_DIR/nvm.sh" ]; then
    # shellcheck disable=SC1090
    . "$NVM_DIR/nvm.sh"
  elif command -v brew &>/dev/null && [ -d "$(brew --prefix nvm 2>/dev/null)/nvm.sh" ]; then
    # shellcheck disable=SC1091
    . "$(brew --prefix nvm)/nvm.sh" || true
  fi
  if command -v nvm &> /dev/null; then
    echo "🧰 Usando Node versión de .nvmrc con nvm use..."
    nvm use
  else
    echo "⚠️ nvm no encontrado. Continuando con Node actual."
  fi
fi

echo "🔨 Construyendo la aplicación..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Error: La carpeta dist no se creó. Verifica que el build fue exitoso."
    exit 1
fi

echo "📤 Subiendo archivos a S3..."
aws s3 sync ./dist "s3://$ADMIN_BUCKET/" --delete

echo "⚙️ Configurando cache control para index.html..."
aws s3 cp "s3://$ADMIN_BUCKET/index.html" "s3://$ADMIN_BUCKET/index.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html; charset=utf-8" \
  --metadata-directive REPLACE

echo "🔄 Invalidando cache de CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id "$ADMIN_DIST" \
  --paths '/*'

echo "✅ Deploy del Admin completado exitosamente!"
echo "🌐 La aplicación del Admin estará disponible en unos minutos en CloudFront."
echo "   Distribution ID: $ADMIN_DIST"
