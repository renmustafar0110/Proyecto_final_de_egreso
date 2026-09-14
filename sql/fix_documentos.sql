-- Corrección para poder insertar documentos:
-- la tabla Documentos debe tener id_documento con AUTO_INCREMENT
-- (de otro modo el INSERT falla con "Field 'id_documento' doesn't have a default value")

USE hospital_clinicas;

ALTER TABLE Documentos MODIFY id_documento INT(11) NOT NULL AUTO_INCREMENT;