USE SGUEES;

-- Datos demo para generar dos reportes:
-- 1001 = descriptor formato corto
-- 1002 = descriptor formato extenso
--
-- Nota: en campos BIT se usa 1/0. Si tu modelo maneja 1/2 para activo/inactivo,
-- conviene cambiar esos campos a TINYINT.

DELETE FROM SC_BITACORA_DESCRIPTOR WHERE CORR_EMPRESA = 1 AND CORR_DESCRIPTOR_PUESTO IN (1001, 1002);
DELETE FROM SC_COMPETENCIAS_CONDUCTUALES WHERE CORR_EMPRESA = 1 AND CORR_PERFIL_PUESTO IN (5001, 5002);
DELETE FROM SC_COMPETENCIAS_TECNICAS WHERE CORR_EMPRESA = 1 AND CORR_PERFIL_PUESTO IN (5001, 5002);
DELETE FROM SC_EXPERIENCIA WHERE CORR_EMPRESA = 1 AND CORR_PERFIL_PUESTO IN (5001, 5002);
DELETE FROM SC_EDUCACION WHERE CORR_EMPRESA = 1 AND CORR_PERFIL_PUESTO IN (5001, 5002);
DELETE FROM SC_PERFIL_PUESTO WHERE CORR_EMPRESA = 1 AND CORR_DESCRIPTOR_PUESTO IN (1001, 1002);
DELETE FROM SC_RELACION_LABORAL WHERE CORR_EMPRESA = 1 AND CORR_DESCRIPTOR_PUESTO IN (1001, 1002);
DELETE FROM SC_KPI_FUNCION WHERE CORR_EMPRESA = 1 AND CORR_DESCRIPTOR_PUESTO IN (1001, 1002);
DELETE FROM SC_ACTIVIDAD WHERE CORR_EMPRESA = 1 AND CORR_FUNCION IN (4001, 4002, 4003, 4101, 4102);
DELETE FROM SC_FUNCION WHERE CORR_EMPRESA = 1 AND CORR_DESCRIPTOR_PUESTO IN (1001, 1002);
DELETE FROM SC_RIESGO_PROFESIONAL WHERE CORR_EMPRESA = 1 AND CORR_DESCRIPTOR_PUESTO IN (1001, 1002);
DELETE FROM SC_DESCRIPTOR_PUESTO WHERE CORR_EMPRESA = 1 AND CORR_DESCRIPTOR_PUESTO IN (1001, 1002);
DELETE FROM SC_REQUERIMIENTO_ORGANIZACIONAL WHERE CORR_EMPRESA = 1 AND CORR_REQUERIMIENTO_ORGANIZACIONAL IN (1, 2, 3);
DELETE FROM SC_FRECUENCIA WHERE CORR_EMPRESA = 1 AND CORR_FRECUENCIA IN (1, 2, 3);
DELETE FROM SC_DISPONIBILIDAD_HORARIO WHERE CORR_EMPRESA = 1 AND CORR_DISPONIBILIDAD_HORARIO IN (1, 2);
DELETE FROM SC_TIPO_MODALIDAD WHERE CORR_EMPRESA = 1 AND CORR_TIPO_MODALIDAD IN (1, 2);
DELETE FROM SC_EQUIPO WHERE CORR_EMPRESA = 1 AND CORR_EQUIPO IN (201, 202);
DELETE FROM SC_ENTRENAMIENTO WHERE CORR_EMPRESA = 1 AND CORR_ENTRENAMIENTO IN (301, 302);
DELETE FROM PLA_PUESTO WHERE CORR_EMPRESA = 1 AND CORR_PUESTO IN (101, 102);
DELETE FROM GEN_UNIDAD WHERE CORR_EMPRESA = 1 AND CORR_UNIDAD IN (10, 20);

INSERT INTO PLA_PUESTO
(CORR_EMPRESA, CORR_PUESTO, NOMBRE_PUESTO, ESTADO, APROBACION, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 101, 'Analista Programador', 1, 1, 'demo', 'LOCAL'),
(1, 102, 'Coordinador de Procesos TH', 1, 1, 'demo', 'LOCAL');

INSERT INTO GEN_UNIDAD
(CORR_EMPRESA, CORR_UNIDAD, NOMBRE_UNIDAD, ESTADO, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 10, 'Subgerencia TI', 1, 'demo', 'LOCAL'),
(1, 20, 'Talento Humano', 1, 'demo', 'LOCAL');

INSERT INTO SC_EQUIPO
(CORR_EMPRESA, CORR_PUESTO, CORR_EQUIPO, NOMBRE_EQUIPO, DESCRIPCION, ESTADO, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 101, 201, 'Computadora, mobiliario y herramientas de desarrollo', 'Equipo asignado para análisis, desarrollo y soporte de aplicaciones.', 1, 'demo', 'LOCAL'),
(1, 102, 202, 'Equipo de oficina y herramientas de gestión', 'Equipo utilizado para coordinación, seguimiento y documentación de procesos.', 1, 'demo', 'LOCAL');

INSERT INTO SC_ENTRENAMIENTO
(CORR_EMPRESA, CORR_ENTRENAMIENTO, NOMBRE_ENTRENAMIENTO, SEMANAS_INDUCCION, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 301, 'Inducción específica del puesto', 2, 'demo', 'LOCAL'),
(1, 302, 'Inducción técnica y normativa institucional', 4, 'demo', 'LOCAL');

INSERT INTO SC_FRECUENCIA
(CORR_EMPRESA, CORR_FRECUENCIA, NOMBRE_FRECUENCIA, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 1, 'Mensual', 'demo', 'LOCAL'),
(1, 2, 'Trimestral', 'demo', 'LOCAL'),
(1, 3, 'Anual', 'demo', 'LOCAL');

INSERT INTO SC_DISPONIBILIDAD_HORARIO
(CORR_EMPRESA, CORR_DISPONIBILIDAD_HORARIO, NOMBRE_DISPONIBILIDAD_HORARIO, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 1, 'Tiempo completo', 'demo', 'LOCAL'),
(1, 2, 'Disponibilidad según necesidad operativa', 'demo', 'LOCAL');

INSERT INTO SC_TIPO_MODALIDAD
(CORR_EMPRESA, CORR_TIPO_MODALIDAD, NOMBRE_TIPO_MODALIDAD, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 1, 'Presencial', 'demo', 'LOCAL'),
(1, 2, 'Híbrido', 'demo', 'LOCAL');

INSERT INTO SC_REQUERIMIENTO_ORGANIZACIONAL
(CORR_EMPRESA, CORR_REQUERIMIENTO_ORGANIZACIONAL, DESCRIPCION, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 1, 'Cumplir con los valores institucionales.', 'demo', 'LOCAL'),
(1, 2, 'Cumplir con los normativos institucionales.', 'demo', 'LOCAL'),
(1, 3, 'Cumplir con las competencias requeridas para el cargo.', 'demo', 'LOCAL');

INSERT INTO SC_DESCRIPTOR_PUESTO
(CORR_EMPRESA, CORR_PUESTO, CORR_UNIDAD, CORR_EQUIPO, CORR_ENTRENAMIENTO, CORR_DESCRIPTOR_PUESTO,
 FECHA_EMISION, PUESTO_REPORTA, FECHA_REVISION, NUM_PERSONAL_CARGO, OBJETIVO_PUESTO,
 RESP_FONDOS, RESP_DOCUMENTOS, TOMA_DECISIONES, RESP_PERSONAL, IMPACTO_ECONOMICO,
 ESFUERZO_FISICO, CONDICION_AMBIENTAL, PUESTOS_RESPONSABLES, FORMATO, VERSION, ESTADO,
 USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 101, 10, 201, 301, 1001,
 '2026-06-12', 'Coordinador de Infraestructura TI', '2026-06-12', 0,
 'Analizar, desarrollar y mantener soluciones tecnológicas que apoyen los procesos institucionales.',
 '', '', '', 'No supervisa personal.', 'Rango 1: Poco significativo - menor a $50,000',
 '', '', 'Coordinador de Infraestructura TI y Analista Senior', 'CORTO', '1', 'ACTIVO',
 'demo', 'LOCAL'),
(1, 102, 20, 202, 302, 1002,
 '2026-06-12', 'Jefe de Talento Humano', '2026-06-12', 2,
 'Coordinar procesos de Talento Humano, seguimiento documental y mejora continua de procedimientos internos.',
 'Control limitado de insumos administrativos.', 'Custodia documentación sensible del área.', 'Toma decisiones operativas del proceso asignado.', 'Coordina asistentes y usuarios participantes del flujo.', 'Rango 2: $2,500 a $25,000',
 'Esfuerzo mental por análisis documental y coordinación de actividades.', 'Ambiente de oficina ventilado, iluminado y con uso continuo de computadora.', 'Jefe de Talento Humano', 'EXTENSO', '1', 'ACTIVO',
 'demo', 'LOCAL');

INSERT INTO SC_RIESGO_PROFESIONAL
(CORR_EMPRESA, CORR_DESCRIPTOR_PUESTO, CORR_RIESGO_PROFESIONAL, NOMBRE_RIESGO_PROFESIONAL, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 1002, 6001, 'Fatiga visual por uso prolongado de computadora.', 'demo', 'LOCAL'),
(1, 1002, 6002, 'Estrés por seguimiento de múltiples solicitudes.', 'demo', 'LOCAL');

INSERT INTO SC_FUNCION
(CORR_EMPRESA, CORR_DESCRIPTOR_PUESTO, CORR_FUNCION, NOMBRE_FUNCION, TIPO_FUNCION, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 1001, 4001, 'Desarrollar funcionalidades solicitadas por las áreas usuarias.', 'Clave', 'demo', 'LOCAL'),
(1, 1001, 4002, 'Brindar soporte técnico a aplicaciones institucionales.', 'Clave', 'demo', 'LOCAL'),
(1, 1001, 4003, 'Documentar cambios y mantener actualizados los registros técnicos.', 'Secundaria', 'demo', 'LOCAL'),
(1, 1002, 4101, 'Coordinar la elaboración y revisión de documentos de puesto.', 'Clave', 'demo', 'LOCAL'),
(1, 1002, 4102, 'Dar seguimiento a observaciones y validaciones de los actores del flujo.', 'Clave', 'demo', 'LOCAL');

INSERT INTO SC_ACTIVIDAD
(CORR_EMPRESA, CORR_FUNCION, CORR_ACTIVIDAD, NOMBRE_ACTIVIDAD, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 4101, 7001, 'Revisar información registrada por las unidades organizativas.', 'demo', 'LOCAL'),
(1, 4101, 7002, 'Completar apartados técnicos del descriptor extenso.', 'demo', 'LOCAL'),
(1, 4102, 7003, 'Registrar observaciones recibidas durante la revisión.', 'demo', 'LOCAL'),
(1, 4102, 7004, 'Verificar que los cambios sean incorporados antes de validar.', 'demo', 'LOCAL');

INSERT INTO SC_KPI_FUNCION
(CORR_EMPRESA, CORR_DESCRIPTOR_PUESTO, CORR_FRECUENCIA, CORR_KPI_FUNCION, INDICADOR, META, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 1001, 1, 8001, 'Cumplimiento de requerimientos de desarrollo atendidos', 90, 'demo', 'LOCAL'),
(1, 1001, 2, 8002, 'Incidencias resueltas dentro del tiempo establecido', 85, 'demo', 'LOCAL');

INSERT INTO SC_RELACION_LABORAL
(CORR_EMPRESA, CORR_DESCRIPTOR_PUESTO, CORR_RELACION_LABORAL, TIPO_RELACION, PUESTO_AREA, MOTIVO_RELACION, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 1002, 9001, 'I', 'Jefes Inmediatos', 'Coordinar revisión y validación de descriptores.', 'demo', 'LOCAL'),
(1, 1002, 9002, 'I', 'Jefe de Talento Humano', 'Validar criterios técnicos y aprobación final.', 'demo', 'LOCAL'),
(1, 1002, 9003, 'E', 'Entidades reguladoras', 'Atender lineamientos documentales cuando aplique.', 'demo', 'LOCAL');

INSERT INTO SC_PERFIL_PUESTO
(CORR_EMPRESA, CORR_DESCRIPTOR_PUESTO, CORR_DISPONIBILIDAD_HORARIO, CORR_TIPO_MODALIDAD, CORR_PERFIL_PUESTO,
 EDAD_MINIMA, EDAD_MAXIMA, SEXO, ESTADO_FAMILIAR, DISP_VEHICULO, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 1001, 1, 2, 5001, 22, 55, 'INDIFERENTE', 'INDIFERENTE', 0, 'demo', 'LOCAL'),
(1, 1002, 1, 1, 5002, 25, 60, 'INDIFERENTE', 'INDIFERENTE', 0, 'demo', 'LOCAL');

INSERT INTO SC_EDUCACION
(CORR_EMPRESA, CORR_PERFIL_PUESTO, CORR_EDUCACION, REQUISITO, ESPECIFICACIONES, REQUERIDO, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 5001, 5101, 'Ingeniería o licenciatura en sistemas', 'Carrera universitaria relacionada a tecnología.', 1, 'demo', 'LOCAL'),
(1, 5001, 5102, 'Cursos de programación', 'Conocimientos en desarrollo web y bases de datos.', 0, 'demo', 'LOCAL'),
(1, 5002, 5201, 'Licenciatura en Administración, Psicología o carreras afines', 'Formación relacionada a gestión humana.', 1, 'demo', 'LOCAL'),
(1, 5002, 5202, 'Formación en gestión documental', 'Deseable conocimiento en procesos y documentación institucional.', 0, 'demo', 'LOCAL');

INSERT INTO SC_EXPERIENCIA
(CORR_EMPRESA, CORR_PERFIL_PUESTO, CORR_EXPERIENCIA, REQUISITO, REQUERIDO, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 5001, 5301, 'Dos años en desarrollo o soporte de aplicaciones.', 1, 'demo', 'LOCAL'),
(1, 5002, 5401, 'Tres años en procesos de Talento Humano o gestión documental.', 1, 'demo', 'LOCAL');

INSERT INTO SC_COMPETENCIAS_TECNICAS
(CORR_EMPRESA, CORR_PERFIL_PUESTO, CORR_COMPETENCIAS_TECNICAS, NOMBRE_COMPETENCIAS_TECNICAS, NIVEL_DOMINIO, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 5001, 5501, 'Programación web', 'Intermedio', 'demo', 'LOCAL'),
(1, 5001, 5502, 'Base de datos', 'Intermedio', 'demo', 'LOCAL'),
(1, 5002, 5601, 'Gestión documental', 'Avanzado', 'demo', 'LOCAL'),
(1, 5002, 5602, 'Administración de procesos TH', 'Intermedio', 'demo', 'LOCAL');

INSERT INTO SC_COMPETENCIAS_CONDUCTUALES
(CORR_EMPRESA, CORR_PERFIL_PUESTO, CORR_COMPETENCIAS_CONDUCTUALES, NOMBRE_COMPETENCIAS_CONDUCTUALES, DESCRIPCION, USUARIO_CREA, ESTACION_CREA)
VALUES
(1, 5001, 5701, 'Pensamiento analítico', '', 'demo', 'LOCAL'),
(1, 5001, 5702, 'Orientación al servicio', '', 'demo', 'LOCAL'),
(1, 5002, 5801, 'Comunicación efectiva', 'Capacidad para transmitir información clara a los actores del proceso.', 'demo', 'LOCAL'),
(1, 5002, 5802, 'Organización', 'Capacidad para ordenar, dar seguimiento y cerrar actividades documentales.', 'demo', 'LOCAL');

INSERT INTO SC_BITACORA_DESCRIPTOR
(CORR_EMPRESA, CORR_DESCRIPTOR_PUESTO, CORR_BITACORA_DESCRIPTOR, ACCION, ESTADO_ANTERIOR, ESTADO_NUEVO, OBSERVACION, USUARIO, ROL_USUARIO)
VALUES
(1, 1001, 1, 'CREACION_DESCRIPTOR', NULL, 'ENVIADO', 'Descriptor corto creado como ejemplo.', 'demo', 'Generalista TH'),
(1, 1001, 2, 'VALIDACION_TH', 'ENVIADO', 'ACTIVO', 'Descriptor validado para generación de reporte corto.', 'demo', 'Jefe TH'),
(1, 1002, 3, 'CREACION_DESCRIPTOR', NULL, 'ENVIADO', 'Descriptor extenso creado como ejemplo.', 'demo', 'Generalista TH'),
(1, 1002, 4, 'OBSERVACION_TH', 'ENVIADO', 'ENVIADO', 'Se revisaron apartados técnicos antes de activar.', 'demo', 'Generalista TH'),
(1, 1002, 5, 'VALIDACION_TH', 'ENVIADO', 'ACTIVO', 'Descriptor validado para generación de reporte extenso.', 'demo', 'Jefe TH');
