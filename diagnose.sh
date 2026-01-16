#!/bin/bash

# Script para verificar la estructura del API y los problemas

echo "📋 === DIAGNÓSTICO DEL API ==="
echo ""

echo "🔍 1. Verificando estructura de directorios:"
ls -la /home/jala/Vídeos/GESCOP/BACKEND/api/ | head -20
echo ""

echo "🔍 2. Verificando archivo .htaccess:"
ls -la /home/jala/Vídeos/GESCOP/BACKEND/api/.htaccess
echo ""

echo "🔍 3. Contenido del .htaccess:"
cat /home/jala/Vídeos/GESCOP/BACKEND/api/.htaccess
echo ""

echo "🔍 4. Verificando que vehiculos.php existe:"
ls -la /home/jala/Vídeos/GESCOP/BACKEND/api/flota/vehiculos.php
echo ""

echo "🔍 5. Verificando test.php:"
ls -la /home/jala/Vídeos/GESCOP/BACKEND/api/test.php
echo ""

echo "✅ Diagnóstico completado"
