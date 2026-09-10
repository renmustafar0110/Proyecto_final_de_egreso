#!/bin/bash

MYSQL="/opt/lampp/bin/mysql"
DB_SOCKET="/opt/lampp/var/mysql/mysql.sock"
DB_HOST="localhost"
DB_NAME="hospital_clinicas"
DB_USER="root"
DB_PASS=""

opcion_mysql() {
    $MYSQL --skip-ssl -h "$DB_HOST" -u "$DB_USER" ${DB_PASS:+-p"$DB_PASS"} "$DB_NAME" -e "$1" 2>&1
}

consultar_documentos() {
    opcion_mysql "SELECT id_documento, nom_doc, nom_pac, cedula, nombre, archivo FROM Documentos;"
}

consultar_pacientes() {
    opcion_mysql "SELECT cedula, nombre, apellido, telefono, email FROM Pacientes;"
}

insertar_paciente() {
    echo "Ingrese los datos del nuevo paciente:"
    read -rp "Cedula: " cedula
    read -rp "Nombre: " nombre
    read -rp "Apellido: " apellido
    read -rp "Telefono: " telefono
    read -rp "Email: " email
    opcion_mysql "INSERT INTO Pacientes (cedula, nombre, apellido, telefono, email)
                  VALUES ('$cedula', '$nombre', '$apellido', '$telefono', '$email');"
    echo "Paciente registrado con cedula $cedula."
}

eliminar_paciente() {
    read -rp "Cedula del paciente a eliminar: " cedula
    opcion_mysql "DELETE FROM Pacientes WHERE cedula = '$cedula';"
    echo "Se elimino el paciente con cedula $cedula."
}

mostrar_menu() {
    echo "======================================"
    echo "   GESTION BASE DE DATOS HOSPITAL"
    echo "======================================"
    echo "1) Consultar documentos cargados"
    echo "2) Consultar pacientes"
    echo "3) Registrar nuevo paciente"
    echo "4) Eliminar paciente"
    echo "5) Salir"
    echo "======================================"
}

while true; do
    mostrar_menu
    read -rp "Seleccione una opcion: " opcion
    case "$opcion" in
        1) consultar_documentos ;;
        2) consultar_pacientes ;;
        3) insertar_paciente ;;
        4) eliminar_paciente ;;
        5) echo "Saliendo..."; exit 0 ;;
        *) echo "Opcion invalida." ;;
    esac
    echo ""
done