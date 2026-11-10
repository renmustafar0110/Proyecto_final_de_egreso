# Documento de Requisitos de Producto (PRD)

**Proyecto:** Digitalización de Servicios Hospitalarios – Hospital de Clínicas
**Versión:** 3.0

---

## 1. Objetivo y Visión del Producto

Modernizar la gestión hospitalaria desarrollando dos servicios digitales alojados en los servidores del Departamento Técnico de Informática (DTI) del Hospital de Clínicas:

- Un sistema de **documentación digital con acceso vía QR** para pacientes, eliminando las copias impresas.
- Un sistema de **trazabilidad de ambulancias** que permita registrar y controlar cada traslado durante todo su ciclo operativo.

---

## 2. Alcance

El proyecto abarca la construcción de dos módulos independientes pero integrables al sistema centralizado existente del hospital:

1. **Módulo de Gestión de Documentación para Pacientes**
2. **Módulo de Trazabilidad de Ambulancias**

Ambos módulos se integrarán al panel principal de acceso del hospital, permitiendo a los usuarios autenticarse con sus credenciales habituales.

---

## 3. Stakeholders y Usuarios

### 3.1. Stakeholders

| Stakeholder | Rol |
|-------------|-----|
| Hospital de Clínicas | Cliente y dueño del producto |
| DTI (Departamento Técnico de Informática) | Responsable de infraestructura, hosting y mantenimiento |
| Funcionarios administrativos | Usuarios operativos de ambos módulos |
| Pacientes | Usuarios finales del módulo de documentación y encuestas |
| Conductores y personal de ambulancias | Involucrados en el módulo de trazabilidad |

### 3.2. Usuarios del Sistema

| Tipo de Usuario | Descripción |
|----------------|-------------|
| Administrativo | Personal administrativo del área de la salud que gestionará la información y operará los servicios. |
| Paciente | Usuario final que accederá a documentación e información institucional mediante códigos QR desde su dispositivo móvil. |

### 3.3. User Personas

#### Persona 1 — María (Funcionaria administrativa, Gestión Documental)
- **Necesidad:** Cargar documentos y generar QRs sin pasos complejos.
- **Dolor:** Actualmente depende de impresión y distribución física.

#### Persona 2 — Carlos (Paciente)
- **Necesidad:** Acceder a indicaciones médicas desde su celular.
- **Dolor:** Pierde papeles, no recuerda las indicaciones.

#### Persona 3 — Pablo (Administrativo, Ambulancias)
- **Rol:** Encargado de logística de transporte.
- **Necesidad:** Saber dónde está cada ambulancia y qué traslado tiene asignado.
- **Dolor:** Comunicación telefónica constante, sin registro centralizado.

---

## 4. Módulo 1: Gestión de Documentación para Pacientes

### 4.1. Descripción General

Servicio que permite a un funcionario administrativo cargar y gestionar documentación digital en el servidor (en formato PDF u otros formatos estándar), asociando metadatos a cada documento (título, descripción, categoría, fecha de publicación) y visualizando un listado con estado (activo/inactivo). Cada documento genera automáticamente un código QR único que el paciente escanea para acceder al contenido desde su dispositivo móvil, sin autenticación ni aplicaciones adicionales, en una vista web optimizada para móviles.

Incluye además un módulo de **encuestas de satisfacción**: los administrativos crean y gestionan formularios, los pacientes los completan de forma digital y las respuestas se almacenan en el servidor para su posterior análisis y exportación.

### 4.2. Historias de Usuario

#### US-01: Carga de documentos
> **Como** funcionario administrativo  
> **Quiero** cargar un documento PDF al sistema  
> **Para** que esté disponible para los pacientes vía QR

*Criterios de aceptación:*
- El sistema acepta archivos PDF de hasta 10 MB
- Al cargar, se muestra un preview del documento
- Se genera un código QR automáticamente
- El QR es descargable en formato PNG
- La carga y obtención del QR descargable se completa en menos de 5 pasos

---

#### US-02: Gestión de documentos
> **Como** funcionario administrativo  
> **Quiero** editar, desactivar o eliminar documentos existentes  
> **Para** mantener la información actualizada

*Criterios de aceptación:*
- El listado de documentos permite buscar por título y categoría
- Al desactivar un documento, su QR deja de funcionar
- Solo un administrador autenticado puede realizar estas acciones

---

#### US-03: Visualización de documento por QR
> **Como** paciente del hospital  
> **Quiero** escanear un código QR con mi celular  
> **Para** ver el documento sin necesidad de autenticarme

*Criterios de aceptación:*
- El QR redirige a una URL pública sin login
- El documento se muestra correctamente en Chrome y Safari móvil
- El contenido es legible sin hacer zoom (vista responsiva)

---

#### US-04: Creación de encuestas
> **Como** funcionario administrativo  
> **Quiero** crear formularios de encuesta con preguntas personalizables  
> **Para** medir la satisfacción de los pacientes

*Criterios de aceptación:*
- Soporta preguntas de opción múltiple, escala numérica y texto libre
- La encuesta se asocia a un documento o es independiente
- Se genera un QR específico para la encuesta

---

#### US-05: Respuesta a encuestas
> **Como** paciente  
> **Quiero** completar una encuesta escaneando un QR  
> **Para** dar mi opinión sobre el servicio recibido

*Criterios de aceptación:*
- No requiere registro ni autenticación
- Las respuestas se guardan automáticamente al enviar
- El paciente recibe confirmación visual de envío exitoso

---

#### US-06: Análisis de resultados
> **Como** administrativo  
> **Quiero** ver los resultados de las encuestas en un dashboard  
> **Para** calcular indicadores de satisfacción

*Criterios de aceptación:*
- El dashboard muestra cantidad de respuestas por encuesta
- Los datos se pueden exportar a CSV
- Se muestran gráficos básicos (barras, torta)

### 4.3. Casos de Uso

**CU-01: Iniciar sesión en el sistema**
| Campo | Detalle |
|-------|---------|
| **Actor** | Funcionario administrativo |
| **Descripción** | El administrativo ingresa al sistema centralizado del hospital usando usuario y contraseña habituales |
| **Precondición** | El usuario posee credenciales activas en el sistema central |
| **Postcondición** | El usuario accede al panel principal con los módulos disponibles |
| **Flujo principal** | 1. El usuario ingresa usuario y contraseña. 2. El sistema valida las credenciales. 3. El sistema redirige al panel principal con accesos a los módulos. |
| **Flujo alternativo** | 2a. Credenciales inválidas: el sistema muestra mensaje de error y permite reintentar. |

---

**CU-02: Cargar documento informativo**
| Campo | Detalle |
|-------|---------|
| **Actor** | Funcionario administrativo |
| **Descripción** | El administrativo carga un documento PDF al servidor para que esté disponible para pacientes vía QR |
| **Precondición** | El usuario ha iniciado sesión |
| **Postcondición** | El documento se almacena en el servidor y se genera un código QR asociado |
| **Flujo principal** | 1. El usuario selecciona "Cargar documento". 2. El sistema muestra un formulario. 3. El usuario selecciona el archivo PDF y completa metadatos (título, categoría). 4. El usuario confirma la carga. 5. El sistema valida y almacena el archivo. 6. El sistema genera un código QR único. 7. El sistema muestra el QR descargable y confirma la operación. |
| **Flujo alternativo** | 5a. Archivo inválido o superior a 10 MB: el sistema rechaza la carga y muestra error. |

---

**CU-03: Gestionar documentos existentes**
| Campo | Detalle |
|-------|---------|
| **Actor** | Funcionario administrativo |
| **Descripción** | El administrativo edita, desactiva o elimina documentos previamente cargados |
| **Precondición** | El usuario ha iniciado sesión y existen documentos en el sistema |
| **Postcondición** | El documento es modificado, desactivado (el QR deja de funcionar) o eliminado |
| **Flujo principal** | 1. El usuario accede al listado de documentos. 2. El sistema muestra los documentos con su estado. 3. El usuario selecciona un documento. 4. El usuario elige editar, desactivar o eliminar. 5. El sistema confirma la acción y la ejecuta. |
| **Flujo alternativo** | 4a. Si elige eliminar, el sistema solicita confirmación adicional. |

---

**CU-04: Visualizar documento mediante QR**
| Campo | Detalle |
|-------|---------|
| **Actor** | Paciente |
| **Descripción** | El paciente escanea un código QR con su dispositivo móvil y visualiza el documento asociado |
| **Precondición** | El código QR está activo y asociado a un documento en el servidor |
| **Postcondición** | El paciente visualiza el documento en su dispositivo |
| **Flujo principal** | 1. El paciente abre la cámara de su dispositivo. 2. Escanea el código QR. 3. El sistema redirige a una URL pública. 4. El sistema muestra el documento en formato optimizado para móvil. 5. El paciente puede leer el contenido. |
| **Flujo alternativo** | 3a. QR inválido o documento desactivado: el sistema muestra mensaje "Documento no disponible". |

---

**CU-05: Crear encuesta de satisfacción**
| Campo | Detalle |
|-------|---------|
| **Actor** | Funcionario administrativo |
| **Descripción** | El administrativo crea un formulario de encuesta con preguntas personalizables |
| **Precondición** | El usuario ha iniciado sesión |
| **Postcondición** | La encuesta queda disponible con un QR propio para que los pacientes la completen |
| **Flujo principal** | 1. El usuario accede al módulo de encuestas. 2. Selecciona "Crear encuesta". 3. Completa título, preguntas y tipo de respuesta (múltiple opción, escala, texto). 4. Confirma la creación. 5. El sistema genera la encuesta y un QR asociado. |
| **Flujo alternativo** | - |

---

**CU-06: Completar encuesta de satisfacción**
| Campo | Detalle |
|-------|---------|
| **Actor** | Paciente |
| **Descripción** | El paciente escanea un QR de encuesta, responde las preguntas y envía el formulario |
| **Precondición** | La encuesta está activa y tiene un QR generado |
| **Postcondición** | Las respuestas se almacenan en el servidor para su análisis |
| **Flujo principal** | 1. El paciente escanea el QR de la encuesta. 2. El sistema muestra el formulario. 3. El paciente completa las preguntas. 4. El paciente envía el formulario. 5. El sistema guarda las respuestas. 6. El sistema muestra confirmación de envío exitoso. |
| **Flujo alternativo** | - |

---

**CU-07: Analizar resultados de encuestas**
| Campo | Detalle |
|-------|---------|
| **Actor** | Funcionario administrativo |
| **Descripción** | El administrativo accede a los resultados de las encuestas para calcular indicadores de satisfacción |
| **Precondición** | Existen encuestas con respuestas almacenadas |
| **Postcondición** | El usuario visualiza los datos y puede exportarlos |
| **Flujo principal** | 1. El usuario accede al dashboard de encuestas. 2. El sistema muestra gráficos con resultados. 3. El usuario puede filtrar por fecha o encuesta. 4. El usuario puede exportar los datos a CSV. |

### 4.4. Documentos Informativos Iniciales

- Indicaciones de interrupción voluntaria del embarazo
- Prostatectomía radical (indicaciones e información para el paciente)
- Preparación para estudios imagenológicos
- Estudios diagnósticos con pertecneciato
- Centellograma de perfusión miocárdica
- Indicaciones ecocardiograma con dobutamina
- Indicaciones para pacientes en tratamiento con warfarina
- Indicaciones ecocardiograma transesofágico
- Indicaciones para ingreso a centro de nefrología y trasplante
- Plan de alta enfermería, Nefrología
- Indicaciones de enfermería para usuarios trasplantados
- Prevención de infecciones
- Encuesta de satisfacción del usuario trasplantado
- Pauta para pacientes ostomizados

---

## 5. Módulo 2: Trazabilidad de Ambulancias

### 5.1. Descripción General

Sistema para la gestión y seguimiento del transporte realizado mediante ambulancias del Hospital de Clínicas. Permite registrar solicitudes de traslado con los siguientes datos mínimos:

- **Conductor** responsable del vehículo
- **Paciente o elemento** a trasladar (paciente biológico, equipamiento médico u otros insumos)
- **Copiloto o acompañante**
- **Punto de origen** y **destino**
- **Hora de salida**, **hora estimada de llegada** y **hora efectiva de llegada**

El administrativo actualiza manualmente el estado de cada operación durante todo su ciclo (Pendiente, En curso, En ruta, Llegada a destino, Retorno, Finalizado) y cuenta con un panel de control con las ambulancias en circulación y los traslados en curso.

### 5.2. Historias de Usuario

#### US-07: Registro de traslado
> **Como** funcionario administrativo  
> **Quiero** registrar una nueva solicitud de traslado con conductor, paciente, origen y destino  
> **Para** iniciar el seguimiento de la operación

*Criterios de aceptación:*
- Todos los campos obligatorios (conductor, paciente/elemento, origen, destino, hora salida)
- Se puede seleccionar conductor y copiloto desde un listado precargado
- Se puede registrar un acompañante (nombre, apellido, cédula y teléfono) o dejarlo vacío
- Se genera un ID único de traslado
- El registro de un traslado completo toma menos de 2 minutos

---

#### US-08: Actualización de estado
> **Como** funcionario administrativo  
> **Quiero** cambiar el estado del traslado (en ruta, llegó a destino, retornando, finalizado)  
> **Para** mantener el seguimiento actualizado

*Criterios de aceptación:*
- Los estados disponibles son: Pendiente, En curso, En ruta, Llegada a destino, Retorno, Finalizado
- Cada cambio de estado se registra con timestamp
- No se puede retroceder a un estado anterior

---

#### US-09: Panel de control de traslados
> **Como** administrativo encargado de logística  
> **Quiero** ver un tablero con todos los traslados activos  
> **Para** saber qué ambulancias están en circulación

*Criterios de aceptación:*
- El panel muestra: ID, conductor, destino, estado y hora de salida
- Los traslados activos aparecen destacados
- Permite filtrar por estado y fecha
- El panel refleja el estado de cada traslado en tiempo real (o cuasi-real)

---

#### US-11: Gestión de elementos no biológicos
> **Como** administrativo  
> **Quiero** registrar traslados de equipamiento médico o insumos  
> **Para** dar trazabilidad también a elementos que no son pacientes

*Criterios de aceptación:*
- El campo "paciente o elemento" acepta texto libre
- Se puede especificar tipo: paciente, equipamiento, insumo, otro

### 5.3. Casos de Uso

**CU-08: Registrar solicitud de traslado**
| Campo | Detalle |
|-------|---------|
| **Actor** | Funcionario administrativo |
| **Descripción** | El administrativo registra un nuevo traslado con los datos del conductor, copiloto, paciente/elemento, acompañante, origen, destino y horas |
| **Precondición** | El usuario ha iniciado sesión |
| **Postcondición** | Se crea un traslado con ID único y estado "Pendiente" |
| **Flujo principal** | 1. El usuario accede al módulo de ambulancias. 2. Selecciona "Nuevo traslado". 3. Completa los campos: conductor, copiloto (opcional, funcionario), acompañante (opcional, datos libres), paciente o elemento, origen, destino, hora de salida, hora estimada de llegada. 4. Confirma el registro. 5. El sistema genera un ID único y asigna estado "Pendiente". 6. El sistema confirma la operación. |
| **Flujo alternativo** | 3a. El elemento trasladado puede ser un paciente biológico, equipamiento médico u otros insumos (texto libre más tipo). 3b. El copiloto no puede ser la misma persona que el conductor (se compara por cédula). |

---

**CU-09: Actualizar estado del traslado**
| Campo | Detalle |
|-------|---------|
| **Actor** | Funcionario administrativo |
| **Descripción** | El administrativo actualiza el estado del traslado durante su ciclo operativo |
| **Precondición** | Existe un traslado con estado distinto a "Finalizado" |
| **Postcondición** | El estado del traslado cambia y se registra con timestamp |
| **Flujo principal** | 1. El usuario accede al detalle del traslado. 2. El sistema muestra el estado actual. 3. El usuario selecciona el nuevo estado (En curso, En ruta, Llegada a destino, Retorno, Finalizado). 4. El sistema actualiza el estado y registra la hora del cambio. 5. El sistema confirma la actualización. |
| **Flujo alternativo** | 3a. El sistema no permite retroceder a un estado anterior. |

---

**CU-10: Visualizar panel de control de traslados**
| Campo | Detalle |
|-------|---------|
| **Actor** | Funcionario administrativo |
| **Descripción** | El administrativo consulta el tablero general con todos los traslados activos y su estado |
| **Precondición** | Existen traslados registrados |
| **Postcondición** | El usuario visualiza la información actualizada |
| **Flujo principal** | 1. El usuario ingresa al panel de control. 2. El sistema muestra la lista de traslados activos con ID, conductor, destino, estado y hora de salida. 3. El usuario puede filtrar por estado o fecha. 4. El usuario selecciona un traslado para ver más detalle. |

---

## 6. Modelo de Datos

> **Nota de actualización:** este modelo refleja la base `hospital_clinicas` real.
> La tabla `Funcionarios_carga_Documentos` fue eliminada porque ningún flujo del
> sistema la utilizaba. Las antiguas tablas `Encuestas` y `Respuestas` fueron
> reemplazadas por el esquema normalizado `Encuestas_*`.

### 6.1. Diagrama Entidad-Relación

```mermaid
flowchart LR
    %% ESTILOS
    classDef entidad fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef relacion fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#000

    %% ENTIDADES
    PACIENTES[Pacientes]
    FUNCIONARIOS[Funcionarios]
    ADMINISTRADORES[Administradores]
    QR[QR]
    DOCUMENTOS[Documentos]
    ENC_FORM[Encuestas_Formularios]
    ENC_PREG[Encuestas_Preguntas]
    ENC_RESP[Encuestas_Respuestas]
    ENC_DET[Encuestas_Respuesta_Detalle]
    TRASLADOS[Traslados]
    CONDUCTORES[Conductores]
    AMBULANCIAS[Ambulancias]
    ACOMPANANTES[Acompanantes]
    COPILOTOS[Copilotos]
    EQUIPOS[Equipos]
    TRASLADO_ESTADOS[Traslado_Estados]

    %% RELACIONES
    PACIENTES -->|1:N| QR
    QR -->|1:N| DOCUMENTOS
    PACIENTES -.->|cedula| DOCUMENTOS

    FUNCIONARIOS -->|1:N| CONDUCTORES
    FUNCIONARIOS -->|1:N| COPILOTOS

    CONDUCTORES -->|1:N| TRASLADOS
    TRASLADOS -->|1:1| AMBULANCIAS
    TRASLADOS -->|1:1| ACOMPANANTES
    TRASLADOS -->|1:1| COPILOTOS
    TRASLADOS -->|1:N| EQUIPOS
    TRASLADOS -->|1:N| TRASLADO_ESTADOS

    ENC_FORM -->|1:N| ENC_PREG
    ENC_FORM -->|1:N| ENC_RESP
    ENC_RESP -->|1:N| ENC_DET
    ENC_PREG -->|1:N| ENC_DET

    %% ADMINISTRADORES es una tabla independiente de autenticación

    class PACIENTES,FUNCIONARIOS,ADMINISTRADORES,QR,DOCUMENTOS,ENC_FORM,ENC_PREG,ENC_RESP,ENC_DET,TRASLADOS,CONDUCTORES,AMBULANCIAS,ACOMPANANTES,COPILOTOS,EQUIPOS,TRASLADO_ESTADOS entidad
```

### 6.2. Descripción de Entidades

| Entidad | Atributos | Descripción |
|---------|-----------|-------------|
| **Pacientes** | id_paciente (PK), cedula (UNIQUE), nombre, apellido, fecha_nac, telefono, email, direccion | Pacientes del hospital que acceden a su documentación y responden encuestas |
| **Funcionarios** | id_funcionario (PK), nombre, apellido, cargo, cedula, password_hash | Personal del hospital que inicia sesión y opera los módulos |
| **Administradores** | id_administrador (PK), cedula (UNIQUE), nombre, cargo, contraseña | Cuentas del personal administrativo (`super_admin`). Se cargan directamente en la base |
| **QR** | id_qr (PK), url, cedula | Códigos QR generados para acceder a los documentos |
| **Documentos** | id_documento (PK), nom_doc, nom_pac, cedula, id_qr (FK), titulo_del_documento, archivo, fecha_publicacion, categoria_del_documento, estado | Documentos informativos cargados y vinculados a un QR |
| **Encuestas_Formularios** | id_encuesta (PK), titulo, descripcion, estado, fecha_creacion | Cabecera de cada encuesta de satisfacción |
| **Encuestas_Preguntas** | id_pregunta (PK), id_encuesta (FK), texto, tipo, opciones, orden | Preguntas de una encuesta (`multiple`, `escala`, `texto`) |
| **Encuestas_Respuestas** | id_respuesta (PK), id_encuesta (FK), fecha_envio | Cabecera de cada respuesta enviada por un paciente |
| **Encuestas_Respuesta_Detalle** | id_detalle (PK), id_respuesta (FK), id_pregunta (FK), valor | Valor respondido para cada pregunta |
| **Traslados** | id_traslado (PK), hora_salida, hora_llegada, origen, destino, km_recorridos, estado, id_conductor (FK), elemento_tipo, elemento_descripcion, elemento_dato1, elemento_dato2, elemento_dato3 | Registro principal de cada traslado en ambulancia |
| **Conductores** | id_conductor (PK), id_funcionario (FK), cedula (UNIQUE), nombre, apellido, telefono | Catálogo de conductores habilitados para traslados |
| **Ambulancias** | matricula (PK), numero_coche, id_traslado (FK) | Vehículos del hospital y el traslado que tienen asignado |
| **Acompañantes** | id_acompanante (PK), cedula_acom, nombre, apellido, id_traslado (FK UNIQUE), telefono | Acompañante de un traslado (máximo uno por traslado) |
| **Copilotos** | id_copiloto (PK), id_funcionario (FK), nombre_copiloto, apellido_copiloto, cedula, id_traslado (FK UNIQUE) | Copiloto de un traslado, elegido entre los funcionarios (máximo uno por traslado) |
| **Equipos** | id_equipo (PK), tipo_equipamiento, tipo_equipo, id_traslado (FK) | Equipamiento médico incluido en un traslado |
| **Traslado_Estados** | id_estado (PK), id_traslado (FK), estado, fecha_cambio | Historial de cambios de estado de cada traslado |

### 6.3. Relaciones

| Relación | Entidades | Cardinalidad | FK en | Descripción |
|----------|-----------|--------------|-------|-------------|
| accede | Pacientes - QR | 1:N | QR.cedula | Un paciente puede tener varios QR (relación lógica por cédula) |
| contiene | QR - Documentos | 1:N | Documentos.id_qr | Un QR puede estar asociado a varios documentos |
| registra | Funcionarios - Conductores | 1:N | Conductores.id_funcionario | Un funcionario puede estar habilitado como conductor |
| actúa | Funcionarios - Copilotos | 1:N | Copilotos.id_funcionario | Un funcionario puede actuar como copiloto en varios traslados |
| conduce | Conductores - Traslados | 1:N | Traslados.id_conductor | Un conductor puede realizar varios traslados |
| asigna | Traslados - Ambulancias | 1:1 | Ambulancias.id_traslado | Un traslado tiene una ambulancia asignada |
| lleva | Traslados - Acompañantes | 1:1 | Acompanantes.id_traslado (UNIQUE) | Un traslado puede llevar un acompañante |
| lleva | Traslados - Copilotos | 1:1 | Copilotos.id_traslado (UNIQUE) | Un traslado puede llevar un copiloto |
| incluye | Traslados - Equipos | 1:N | Equipos.id_traslado | Un traslado puede incluir varios equipos |
| historial | Traslados - Traslado_Estados | 1:N | Traslado_Estados.id_traslado | Un traslado acumula un historial de estados |
| agrupa | Encuestas_Formularios - Encuestas_Preguntas | 1:N | Encuestas_Preguntas.id_encuesta | Una encuesta contiene varias preguntas |
| recibe | Encuestas_Formularios - Encuestas_Respuestas | 1:N | Encuestas_Respuestas.id_encuesta | Una encuesta recibe varias respuestas |
| detalla | Encuestas_Respuestas - Encuestas_Respuesta_Detalle | 1:N | Encuestas_Respuesta_Detalle.id_respuesta | Una respuesta contiene el detalle de sus preguntas |
| responde | Encuestas_Preguntas - Encuestas_Respuesta_Detalle | 1:N | Encuestas_Respuesta_Detalle.id_pregunta | Cada pregunta puede aparecer en muchas respuestas |

`Administradores` es una tabla independiente: no tiene relaciones con el resto del
modelo y se usa únicamente para autenticar al personal administrativo.

---

## 7. Requisitos Técnicos

### 7.1. Infraestructura e Integración

- Las aplicaciones se alojarán en servidores propios del Hospital de Clínicas (DTI, piso 6).
- Los módulos se integran como accesos directos en el panel principal del sistema centralizado existente.
- La autenticación se delega al sistema central mediante credenciales existentes (SSO); las sesiones se manejan vía token (JWT).

### 7.2. Stack Tecnológico (a definir con DTI)

- **Frontend:** React o Vue.js (responsivo, optimizado para móviles en el módulo de pacientes, PWA-ready)
- **Backend:** Node.js + Express o Python + FastAPI, con API REST para comunicación entre módulos
- **Base de datos:** PostgreSQL o MySQL (almacenamiento persistente relacional)
- **Generación de QR:** librería qrcode (server-side)
- **Servidor:** Ubuntu Server + Nginx como reverse proxy

### 7.3. Seguridad

- Autenticación segura para el personal administrativo con roles: `admin_documentos`, `admin_ambulancias`, `super_admin`
- HTTPS obligatorio en todos los endpoints
- Los documentos de pacientes son de acceso público vía QR (sin autenticación), pero solo permiten lectura individual, no listado, y la gestión debe protegerse contra accesos no autorizados
- Las encuestas son anónimas por defecto; los datos deben almacenarse de forma anónima o seudonimizada según normativa aplicable

---

## 8. Priorización (MoSCoW)

| Prioridad | Historias |
|-----------|-----------|
| **Must have** | US-01, US-03, US-07, US-08, US-09 |
| **Should have** | US-02, US-04, US-05, US-11 |
| **Could have** | US-06 |
| **Won't have (ahora)** | App nativa móvil, tracking GPS, notificaciones push |

---

## 9. Roadmap Tentativo

| Sprint | Historias | Entrega |
|--------|-----------|---------|
| Sprint 1 | US-01, US-03 | Carga y visualización de documentos vía QR |
| Sprint 2 | US-02, US-04 | Gestión de documentos + creación de encuestas |
| Sprint 3 | US-05, US-06 | Respuesta y análisis de encuestas |
| Sprint 4 | US-07, US-08 | Registro y estados de traslados |
| Sprint 5 | US-09, US-11 | Panel de control + elementos no biológicos |
| Sprint 6 | — | Integración final |

---

## 10. Entregables

1. Módulo de Gestión de Documentación para Pacientes (código fuente, documentación, script de base de datos).
2. Módulo de Trazabilidad de Ambulancias (código fuente, documentación, script de base de datos).
3. Documentación de integración con el sistema centralizado.
4. Manual de usuario para administrativos.

---

## 11. Métricas de Éxito (KPIs)

- **Tasa de adopción QR:** % de pacientes que escanean vs. documentos impresos emitidos.
- **Reducción de impresión:** disminución del gasto en papel (comparativa mensual del presupuesto destinado a impresión).
- **Tasa de respuesta de encuestas:** cantidad de respuestas recibidas / total de pacientes alcanzados.
- **Indicadores de satisfacción calculables** a partir de los datos recolectados en el dashboard.
- **Traslados registrados:** % de traslados documentados en el sistema vs. total realizados.
- **Tiempo de registro:** tiempo promedio que tarda un administrativo en crear un traslado.

---

## 12. Riesgos y Mitigaciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| Baja adopción de QR por pacientes | Alto | Campaña informativa + instrucciones impresas breves |
| Falla del servidor DTI | Alto | Backup diario + plan de contingencia |
| Resistencia del personal administrativo | Medio | Capacitación y soporte durante rollout |
| Documentos sensibles expuestos | Alto | Solo documentos de información general, sin datos personales |

---

## 13. Restricciones y Supuestos

- El sistema centralizado existente continuará funcionando; los nuevos módulos se integran como extensiones.
- No se contempla el desarrollo de aplicaciones nativas móviles; el acceso del paciente es vía web responsiva.
- El seguimiento de ambulancias es mediante actualización manual del estado por parte del administrativo (no se requiere GPS en esta etapa).
- Los servidores del DTI tienen disponibilidad y capacidad suficientes para alojar los nuevos servicios.

---

## 14. Glosario

| Término | Definición |
|---------|------------|
| DTI | Departamento Técnico de Informática del Hospital de Clínicas |
| QR | Código de respuesta rápida para acceso a información digital |
| SSO | Single Sign-On: autenticación centralizada con credenciales únicas |
| Traslado | Operación de transporte de paciente, equipamiento o insumos vía ambulancia |
| Elemento trasladado | Puede ser paciente biológico, equipamiento médico u otros insumos |
