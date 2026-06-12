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
       d.CORR_DESCRIPTOR_PUESTO,
       d.FORMATO,
       d.VERSION,
       d.ESTADO,
       p.NOMBRE_PUESTO,
       u.NOMBRE_UNIDAD
     FROM SC_DESCRIPTOR_PUESTO d
     INNER JOIN PLA_PUESTO p
       ON p.CORR_EMPRESA = d.CORR_EMPRESA
      AND p.CORR_PUESTO = d.CORR_PUESTO
     INNER JOIN GEN_UNIDAD u
       ON u.CORR_EMPRESA = d.CORR_EMPRESA
      AND u.CORR_UNIDAD = d.CORR_UNIDAD
     WHERE d.CORR_EMPRESA = :corrEmpresa
     ORDER BY d.CORR_DESCRIPTOR_PUESTO`,
    { corrEmpresa }
  );
}

module.exports = {
  getDescriptorCompleto,
  getDescriptoresResumen
};
