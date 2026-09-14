#!/bin/bash
# ============================================================
# Configuración ÚNICA para XAMPP: vincula este proyecto a htdocs
# SIN copiar archivos. Se ejecuta una sola vez (pedirá tu clave).
# Después, cualquier cambio que hagas se ve directo en el navegador.
#
#   bash configurar_htdocs.sh
#
# URL de acceso:
#   http://localhost/Proyecto_final_de_egreso1/html/index.html
# ============================================================

PROYECTO="/home/alan/Documentos/Proyecto_final_de_egreso1"
ENLACE="/opt/lampp/htdocs/Proyecto_final_de_egreso1"

echo "Vinculando Apache con el proyecto..."
echo "  $ENLACE"
echo "  -> $PROYECTO"
echo ""

if [ -e "$ENLACE" ]; then
    if [ -L "$ENLACE" ]; then
        echo "Ya existe el enlace. No se necesita hacer nada."
    else
        echo "ERROR: en $ENLACE ya existe una carpeta copiada."
        echo "Para reemplazarla por un enlace, ejecutá primero:"
        echo "  sudo rm -rf \"$ENLACE\""
        exit 1
    fi
else
    sudo ln -s "$PROYECTO" "$ENLACE"
fi

# Permisos de la carpeta donde se guardan los documentos subidos
sudo chmod -R 777 "$PROYECTO/php/Documento"

echo ""
echo "Listo."
echo "Abrí en el navegador: http://localhost/Proyecto_final_de_egreso1/html/index.html"
echo "Los cambios que hagas en el proyecto se guardan directamente."