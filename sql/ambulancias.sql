-- Crear base de datos (ejecutar solo si no existe)
CREATE DATABASE IF NOT EXISTS hospital_clinicas;
USE hospital_clinicas;

-- Tabla de vehículos con campo de estado
CREATE TABLE IF NOT EXISTS Ambulancias (
    matricula      VARCHAR(20) PRIMARY KEY,
    numero_coche   VARCHAR(10) NULL,
    estado         ENUM('Disponible', 'Reservado', 'En curso', 'En ruta', 'Finalizado') NOT NULL DEFAULT 'Disponible',
    marca          VARCHAR(50),
    modelo         VARCHAR(50),
    ano_fabricacion INT
);

-- Datos iniciales
INSERT INTO Ambulancias (matricula, numero_coche, estado, marca, modelo, ano_fabricacion) VALUES
('ABC 1234', '01', 'Disponible', 'Mercedes-Benz', 'Sprinter', 2019),
('DEF 5678', '02', 'Disponible', 'Ford',          'Transit',   2020),
('GHI 9012', '03', 'Disponible', 'Renault',       'Master',    2018);