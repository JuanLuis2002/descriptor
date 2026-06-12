const pool = require('./db');

async function query(sql, params) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function getDescriptorBase(corrEmpresa, corrDescriptorPuesto) {
  const rows = await query(
    `SELECT
       d.CORR_EMPRESA,
       d.CORR_DESCRIPTOR_PUESTO,
       d.CORR_PUESTO,
       p.NOMBRE_PUESTO,
       p.ESTADO AS ESTADO_PUESTO,
       p.APROBACION AS APROBACION_PUESTO,
       d.CORR_UNIDAD,
       u.NOMBRE_UNIDAD,
       d.CORR_EQUIPO,
       e.NOMBRE_EQUIPO,
       e.DESCRIPCION AS DESCRIPCION_EQUIPO,
       d.CORR_ENTRENAMIENTO,
       ent.NOMBRE_ENTRENAMIENTO,
       ent.SEMANAS_INDUCCION,
       d.FECHA_EMISION,
       d.PUESTO_REPORTA,
       d.FECHA_REVISION,
       d.NUM_PERSONAL_CARGO,
       d.OBJETIVO_PUESTO,
       d.RESP_FONDOS,
       d.RESP_DOCUMENTOS,
       d.TOMA_DECISIONES,
       d.RESP_PERSONAL,
       d.IMPACTO_ECONOMICO,
       d.ESFUERZO_FISICO,
       d.CONDICION_AMBIENTAL,
       d.PUESTOS_RESPONSABLES,
       d.FORMATO,
       d.VERSION,
       d.ESTADO,
       d.USUARIO_CREA,
       d.FECHA_CREA
     FROM SC_DESCRIPTOR_PUESTO d
     INNER JOIN PLA_PUESTO p
       ON p.CORR_EMPRESA = d.CORR_EMPRESA
      AND p.CORR_PUESTO = d.CORR_PUESTO
     INNER JOIN GEN_UNIDAD u
       ON u.CORR_EMPRESA = d.CORR_EMPRESA
      AND u.CORR_UNIDAD = d.CORR_UNIDAD
     LEFT JOIN SC_EQUIPO e
       ON e.CORR_EMPRESA = d.CORR_EMPRESA
      AND e.CORR_EQUIPO = d.CORR_EQUIPO
     LEFT JOIN SC_ENTRENAMIENTO ent
       ON ent.CORR_EMPRESA = d.CORR_EMPRESA
      AND ent.CORR_ENTRENAMIENTO = d.CORR_ENTRENAMIENTO
     WHERE d.CORR_EMPRESA = :corrEmpresa
       AND d.CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto`,
    { corrEmpresa, corrDescriptorPuesto }
  );

  return rows[0] || null;
}

async function getFunciones(corrEmpresa, corrDescriptorPuesto) {
  const funciones = await query(
    `SELECT
       CORR_FUNCION,
       NOMBRE_FUNCION,
       TIPO_FUNCION
     FROM SC_FUNCION
     WHERE CORR_EMPRESA = :corrEmpresa
       AND CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto
     ORDER BY CORR_FUNCION`,
    { corrEmpresa, corrDescriptorPuesto }
  );

  const actividades = await query(
    `SELECT
       a.CORR_FUNCION,
       a.CORR_ACTIVIDAD,
       a.NOMBRE_ACTIVIDAD
     FROM SC_ACTIVIDAD a
     INNER JOIN SC_FUNCION f
       ON f.CORR_EMPRESA = a.CORR_EMPRESA
      AND f.CORR_FUNCION = a.CORR_FUNCION
     WHERE f.CORR_EMPRESA = :corrEmpresa
       AND f.CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto
     ORDER BY a.CORR_FUNCION, a.CORR_ACTIVIDAD`,
    { corrEmpresa, corrDescriptorPuesto }
  );

  const actividadesPorFuncion = actividades.reduce((map, item) => {
    if (!map[item.CORR_FUNCION]) map[item.CORR_FUNCION] = [];
    map[item.CORR_FUNCION].push(item);
    return map;
  }, {});

  return funciones.map((funcion) => ({
    ...funcion,
    ACTIVIDADES: actividadesPorFuncion[funcion.CORR_FUNCION] || []
  }));
}

async function getKpis(corrEmpresa, corrDescriptorPuesto) {
  return query(
    `SELECT
       k.CORR_KPI_FUNCION,
       k.INDICADOR,
       k.META,
       f.NOMBRE_FRECUENCIA
     FROM SC_KPI_FUNCION k
     LEFT JOIN SC_FRECUENCIA f
       ON f.CORR_EMPRESA = k.CORR_EMPRESA
      AND f.CORR_FRECUENCIA = k.CORR_FRECUENCIA
     WHERE k.CORR_EMPRESA = :corrEmpresa
       AND k.CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto
     ORDER BY k.CORR_KPI_FUNCION`,
    { corrEmpresa, corrDescriptorPuesto }
  );
}

async function getRelaciones(corrEmpresa, corrDescriptorPuesto) {
  return query(
    `SELECT
       CORR_RELACION_LABORAL,
       TIPO_RELACION,
       PUESTO_AREA,
       MOTIVO_RELACION
     FROM SC_RELACION_LABORAL
     WHERE CORR_EMPRESA = :corrEmpresa
       AND CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto
     ORDER BY TIPO_RELACION, CORR_RELACION_LABORAL`,
    { corrEmpresa, corrDescriptorPuesto }
  );
}

async function getRiesgos(corrEmpresa, corrDescriptorPuesto) {
  return query(
    `SELECT
       CORR_RIESGO_PROFESIONAL,
       NOMBRE_RIESGO_PROFESIONAL
     FROM SC_RIESGO_PROFESIONAL
     WHERE CORR_EMPRESA = :corrEmpresa
       AND CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto
     ORDER BY CORR_RIESGO_PROFESIONAL`,
    { corrEmpresa, corrDescriptorPuesto }
  );
}

async function getPerfil(corrEmpresa, corrDescriptorPuesto) {
  const rows = await query(
    `SELECT
       pp.CORR_PERFIL_PUESTO,
       pp.EDAD_MINIMA,
       pp.EDAD_MAXIMA,
       pp.SEXO,
       pp.ESTADO_FAMILIAR,
       pp.DISP_VEHICULO,
       dh.NOMBRE_DISPONIBILIDAD_HORARIO,
       tm.NOMBRE_TIPO_MODALIDAD
     FROM SC_PERFIL_PUESTO pp
     LEFT JOIN SC_DISPONIBILIDAD_HORARIO dh
       ON dh.CORR_EMPRESA = pp.CORR_EMPRESA
      AND dh.CORR_DISPONIBILIDAD_HORARIO = pp.CORR_DISPONIBILIDAD_HORARIO
     LEFT JOIN SC_TIPO_MODALIDAD tm
       ON tm.CORR_EMPRESA = pp.CORR_EMPRESA
      AND tm.CORR_TIPO_MODALIDAD = pp.CORR_TIPO_MODALIDAD
     WHERE pp.CORR_EMPRESA = :corrEmpresa
       AND pp.CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto`,
    { corrEmpresa, corrDescriptorPuesto }
  );

  const perfil = rows[0] || null;
  if (!perfil) return null;

  const corrPerfilPuesto = perfil.CORR_PERFIL_PUESTO;
  const [educacion, experiencia, competenciasTecnicas, competenciasConductuales] = await Promise.all([
    query(
      `SELECT CORR_EDUCACION, REQUISITO, ESPECIFICACIONES, REQUERIDO
       FROM SC_EDUCACION
       WHERE CORR_EMPRESA = :corrEmpresa
         AND CORR_PERFIL_PUESTO = :corrPerfilPuesto
       ORDER BY CORR_EDUCACION`,
      { corrEmpresa, corrPerfilPuesto }
    ),
    query(
      `SELECT CORR_EXPERIENCIA, REQUISITO, REQUERIDO
       FROM SC_EXPERIENCIA
       WHERE CORR_EMPRESA = :corrEmpresa
         AND CORR_PERFIL_PUESTO = :corrPerfilPuesto
       ORDER BY CORR_EXPERIENCIA`,
      { corrEmpresa, corrPerfilPuesto }
    ),
    query(
      `SELECT CORR_COMPETENCIAS_TECNICAS, NOMBRE_COMPETENCIAS_TECNICAS, NIVEL_DOMINIO
       FROM SC_COMPETENCIAS_TECNICAS
       WHERE CORR_EMPRESA = :corrEmpresa
         AND CORR_PERFIL_PUESTO = :corrPerfilPuesto
       ORDER BY CORR_COMPETENCIAS_TECNICAS`,
      { corrEmpresa, corrPerfilPuesto }
    ),
    query(
      `SELECT CORR_COMPETENCIAS_CONDUCTUALES, NOMBRE_COMPETENCIAS_CONDUCTUALES, DESCRIPCION
       FROM SC_COMPETENCIAS_CONDUCTUALES
       WHERE CORR_EMPRESA = :corrEmpresa
         AND CORR_PERFIL_PUESTO = :corrPerfilPuesto
       ORDER BY CORR_COMPETENCIAS_CONDUCTUALES`,
      { corrEmpresa, corrPerfilPuesto }
    )
  ]);

  return {
    ...perfil,
    EDUCACION: educacion,
    EXPERIENCIA: experiencia,
    COMPETENCIAS_TECNICAS: competenciasTecnicas,
    COMPETENCIAS_CONDUCTUALES: competenciasConductuales
  };
}

async function getRequerimientos(corrEmpresa) {
  return query(
    `SELECT CORR_REQUERIMIENTO_ORGANIZACIONAL, DESCRIPCION
     FROM SC_REQUERIMIENTO_ORGANIZACIONAL
     WHERE CORR_EMPRESA = :corrEmpresa
     ORDER BY CORR_REQUERIMIENTO_ORGANIZACIONAL`,
    { corrEmpresa }
  );
}

async function getBitacora(corrEmpresa, corrDescriptorPuesto) {
  return query(
    `SELECT
       CORR_BITACORA_DESCRIPTOR,
       ACCION,
       ESTADO_ANTERIOR,
       ESTADO_NUEVO,
       OBSERVACION,
       USUARIO,
       ROL_USUARIO,
       FECHA_ACCION
     FROM SC_BITACORA_DESCRIPTOR
     WHERE CORR_EMPRESA = :corrEmpresa
       AND CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto
     ORDER BY FECHA_ACCION, CORR_BITACORA_DESCRIPTOR`,
    { corrEmpresa, corrDescriptorPuesto }
  );
}

async function getDescriptorCompleto(corrEmpresa, corrDescriptorPuesto) {
  const descriptor = await getDescriptorBase(corrEmpresa, corrDescriptorPuesto);
  if (!descriptor) return null;

  const [
    funciones,
    kpis,
    relaciones,
    riesgos,
    perfil,
    requerimientos,
    bitacora
  ] = await Promise.all([
    getFunciones(corrEmpresa, corrDescriptorPuesto),
    getKpis(corrEmpresa, corrDescriptorPuesto),
    getRelaciones(corrEmpresa, corrDescriptorPuesto),
    getRiesgos(corrEmpresa, corrDescriptorPuesto),
    getPerfil(corrEmpresa, corrDescriptorPuesto),
    getRequerimientos(corrEmpresa),
    getBitacora(corrEmpresa, corrDescriptorPuesto)
  ]);

  return {
    ...descriptor,
    FUNCIONES: funciones,
    KPIS: kpis,
    RELACIONES_LABORALES: relaciones,
    RIESGOS_PROFESIONALES: riesgos,
    PERFIL: perfil,
    REQUERIMIENTOS_ORGANIZACIONALES: requerimientos,
    BITACORA: bitacora
  };
}

async function getDescriptoresResumen(corrEmpresa) {
  return query(
    `SELECT
       d.CORR_EMPRESA,
       d.CORR_DESCRIPTOR_PUESTO,
       d.CORR_PUESTO,
       d.FORMATO,
       d.VERSION,
       d.ESTADO,
       d.FECHA_EMISION,
       p.NOMBRE_PUESTO,
       u.NOMBRE_UNIDAD,
       (
         SELECT COUNT(1)
         FROM SC_BITACORA_DESCRIPTOR b
         WHERE b.CORR_EMPRESA = d.CORR_EMPRESA
           AND b.CORR_DESCRIPTOR_PUESTO = d.CORR_DESCRIPTOR_PUESTO
       ) AS TOTAL_EVENTOS
     FROM SC_DESCRIPTOR_PUESTO d
     INNER JOIN PLA_PUESTO p
       ON p.CORR_EMPRESA = d.CORR_EMPRESA
      AND p.CORR_PUESTO = d.CORR_PUESTO
     INNER JOIN GEN_UNIDAD u
       ON u.CORR_EMPRESA = d.CORR_EMPRESA
      AND u.CORR_UNIDAD = d.CORR_UNIDAD
     WHERE d.CORR_EMPRESA = :corrEmpresa
     ORDER BY d.CORR_PUESTO, TRY_CONVERT(INT, d.VERSION), d.CORR_DESCRIPTOR_PUESTO`,
    { corrEmpresa }
  );
}

async function getDescriptorEstado(corrEmpresa, corrDescriptorPuesto) {
  const rows = await query(
    `SELECT
       CORR_DESCRIPTOR_PUESTO,
       CORR_PUESTO,
       ESTADO,
       VERSION
     FROM SC_DESCRIPTOR_PUESTO
     WHERE CORR_EMPRESA = :corrEmpresa
       AND CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto`,
    { corrEmpresa, corrDescriptorPuesto }
  );
  return rows[0] || null;
}

async function existeOtroDescriptorVigente(corrEmpresa, corrDescriptorPuesto, corrPuesto) {
  const rows = await query(
    `SELECT TOP 1
       CORR_DESCRIPTOR_PUESTO,
       VERSION,
       ESTADO
     FROM SC_DESCRIPTOR_PUESTO
     WHERE CORR_EMPRESA = :corrEmpresa
       AND CORR_PUESTO = :corrPuesto
       AND CORR_DESCRIPTOR_PUESTO <> :corrDescriptorPuesto
       AND ESTADO <> 'INACTIVO'
     ORDER BY TRY_CONVERT(INT, VERSION) DESC, CORR_DESCRIPTOR_PUESTO DESC`,
    { corrEmpresa, corrDescriptorPuesto, corrPuesto }
  );
  return rows[0] || null;
}

async function getSiguienteBitacoraId(corrEmpresa, corrDescriptorPuesto) {
  const rows = await query(
    `SELECT ISNULL(MAX(CORR_BITACORA_DESCRIPTOR), 0) + 1 AS SIGUIENTE
     FROM SC_BITACORA_DESCRIPTOR
     WHERE CORR_EMPRESA = :corrEmpresa`,
    { corrEmpresa, corrDescriptorPuesto }
  );
  return rows[0] ? rows[0].SIGUIENTE : 1;
}

async function registrarBitacora(corrEmpresa, corrDescriptorPuesto, evento) {
  const corrBitacoraDescriptor = await getSiguienteBitacoraId(corrEmpresa, corrDescriptorPuesto);
  await query(
    `INSERT INTO SC_BITACORA_DESCRIPTOR
     (
       CORR_EMPRESA,
       CORR_DESCRIPTOR_PUESTO,
       CORR_BITACORA_DESCRIPTOR,
       ACCION,
       ESTADO_ANTERIOR,
       ESTADO_NUEVO,
       OBSERVACION,
       USUARIO,
       ROL_USUARIO,
       FECHA_ACCION
     )
     VALUES
     (
       :corrEmpresa,
       :corrDescriptorPuesto,
       :corrBitacoraDescriptor,
       :accion,
       :estadoAnterior,
       :estadoNuevo,
       :observacion,
       :usuario,
       :rolUsuario,
       GETDATE()
     )`,
    {
      corrEmpresa,
      corrDescriptorPuesto,
      corrBitacoraDescriptor,
      accion: evento.accion,
      estadoAnterior: evento.estadoAnterior || null,
      estadoNuevo: evento.estadoNuevo || null,
      observacion: evento.observacion || null,
      usuario: evento.usuario || 'demo',
      rolUsuario: evento.rolUsuario || 'Usuario demo'
    }
  );
}

async function cambiarEstadoDescriptor(corrEmpresa, corrDescriptorPuesto, nuevoEstado, options) {
  const estadosPermitidos = ['ENVIADO', 'REVISADO', 'ACTIVO', 'INACTIVO'];
  if (!estadosPermitidos.includes(nuevoEstado)) {
    return { ok: false, message: 'Estado no permitido para el descriptor.' };
  }

  const descriptor = await getDescriptorEstado(corrEmpresa, corrDescriptorPuesto);
  if (!descriptor) {
    return { ok: false, message: 'Descriptor no encontrado.' };
  }

  if (nuevoEstado === 'ACTIVO') {
    const vigente = await existeOtroDescriptorVigente(corrEmpresa, corrDescriptorPuesto, descriptor.CORR_PUESTO);
    if (vigente) {
      return {
        ok: false,
        message: `No se puede activar porque existe otro descriptor vigente o en proceso para el mismo puesto: DES-${vigente.CORR_DESCRIPTOR_PUESTO}, versión ${vigente.VERSION}, estado ${vigente.ESTADO}.`
      };
    }
  }

  await query(
    `UPDATE SC_DESCRIPTOR_PUESTO
     SET ESTADO = :nuevoEstado,
         USUARIO_ACTU = :usuario,
         FECHA_ACTU = GETDATE(),
         ESTACION_ACTU = :estacion
     WHERE CORR_EMPRESA = :corrEmpresa
       AND CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto`,
    {
      corrEmpresa,
      corrDescriptorPuesto,
      nuevoEstado,
      usuario: options.usuario || 'demo',
      estacion: options.estacion || 'WEB'
    }
  );

  const accion = nuevoEstado === 'ACTIVO'
    ? 'ACTIVACION_DESCRIPTOR'
    : nuevoEstado === 'INACTIVO'
      ? 'DESACTIVACION_DESCRIPTOR'
      : 'CAMBIO_ESTADO_DESCRIPTOR';

  await registrarBitacora(corrEmpresa, corrDescriptorPuesto, {
    accion,
    estadoAnterior: descriptor.ESTADO,
    estadoNuevo: nuevoEstado,
    observacion: options.observacion || `Cambio de estado de ${descriptor.ESTADO} a ${nuevoEstado}.`,
    usuario: options.usuario || 'demo',
    rolUsuario: options.rolUsuario || 'Usuario demo'
  });

  return { ok: true };
}

async function crearNuevaVersionDescriptor(corrEmpresa, corrDescriptorPuesto, options) {
  const origen = await getDescriptorEstado(corrEmpresa, corrDescriptorPuesto);
  if (!origen) {
    return { ok: false, message: 'Descriptor origen no encontrado.' };
  }

  if (origen.ESTADO !== 'INACTIVO') {
    return { ok: false, message: 'Solo se puede crear una nueva versión desde un descriptor inactivo.' };
  }

  const vigente = await existeOtroDescriptorVigente(corrEmpresa, corrDescriptorPuesto, origen.CORR_PUESTO);
  if (vigente) {
    return {
      ok: false,
      message: `No se puede crear nueva versión porque existe otro descriptor vigente o en proceso para el mismo puesto: DES-${vigente.CORR_DESCRIPTOR_PUESTO}, versión ${vigente.VERSION}, estado ${vigente.ESTADO}.`
    };
  }

  const rows = await query(
    `SET XACT_ABORT ON;
     BEGIN TRANSACTION;

     DECLARE @NuevoDescriptor INT;
     DECLARE @NuevaVersion VARCHAR(50);
     DECLARE @BaseFuncion INT;
     DECLARE @BaseActividad INT;
     DECLARE @BaseKpi INT;
     DECLARE @BaseRelacion INT;
     DECLARE @BaseRiesgo INT;
     DECLARE @BasePerfil INT;
     DECLARE @BaseEducacion INT;
     DECLARE @BaseExperiencia INT;
     DECLARE @BaseCompetenciaTecnica INT;
     DECLARE @BaseCompetenciaConductual INT;

     SELECT @NuevoDescriptor = ISNULL(MAX(CORR_DESCRIPTOR_PUESTO), 0) + 1
     FROM SC_DESCRIPTOR_PUESTO
     WHERE CORR_EMPRESA = :corrEmpresa;

     SELECT @NuevaVersion = CONVERT(VARCHAR(50), ISNULL(MAX(TRY_CONVERT(INT, VERSION)), 0) + 1)
     FROM SC_DESCRIPTOR_PUESTO
     WHERE CORR_EMPRESA = :corrEmpresa
       AND CORR_PUESTO = :corrPuesto;

     INSERT INTO SC_DESCRIPTOR_PUESTO
     (
       CORR_EMPRESA,
       CORR_PUESTO,
       CORR_UNIDAD,
       CORR_EQUIPO,
       CORR_ENTRENAMIENTO,
       CORR_DESCRIPTOR_PUESTO,
       FECHA_EMISION,
       PUESTO_REPORTA,
       FECHA_REVISION,
       NUM_PERSONAL_CARGO,
       OBJETIVO_PUESTO,
       RESP_FONDOS,
       RESP_DOCUMENTOS,
       TOMA_DECISIONES,
       RESP_PERSONAL,
       IMPACTO_ECONOMICO,
       ESFUERZO_FISICO,
       CONDICION_AMBIENTAL,
       PUESTOS_RESPONSABLES,
       FORMATO,
       VERSION,
       ESTADO,
       USUARIO_CREA,
       FECHA_CREA,
       ESTACION_CREA
     )
     SELECT
       CORR_EMPRESA,
       CORR_PUESTO,
       CORR_UNIDAD,
       CORR_EQUIPO,
       CORR_ENTRENAMIENTO,
       @NuevoDescriptor,
       CONVERT(DATE, GETDATE()),
       PUESTO_REPORTA,
       NULL,
       NUM_PERSONAL_CARGO,
       OBJETIVO_PUESTO,
       RESP_FONDOS,
       RESP_DOCUMENTOS,
       TOMA_DECISIONES,
       RESP_PERSONAL,
       IMPACTO_ECONOMICO,
       ESFUERZO_FISICO,
       CONDICION_AMBIENTAL,
       PUESTOS_RESPONSABLES,
       FORMATO,
       @NuevaVersion,
       'ENVIADO',
       :usuario,
       GETDATE(),
       :estacion
     FROM SC_DESCRIPTOR_PUESTO
     WHERE CORR_EMPRESA = :corrEmpresa
       AND CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto;

     DECLARE @FuncionMap TABLE (OLD_FUNCION INT NOT NULL, NEW_FUNCION INT NOT NULL);
     SELECT @BaseFuncion = ISNULL(MAX(CORR_FUNCION), 0)
     FROM SC_FUNCION
     WHERE CORR_EMPRESA = :corrEmpresa;

     INSERT INTO @FuncionMap (OLD_FUNCION, NEW_FUNCION)
     SELECT CORR_FUNCION, @BaseFuncion + ROW_NUMBER() OVER (ORDER BY CORR_FUNCION)
     FROM SC_FUNCION
     WHERE CORR_EMPRESA = :corrEmpresa
       AND CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto;

     INSERT INTO SC_FUNCION
     (
       CORR_EMPRESA,
       CORR_DESCRIPTOR_PUESTO,
       CORR_FUNCION,
       NOMBRE_FUNCION,
       TIPO_FUNCION,
       USUARIO_CREA,
       FECHA_CREA,
       ESTACION_CREA
     )
     SELECT
       f.CORR_EMPRESA,
       @NuevoDescriptor,
       m.NEW_FUNCION,
       f.NOMBRE_FUNCION,
       f.TIPO_FUNCION,
       :usuario,
       GETDATE(),
       :estacion
     FROM SC_FUNCION f
     INNER JOIN @FuncionMap m
       ON m.OLD_FUNCION = f.CORR_FUNCION
     WHERE f.CORR_EMPRESA = :corrEmpresa
       AND f.CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto;

     SELECT @BaseActividad = ISNULL(MAX(CORR_ACTIVIDAD), 0)
     FROM SC_ACTIVIDAD
     WHERE CORR_EMPRESA = :corrEmpresa;

     INSERT INTO SC_ACTIVIDAD
     (
       CORR_EMPRESA,
       CORR_FUNCION,
       CORR_ACTIVIDAD,
       NOMBRE_ACTIVIDAD,
       USUARIO_CREA,
       FECHA_CREA,
       ESTACION_CREA
     )
     SELECT
       a.CORR_EMPRESA,
       m.NEW_FUNCION,
       @BaseActividad + ROW_NUMBER() OVER (ORDER BY a.CORR_ACTIVIDAD),
       a.NOMBRE_ACTIVIDAD,
       :usuario,
       GETDATE(),
       :estacion
     FROM SC_ACTIVIDAD a
     INNER JOIN @FuncionMap m
       ON m.OLD_FUNCION = a.CORR_FUNCION
     WHERE a.CORR_EMPRESA = :corrEmpresa;

     SELECT @BaseKpi = ISNULL(MAX(CORR_KPI_FUNCION), 0)
     FROM SC_KPI_FUNCION
     WHERE CORR_EMPRESA = :corrEmpresa;

     INSERT INTO SC_KPI_FUNCION
     (
       CORR_EMPRESA,
       CORR_DESCRIPTOR_PUESTO,
       CORR_FRECUENCIA,
       CORR_KPI_FUNCION,
       INDICADOR,
       META,
       USUARIO_CREA,
       FECHA_CREA,
       ESTACION_CREA
     )
     SELECT
       CORR_EMPRESA,
       @NuevoDescriptor,
       CORR_FRECUENCIA,
       @BaseKpi + ROW_NUMBER() OVER (ORDER BY CORR_KPI_FUNCION),
       INDICADOR,
       META,
       :usuario,
       GETDATE(),
       :estacion
     FROM SC_KPI_FUNCION
     WHERE CORR_EMPRESA = :corrEmpresa
       AND CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto;

     SELECT @BaseRelacion = ISNULL(MAX(CORR_RELACION_LABORAL), 0)
     FROM SC_RELACION_LABORAL
     WHERE CORR_EMPRESA = :corrEmpresa;

     INSERT INTO SC_RELACION_LABORAL
     (
       CORR_EMPRESA,
       CORR_DESCRIPTOR_PUESTO,
       CORR_RELACION_LABORAL,
       TIPO_RELACION,
       PUESTO_AREA,
       MOTIVO_RELACION,
       USUARIO_CREA,
       FECHA_CREA,
       ESTACION_CREA
     )
     SELECT
       CORR_EMPRESA,
       @NuevoDescriptor,
       @BaseRelacion + ROW_NUMBER() OVER (ORDER BY CORR_RELACION_LABORAL),
       TIPO_RELACION,
       PUESTO_AREA,
       MOTIVO_RELACION,
       :usuario,
       GETDATE(),
       :estacion
     FROM SC_RELACION_LABORAL
     WHERE CORR_EMPRESA = :corrEmpresa
       AND CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto;

     SELECT @BaseRiesgo = ISNULL(MAX(CORR_RIESGO_PROFESIONAL), 0)
     FROM SC_RIESGO_PROFESIONAL
     WHERE CORR_EMPRESA = :corrEmpresa;

     INSERT INTO SC_RIESGO_PROFESIONAL
     (
       CORR_EMPRESA,
       CORR_DESCRIPTOR_PUESTO,
       CORR_RIESGO_PROFESIONAL,
       NOMBRE_RIESGO_PROFESIONAL,
       USUARIO_CREA,
       FECHA_CREA,
       ESTACION_CREA
     )
     SELECT
       CORR_EMPRESA,
       @NuevoDescriptor,
       @BaseRiesgo + ROW_NUMBER() OVER (ORDER BY CORR_RIESGO_PROFESIONAL),
       NOMBRE_RIESGO_PROFESIONAL,
       :usuario,
       GETDATE(),
       :estacion
     FROM SC_RIESGO_PROFESIONAL
     WHERE CORR_EMPRESA = :corrEmpresa
       AND CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto;

     DECLARE @PerfilMap TABLE (OLD_PERFIL INT NOT NULL, NEW_PERFIL INT NOT NULL);
     SELECT @BasePerfil = ISNULL(MAX(CORR_PERFIL_PUESTO), 0)
     FROM SC_PERFIL_PUESTO
     WHERE CORR_EMPRESA = :corrEmpresa;

     INSERT INTO @PerfilMap (OLD_PERFIL, NEW_PERFIL)
     SELECT CORR_PERFIL_PUESTO, @BasePerfil + ROW_NUMBER() OVER (ORDER BY CORR_PERFIL_PUESTO)
     FROM SC_PERFIL_PUESTO
     WHERE CORR_EMPRESA = :corrEmpresa
       AND CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto;

     INSERT INTO SC_PERFIL_PUESTO
     (
       CORR_EMPRESA,
       CORR_DESCRIPTOR_PUESTO,
       CORR_DISPONIBILIDAD_HORARIO,
       CORR_TIPO_MODALIDAD,
       CORR_PERFIL_PUESTO,
       EDAD_MINIMA,
       EDAD_MAXIMA,
       SEXO,
       ESTADO_FAMILIAR,
       DISP_VEHICULO,
       USUARIO_CREA,
       FECHA_CREA,
       ESTACION_CREA
     )
     SELECT
       p.CORR_EMPRESA,
       @NuevoDescriptor,
       p.CORR_DISPONIBILIDAD_HORARIO,
       p.CORR_TIPO_MODALIDAD,
       m.NEW_PERFIL,
       p.EDAD_MINIMA,
       p.EDAD_MAXIMA,
       p.SEXO,
       p.ESTADO_FAMILIAR,
       p.DISP_VEHICULO,
       :usuario,
       GETDATE(),
       :estacion
     FROM SC_PERFIL_PUESTO p
     INNER JOIN @PerfilMap m
       ON m.OLD_PERFIL = p.CORR_PERFIL_PUESTO
     WHERE p.CORR_EMPRESA = :corrEmpresa
       AND p.CORR_DESCRIPTOR_PUESTO = :corrDescriptorPuesto;

     SELECT @BaseEducacion = ISNULL(MAX(CORR_EDUCACION), 0)
     FROM SC_EDUCACION
     WHERE CORR_EMPRESA = :corrEmpresa;

     INSERT INTO SC_EDUCACION
     (
       CORR_EMPRESA,
       CORR_PERFIL_PUESTO,
       CORR_EDUCACION,
       REQUISITO,
       ESPECIFICACIONES,
       REQUERIDO,
       USUARIO_CREA,
       FECHA_CREA,
       ESTACION_CREA
     )
     SELECT
       e.CORR_EMPRESA,
       m.NEW_PERFIL,
       @BaseEducacion + ROW_NUMBER() OVER (ORDER BY e.CORR_EDUCACION),
       e.REQUISITO,
       e.ESPECIFICACIONES,
       e.REQUERIDO,
       :usuario,
       GETDATE(),
       :estacion
     FROM SC_EDUCACION e
     INNER JOIN @PerfilMap m
       ON m.OLD_PERFIL = e.CORR_PERFIL_PUESTO
     WHERE e.CORR_EMPRESA = :corrEmpresa;

     SELECT @BaseExperiencia = ISNULL(MAX(CORR_EXPERIENCIA), 0)
     FROM SC_EXPERIENCIA
     WHERE CORR_EMPRESA = :corrEmpresa;

     INSERT INTO SC_EXPERIENCIA
     (
       CORR_EMPRESA,
       CORR_PERFIL_PUESTO,
       CORR_EXPERIENCIA,
       REQUISITO,
       REQUERIDO,
       USUARIO_CREA,
       FECHA_CREA,
       ESTACION_CREA
     )
     SELECT
       e.CORR_EMPRESA,
       m.NEW_PERFIL,
       @BaseExperiencia + ROW_NUMBER() OVER (ORDER BY e.CORR_EXPERIENCIA),
       e.REQUISITO,
       e.REQUERIDO,
       :usuario,
       GETDATE(),
       :estacion
     FROM SC_EXPERIENCIA e
     INNER JOIN @PerfilMap m
       ON m.OLD_PERFIL = e.CORR_PERFIL_PUESTO
     WHERE e.CORR_EMPRESA = :corrEmpresa;

     SELECT @BaseCompetenciaTecnica = ISNULL(MAX(CORR_COMPETENCIAS_TECNICAS), 0)
     FROM SC_COMPETENCIAS_TECNICAS
     WHERE CORR_EMPRESA = :corrEmpresa;

     INSERT INTO SC_COMPETENCIAS_TECNICAS
     (
       CORR_EMPRESA,
       CORR_PERFIL_PUESTO,
       CORR_COMPETENCIAS_TECNICAS,
       NOMBRE_COMPETENCIAS_TECNICAS,
       NIVEL_DOMINIO,
       USUARIO_CREA,
       FECHA_CREA,
       ESTACION_CREA
     )
     SELECT
       c.CORR_EMPRESA,
       m.NEW_PERFIL,
       @BaseCompetenciaTecnica + ROW_NUMBER() OVER (ORDER BY c.CORR_COMPETENCIAS_TECNICAS),
       c.NOMBRE_COMPETENCIAS_TECNICAS,
       c.NIVEL_DOMINIO,
       :usuario,
       GETDATE(),
       :estacion
     FROM SC_COMPETENCIAS_TECNICAS c
     INNER JOIN @PerfilMap m
       ON m.OLD_PERFIL = c.CORR_PERFIL_PUESTO
     WHERE c.CORR_EMPRESA = :corrEmpresa;

     SELECT @BaseCompetenciaConductual = ISNULL(MAX(CORR_COMPETENCIAS_CONDUCTUALES), 0)
     FROM SC_COMPETENCIAS_CONDUCTUALES
     WHERE CORR_EMPRESA = :corrEmpresa;

     INSERT INTO SC_COMPETENCIAS_CONDUCTUALES
     (
       CORR_EMPRESA,
       CORR_PERFIL_PUESTO,
       CORR_COMPETENCIAS_CONDUCTUALES,
       NOMBRE_COMPETENCIAS_CONDUCTUALES,
       DESCRIPCION,
       USUARIO_CREA,
       FECHA_CREA,
       ESTACION_CREA
     )
     SELECT
       c.CORR_EMPRESA,
       m.NEW_PERFIL,
       @BaseCompetenciaConductual + ROW_NUMBER() OVER (ORDER BY c.CORR_COMPETENCIAS_CONDUCTUALES),
       c.NOMBRE_COMPETENCIAS_CONDUCTUALES,
       c.DESCRIPCION,
       :usuario,
       GETDATE(),
       :estacion
     FROM SC_COMPETENCIAS_CONDUCTUALES c
     INNER JOIN @PerfilMap m
       ON m.OLD_PERFIL = c.CORR_PERFIL_PUESTO
     WHERE c.CORR_EMPRESA = :corrEmpresa;

     INSERT INTO SC_BITACORA_DESCRIPTOR
     (
       CORR_EMPRESA,
       CORR_DESCRIPTOR_PUESTO,
       CORR_BITACORA_DESCRIPTOR,
       ACCION,
       ESTADO_ANTERIOR,
       ESTADO_NUEVO,
       OBSERVACION,
       USUARIO,
       ROL_USUARIO,
       FECHA_ACCION
     )
     VALUES
     (
       :corrEmpresa,
       @NuevoDescriptor,
       (SELECT ISNULL(MAX(CORR_BITACORA_DESCRIPTOR), 0) + 1 FROM SC_BITACORA_DESCRIPTOR WHERE CORR_EMPRESA = :corrEmpresa),
       'CREACION_NUEVA_VERSION',
       NULL,
       'ENVIADO',
       CONCAT('Nueva versión creada desde DES-', :corrDescriptorPuesto, ', versión ', :versionOrigen, '.'),
       :usuario,
       :rolUsuario,
       GETDATE()
     );

     COMMIT TRANSACTION;

     SELECT @NuevoDescriptor AS CORR_DESCRIPTOR_PUESTO, @NuevaVersion AS VERSION;`,
    {
      corrEmpresa,
      corrDescriptorPuesto,
      corrPuesto: origen.CORR_PUESTO,
      versionOrigen: origen.VERSION,
      usuario: options.usuario || 'demo',
      rolUsuario: options.rolUsuario || 'Usuario demo',
      estacion: options.estacion || 'WEB'
    }
  );

  return {
    ok: true,
    descriptor: rows[0]
  };
}

module.exports = {
  getDescriptorCompleto,
  getDescriptoresResumen,
  cambiarEstadoDescriptor,
  crearNuevaVersionDescriptor
};
