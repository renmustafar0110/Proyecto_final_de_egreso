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
| Gestionar encuestas | Crear encuestas y registrar respuestas de satisfacción |
| Autenticar usuarios | Validar credenciales de funcionarios y pacientes |

### Entidades Esenciales

Pacientes, Funcionarios, Administradores, Documentos, QR, Encuestas_Formularios, Encuestas_Preguntas, Encuestas_Respuestas, Encuestas_Respuesta_Detalle, Traslados, Conductores, Ambulancias, Acompanantes, Copilotos, Equipos, Traslado_Estados.

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
| Transportista | Conductor/operador de ambulancia | Registra traslados y estados |
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
| - id_paciente: PK|          | - id_funcionario  |
| - cedula: UNIQUE |          | - cedula          |
| - nombre         |          | - nombre          |
| - apellido       |          | - apellido        |
| - fecha_nac      |          | - cargo           |
| - telefono       |          | - password_hash   |
| - email          |          +-------------------+
| - direccion      |                   | 1
+------------------+                   |
        | 1                            | N
        |                    +-------------------+
        | N                  |   Conductores     |
+------------------+          +-------------------+
|   QR             |          | - id_conductor: PK|
+------------------+          | - id_funcionario  |
| - id_qr: PK      |          | - cedula: UNIQUE  |
| - cedula         |          | - nombre          |
| - url            |          | - apellido        |
+------------------+          | - telefono        |
        | 1                   +-------------------+
        |                              | 1
        | N                            |
+------------------+                   | N
|   Documentos     |          +-------------------+
+------------------+          |   Traslados       |
| - id_documento   |          +-------------------+
| - id_qr: FK      |          | - id_traslado: PK |
| - nom_doc        |          | - hora_salida     |
| - nom_pac        |          | - hora_llegada    |
| - cedula         |          | - origen          |
| - titulo_del_doc |          | - destino         |
| - archivo        |          | - km_recorridos   |
| - fecha_public.  |          | - estado          |
| - categoria      |          | - id_conductor:FK |
| - estado         |          | - elemento_tipo   |
+------------------+          | - elemento_dato1  |
                              | - elemento_dato2  |
                              | - elemento_dato3  |
                              +-------------------+
                                 | 1      | 1      | 1
                                 |        |        |
                                 | N      | 1      | 1
                    +------------+  +-----+-----+  +------------------+
                    |               |             |                  |
              +-----------+   +-----------+  +-----------+   +-------------+
              |  Equipos  |   |Ambulancias|  |Acompanant.|   |  Copilotos  |
              +-----------+   +-----------+  +-----------+   +-------------+
              | id_equipo |   | matricula |  | id_acomp. |   | id_copiloto |
              | tipo_equip|   | numero_co.|  | cedula_ac.|   | id_funcion. |
              | tipo_equipo|  | id_trasl. |  | nombre    |   | nombre_cop. |
              | id_trasl. |   +-----------+  | apellido  |   | apellido_c. |
              +-----------+                  | telefono  |   | cedula      |
                                             | id_trasl. |   | id_trasl.   |
                                             +-----------+   +-------------+

+------------------+          +-----------------------+
|   Traslados      |          |   Traslado_Estados    |
+------------------+          +-----------------------+
| - id_traslado    |<>--------| - id_estado: PK       |
+------------------+    1   N | - id_traslado: FK     |
                              | - estado              |
                              | - fecha_cambio        |
                              +-----------------------+

+-------------------------+          +------------------------------+
| Encuestas_Formularios   |          | Encuestas_Respuestas         |
+-------------------------+          +------------------------------+
| - id_encuesta: PK       |<>--------| - id_respuesta: PK           |
| - titulo                |    1   N | - id_encuesta: FK            |
| - descripcion           |          | - fecha_envio                |
| - estado                |          +------------------------------+
| - fecha_creacion        |                     | 1
+-------------------------+                     |
        | 1                                     | N
        |                             +------------------------------+
        | N                           | Encuestas_Respuesta_Detalle  |
+-------------------------+           +------------------------------+
| Encuestas_Preguntas     |<>---------| - id_detalle: PK             |
+-------------------------+    1   N  | - id_respuesta: FK           |
| - id_pregunta: PK       |           | - id_pregunta: FK            |
| - id_encuesta: FK       |           | - valor                      |
| - texto                 |           +------------------------------+
| - tipo                  |
| - opciones              |
| - orden                 |
+-------------------------+

+-------------------------+
|   Administradores       |
+-------------------------+
| - id_administrador: PK  |
| - cedula: UNIQUE        |
| - nombre                |
| - cargo                 |
| - contraseña            |
+-------------------------+
```

> La tabla `Funcionarios_carga_Documentos` fue eliminada por no tener uso en el
> sistema. Las antiguas tablas `Encuestas` y `Respuestas` se reemplazaron por el
> esquema normalizado `Encuestas_Formularios`, `Encuestas_Preguntas`,
> `Encuestas_Respuestas` y `Encuestas_Respuesta_Detalle`.

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
