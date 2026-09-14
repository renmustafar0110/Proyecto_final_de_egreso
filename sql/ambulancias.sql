-- Crear base de datos (ejecutar solo si no existe)
CREATE DATABASE IF NOT EXISTS hospital_clinicas;
USE hospital_clinicas;

-- Tabla de ambulancias con campo de estado
CREATE TABLE IF NOT EXISTS Ambulancias (
    matricula      VARCHAR(20) PRIMARY KEY,
    numero_coche   VARCHAR(10) NOT NULL,
    estado         ENUM('Disponible', 'En curso', 'En ruta', 'Finalizado') NOT NULL DEFAULT 'Disponible',
    marca          VARCHAR(50),
    modelo         VARCHAR(50),
    ano_fabricacion INT
);

-- Datos iniciales
INSERT INTO Ambulancias (matricula, numero_coche, estado, marca, modelo, ano_fabricacion) VALUES
('ABC 1234', '01', 'Disponible', 'Mercedes-Benz', 'Sprinter', 2019),
('DEF 5678', '02', 'En curso',   'Ford',          'Transit',   2020),
('GHI 9012', '03', 'En ruta',    'Renault',       'Master',    2018);