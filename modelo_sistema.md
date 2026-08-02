# Modelo del Sistema

## Hospital de Clínicas - Engineering Corp

**Integrantes:** Leonardo Garcia, Alan Farall, Gerard Fagundez, Williams Gonzalez

---

## Modelo Esencial

El modelo esencial representa la funcionalidad pura del sistema, independientemente de la tecnología o forma de implementación. Describe **qué** debe hacer el sistema, no **cómo**.

### Funcionalidades Esenciales

| Funcionalidad | Descripción |
|---|---|
| Gestionar documentos | Cargar, editar, eliminar y consultar documentos digitales |
| Generar QR | Producir un código QR único por cada documento cargado |
| Escanear QR | Permitir al paciente acceder al documento mediante escaneo |
| Registrar traslados | Crear y gestionar traslados en ambulancia |
| Monitorear rutas | Registrar origen, destino, tiempos y kilometraje |
| Gestionar encuestas | Crear encuestas y registrar respuestas de satisfacción |
| Autenticar usuarios | Validar credenciales de funcionarios y pacientes |

### Entidades Esenciales

Pacientes, Funcionarios, Documentos, QR, Encuestas, Respuestas, Traslados, Ambulancias, Acompanantes, Rutas, Equipos, M_Biologicas.

---

## Modelo Ambiental

Define el contexto del sistema, sus límites y las interacciones con el entorno externo.

### Diagrama de Contexto

```
+-------------------+       +-------------------+
|                   |       |                   |
|   Funcionario     |<----->|   Sistema de      |
|   (Administrativo)|       |   Gestion         |
|                   |       |   Hospital        |
+-------------------+       |   de Clinicas     |
                            |                   |
+-------------------+       |                   |
|                   |<----->|                   |
|   Paciente        |       |                   |
|                   |       +-------------------+
+-------------------+
                            +-------------------+
+-------------------+       |                   |
|                   |<----->|   Panel Central   |
|   Transportista   |       |   DTI (Piso 6)    |
|                   |       |                   |
+-------------------+       +-------------------+
```

### Actores del Sistema

| Actor | Descripción | Interacción |
|---|---|---|
| Funcionario | Personal administrativo del hospital | Gestiona documentos, ve traslados, crea encuestas |
| Paciente | Usuario final de los servicios | Escanea QR, visualiza documentos, responde encuestas |
| Transportista | Conductor/operador de ambulancia | Registra traslados, rutas y estados |
| Administrador DTI | Personal técnico del hospital | Mantiene el sistema en servidores del piso 6 |

### Limites del Sistema

- **Interno:** Base de datos, servidor web, módulos de gestión y trazabilidad
- **Externo:** Panel de autenticacion centralizado del hospital, dispositivos moviles de pacientes

---

## Lista de Acontecimientos (Eventos)

| ID | Evento | Origen | Respuesta del Sistema |
|---|---|---|---|
| E01 | Funcionario carga un documento | Funcionario | El sistema almacena el documento y genera un QR |
| E02 | Paciente escanea un QR | Paciente | El sistema muestra el documento asociado |
| E03 | Funcionario edita un documento | Funcionario | El sistema actualiza los metadatos del documento |
| E04 | Funcionario elimina un documento | Funcionario | El sistema marca el documento como inactivo |
| E05 | Se inicia un traslado | Transportista | El sistema registra hora de salida, origen y destino |
| E06 | Finaliza un traslado | Transportista | El sistema registra hora de llegada y kilometraje |
| E07 | Paciente responde encuesta | Paciente | El sistema almacena la respuesta y actualiza graficos |
| E08 | Funcionario crea encuesta | Funcionario | El sistema agrega la encuesta al modulo correspondiente |
| E09 | Funcionario inicia sesion | Funcionario | El sistema valida credenciales y redirige al panel |
| E10 | Paciente inicia sesion | Paciente | El sistema valida credenciales y muestra sus documentos |
| E11 | Se registra una muestra biologica | Funcionario | El sistema asocia la muestra al traslado correspondiente |
| E12 | Se asigna una ambulancia | Transportista | El sistema vincula la ambulancia al traslado |

---

## Modelo de Comportamiento

Describe como responde el sistema ante los eventos, expresado mediante diagramas UML de comportamiento.

### Diagrama de Casos de Uso (UML)

```
+----------------------------------+
|  Sistema Hospital de Clinicas    |
|                                   |
|  +-----------------------------+  |
|  | CU-01: Cargar Documento    |  |
|  +-----------------------------+  |
|           ^                       |
|           | (actor: Funcionario)  |
|  +-----------------------------+  |
|  | CU-02: Escanear QR         |  |
|  +-----------------------------+  |
|           ^                       |
|           | (actor: Paciente)     |
|  +-----------------------------+  |
|  | CU-03: Gestionar Traslados |  |
|  +-----------------------------+  |
|           ^                       |
|           | (actor: Transportista)|
|  +-----------------------------+  |
|  | CU-04: Responder Encuesta  |  |
|  +-----------------------------+  |
|           ^                       |
|           | (actor: Paciente)     |
|  +-----------------------------+  |
|  | CU-05: Autenticar Usuario  |  |
|  +-----------------------------+  |
|           ^                       |
|           | (actor: Todos)        |
+----------------------------------+
```

### Diagrama de Estados - Documento

```
[Estado: Borrador] --> [Estado: Activo] --> [Estado: Inactivo]
       ^                    |
       |                    v
       +--- (editar) ---[Estado: Archivado]
```

### Diagrama de Estados - Traslado

```
[Pendiente] --> [En Curso] --> [Finalizado]
                    |
                    v
              [Cancelado]
```

---

## UML (Unified Modelling Language)

### Diagrama de Clases

```
+------------------+          +-------------------+
|   Pacientes      |          |   Funcionarios    |
+------------------+          +-------------------+
| - cedula: PK     |<>--------| - id_funcionario  |
| - nombre         |          | - cedula: FK      |
| - apellido       |          | - nombre          |
| - fecha_nac      |          | - apellido        |
| - telefono       |          | - cargo           |
| - email          |          | - id_m_biologica  |
| - direccion      |          +-------------------+
+------------------+
        | 1
        |
        | N
+------------------+
|   QR             |
+------------------+
| - id_qr: PK      |
| - cedula: FK     |
| - codigo         |
| - url            |
| - fecha_creacion |
| - tipo           |
| - activo         |
+------------------+
        | 1
        |
        | N
+------------------+
|   Documentos     |
+------------------+
| - id_documento   |
| - id_qr: FK      |
| - nom_doc        |
| - nom_pac        |
| - cedula         |
| - fecha_emision  |
| - tipo_documento |
+------------------+
        |
        | (tabla intermedia N:N)
        |
+-----------------------+
| Funcionarios_carga_   |
| Documentos            |
+-----------------------+
| - id_funcionario: FK  |
| - id_documento: FK    |
| - fecha_carga         |
+-----------------------+

+------------------+          +-------------------+
|   Encuestas      |          |   Respuestas      |
+------------------+          +-------------------+
| - proveniencia   |<>--------| - id_respuesta    |
| - cedula: FK     |    1   N | - proveniencia: FK|
| - preguntas      |          | - grafico         |
| - fecha_creacion |          | - porcentaje      |
| - titulo         |          | - fecha_respuesta |
+------------------+          | - comentario      |
                              +-------------------+

+------------------+          +-------------------+
|   Traslados      |          |   Ambulancias     |
+------------------+          +-------------------+
| - id_traslado    |<>--------| - matricula: PK   |
| - hora_salida    |    1   N | - id_traslado: FK |
| - hora_llegada   |          | - numero_coche    |
| - origen         |          | - marca           |
| - destino        |          | - modelo          |
| - km_recorridos  |          | - ano_fabricacion |
| - estado         |          +-------------------+
+------------------+
        | 1
        |
        | N
+------------------+
|   Acompanantes   |
+------------------+
| - cedula_acom    |
| - id_traslado:FK |
| - nombre         |
| - apellido       |
| - cantidad       |
| - telefono       |
| - parentesco     |
+------------------+

+------------------+          +-------------------+
|   Rutas          |          |   Equipos         |
+------------------+          +-------------------+
| - id_ruta        |          | - id_equipo       |
| - id_traslado:FK |          | - id_traslado:FK  |
| - domicilio      |          | - modelo          |
| - km             |          | - funcion         |
| - duracion_estim |          | - tipo            |
| - estado_trafico |          | - fecha_adquisic  |
+------------------+          | - estado          |
                              +-------------------+

+------------------+
|   M_Biologicas   |
+------------------+
| - id_m_biologica |
| - id_traslado:FK |
| - tipo           |
| - tipo_cuidado   |
| - receptor       |
| - fecha_recepcio |
| - temperatura    |
+------------------+
```

### Diagrama de Secuencia - Carga de Documento

```
Funcionario       Sistema            BD
    |                |                |
    |---cargar()---->|                |
    |                |---insertar()-->|
    |                |<---ok----------|
    |                |---generarQR()->|
    |                |<---QR----------|
    |<---confirmar---|                |
    |                |                |
```

### Diagrama de Secuencia - Escaneo de QR

```
Paciente         Sistema            BD
    |                |                |
    |---escanear()-->|                |
    |                |---consultar()->|
    |                |<---documento---|
    |<---mostrar()---|                |
    |                |                |
```

### Diagrama de Colaboracion - Traslado

```
Transportista ---> [Sistema] ---> [BD: Traslados]
     |                                  |
     |---> [Asignar Ambulancia] <--------|
     |---> [Registrar Ruta] <------------|
     |---> [Cargar M_Biologica] <--------|
     |---> [Finalizar Traslado] <--------|
```

### Diagrama de Componentes

```
+--------------------------------------------------+
|  Cliente Web (HTML + CSS + JS)                   |
+--------------------------------------------------+
                    | HTTP
+--------------------------------------------------+
|  Servidor Web (PHP)                              |
|  +--------------------------------------------+  |
|  | Modulo Documentos | Modulo Traslados       |  |
|  | Modulo Encuestas  | Modulo Autenticacion   |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
                    | SQL
+--------------------------------------------------+
|  Base de Datos (MySQL/PostgreSQL)                |
|  (12 tablas segun MER)                           |
+--------------------------------------------------+
```

### Diagrama de Despliegue

```
+--------------------------------------------------+
|  Servidor DTI - Piso 6                           |
|  +--------------------------------------------+  |
|  | Apache + PHP + MySQL                       |  |
|  | Sistema de Gestion Hospital de Clinicas    |  |
|  +--------------------------------------------+  |
+--------------------------------------------------+
        |
        | Red Interna
        |
+-------------------+    +-------------------+
| PC Administrativo |    | Celular Paciente  |
| (Navegador)       |    | (Camara + QR)     |
+-------------------+    +-------------------+
```
