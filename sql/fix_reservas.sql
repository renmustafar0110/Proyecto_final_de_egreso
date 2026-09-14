-- Ejecutar SI la tabla Ambulancias ya existía (antes de esta versión)
USE hospital_clinicas;

-- numero_coche pasa a ser opcional (no se pide al cargar un vehículo)
ALTER TABLE Ambulancias MODIFY numero_coche VARCHAR(10) NULL;

-- Se agrega el estado 'Reservado' a los vehículos
ALTER TABLE Ambulancias
    MODIFY estado ENUM('Disponible', 'Reservado', 'En curso', 'En ruta', 'Finalizado') NOT NULL DEFAULT 'Disponible';