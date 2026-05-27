export const descriptorService = {
    obtenerBBDD: () => {
        const data = localStorage.getItem('SC_DESCRIPTOR_PUESTO');
        return data ? JSON.parse(data) : [];
    },

    registrarPropuestaPaso1: (payload) => {
        const db = descriptorService.obtenerBBDD();

        // Construcción del registro respetando las llaves primarias compuestas y campos de auditoría
        const nuevoPuesto = {
            CORR_EMPRESA: 1, 
            CORR_PUESTO: db.length > 0 ? Math.max(...db.map(p => p.CORR_PUESTO)) + 1 : 1,
            NOMBRE_PUESTO: payload.NOMBRE_PUESTO,
            SUPERVISA_A: payload.SUPERVISA_A,
            MODALIDAD_TRABAJO: payload.MODALIDAD_TRABAJO,
            IMPACTO_ECONOMICO: payload.IMPACTO_ECONOMICO,
            PERFIL_EDAD: payload.PERFIL_EDAD,
            INDUCCION_DURACION: payload.INDUCCION_DURACION,
            INDUCCION_RESPONSABLE: payload.INDUCCION_RESPONSABLE,
            OBJETIVO_PUESTO: payload.OBJETIVO_PUESTO,
            REQUISITO_EDUCACION: payload.REQUISITO_EDUCACION,
            REQUISITO_EXPERIENCIA: payload.REQUISITO_EXPERIENCIA,
            
            // ESTADO DE FLUJO: Enviado a revisión del Jefe Superior inmediato (Gerente General)
            ESTADO_FLUJO: 'ENVIADO_A_SUPERIOR',
            
            // Sub-colecciones hijas normalizadas (Relaciones 1:N)
            funcionesClaves: payload.funcionesClaves,
            funcionesSecundarias: payload.funcionesSecundarias,
            indicadores: payload.indicadores,
            competencias: payload.competencias,

            // Auditoría técnica
            USUARIO_CREA: sessionStorage.getItem('usuario_nombre') || 'ING_LUIS_GALDAMEZ',
            FECHA_CREA: new Date().toISOString(),
            ESTACION_CREA: "LOCALHOST_WIN10"
        };

        db.push(nuevoPuesto);
        localStorage.setItem('SC_DESCRIPTOR_PUESTO', JSON.stringify(db));
        return nuevoPuesto;
    }
};