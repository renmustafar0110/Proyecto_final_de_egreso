# Políticas de Seguridad, Argumentos de Seguridad y Principales Amenazas

## Proyecto: Digitalización de Servicios Hospitalarios – Hospital de Clínicas

Basado en el Documento de Requisitos de Producto (PRD 3.0 / PRD 2.0).

---

## 1. Políticas de Seguridad

### 1.1. Política de Autenticación y Acceso

- Todo funcionario administrativo debe autenticarse mediante las credenciales existentes del sistema centralizado del hospital (SSO).
- Las sesiones se manejan mediante token (JWT) emitido por el sistema central.
- Se definen roles con privilegios mínimos:
  - `admin_documentos`: gestiona documentos y encuestas.
  - `admin_ambulancias`: gestiona traslados, rutas y estados.
  - `super_admin`: control total del sistema, administración de usuarios y auditoría.
- Los pacientes **no requieren autenticación** para acceder a documentos vía QR, pero sí solo lectura y sin listado.

### 1.2. Política de Comunicaciones y Transporte

- Todas las comunicaciones entre cliente y servidor deben realizarse bajo **HTTPS obligatorio**.
- El backend expone una API REST; todo endpoint debe validar el token de sesión del sistema central.
- Las credenciales nunca se transmiten ni se almacenan en texto plano; se delega la validación al sistema centralizado.

### 1.3. Política de Acceso a Documentos

- Los documentos públicos vía QR se consideran de **información general, sin datos personales sensibles**.
- El acceso por QR habilita únicamente lectura del documento, nunca el listado del repositorio ni la descarga de otros documentos.
- Si un documento es desactivado, su QR deja de funcionar (estado `activo` en la entidad QR).
- La gestión de documentos (cargar, editar, eliminar) está restringida a funcionarios autenticados con rol `admin_documentos`.

### 1.4. Política de Privacidad de Datos

- Los datos de las encuestas se almacenan de forma **anónima o seudonimizada** según la normativa aplicable.
- Las encuestas son anónimas por defecto; no se registran datos personales del encuestado.
- Solo se recolecta la información estrictamente necesaria para los indicadores de satisfacción.

### 1.5. Política de Integridad y Respaldos

- Los servidores del DTI (piso 6) deben contar con **backup diario** y plan de contingencia.
- Los cambios de estado de traslado se registran con *timestamp* para garantizar trazabilidad e integridad.
- La base de datos relacional debe garantizar persistencia y consistencia transaccional.

### 1.6. Política de Roles y Segregación de Funciones

- Ningún usuario debe combinar roles que generen conflictos de interés (ej.: quien carga un documento no debe auditar su propia carga en la misma sesión sin registro).
- El rol `super_admin` debe ser exclusivo del personal del DTI.

---

## 2. Argumentos de Seguridad

### 2.1. Autenticación centralizada (SSO)
Al delegar la autenticación al sistema centralizado del hospital, se reutiliza una infraestructura madura y auditada, evitando vulnerabilidades de contraseñas locales y mejorando la gestión de credenciales.

### 2.2. Principio de menor privilegio
Los roles definidos (`admin_documentos`, `admin_ambulancias`, `super_admin`) garantizan que cada usuario acceda únicamente a las funcionalidades que necesita, reduciendo la superficie de ataque.

### 2.3. Acceso público restringido a lectura
El acceso de pacientes vía QR está acotado a documentos individuales y solo lectura (sin listado, sin autenticación, sin escritura). Esto limita la exposición de información.

### 2.4. Anonimización de encuestas
Al almacenar respuestas de forma anónima/seudonimizada se reduce el impacto de una eventual fuga de datos, cumpliendo con la normativa de protección de datos de salud.

### 2.5. Cifrado en tránsito (HTTPS)
El transporte cifrado protege la confidencialidad e integridad de la información durante la transmisión, previniendo interceptación y manipulación.

### 2.6. Desactivación de QR
La capacidad de desactivar un QR (estado `activo`) permite revocar el acceso de forma inmediata ante documentos obsoletos o comprometidos.

### 2.7. Control de documentos sensibles
Al restringir los documentos públicos a información general y sin datos personales, se mitiga el riesgo de exposición de datos clínicos sensibles.

### 2.8. Trazabilidad operativa
El registro de cambios de estado con *timestamp* permite auditar la operación de traslados y detectar irregularidades.

---

## 3. Principales Amenazas

| ID | Amenaza | Descripción | Riesgo | Mitigación |
|----|---------|-------------|--------|------------|
| A01 | Fuga de documentos sensibles | Documentos con información personal expuestos accidentalmente por acceso público vía QR | Alto | Solo documentos de información general, sin datos personales; QR desactivables; acceso solo lectura |
| A02 | Acceso no autorizado a la gestión | Funcionario no autorizado accede a carga/edición/eliminación de documentos | Alto | Autenticación SSO, roles con privilegios mínimos, HTTPS obligatorio |
| A03 | Interceptación de comunicaciones | Captura de credenciales o datos en tránsito (man-in-the-middle) | Medio | HTTPS obligatorio en todos los endpoints, JWT con expiración |
| A04 | Ataques de fuerza bruta al login | Intentos repetidos de adivinar credenciales contra el sistema | Medio | Validación delegada al sistema central (SSO), políticas de bloqueo del sistema central |
| A05 | Pérdida o corrupción de datos | Falla del servidor, desastre físico o error de base de datos | Alto | Backup diario, plan de contingencia DTI, persistencia transaccional |
| A06 | Suplantación de QR / phishing | QR malicioso que dirige a un sitio falso o documento adulterado | Medio | QRs generados server-side con URL oficial, validación de documento activo |
| A07 | Exposición de datos de encuestas | Acceso indebido a respuestas de pacientes | Medio | Almacenamiento anónimo/seudonimizado, acceso restringido al dashboard |
| A08 | Inyección de código (SQL/XSS) | Manipulación de formularios para comprometer la base o el cliente | Medio | Backend con API REST validando entradas, uso de consultas parametrizadas, escape de salidas |
| A09 | Manipulación de estados de traslados | Cambio no autorizado o retroceso de estados operativos | Medio | Solo usuarios autenticados con rol `admin_ambulancias`, registro con timestamp, sin retroceder estados |
| A10 | Ataques de denegación de servicio (DoS) | Saturación de los servicios públicos de visualización vía QR | Bajo | Limitación de peticiones, monitoreo y capacidad de servidor del DTI |

---

## 4. Cumplimiento y Normativa

- Los datos de salud se tratan bajo la **normativa aplicable de protección de datos** (anonimización/seudonimización de encuestas).
- El acceso del personal administrativo se rige por las políticas de identidad del sistema centralizado del hospital.
- Se debe documentar y mantener un registro de auditoría de accesos a las áreas de gestión.
