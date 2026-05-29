// Servicio de Aprobación TH
var THService = {
    // Obtener descriptores pendientes de revisión por TH (estado ENVIADO_TH)
    getPendientesRevision: function() {
        return DescriptorService.getAll().filter(function(d) {
            return d.estado === 'ENVIADO_TH';
        });
    },
    
    // Obtener descriptores por ID
    getById: function(id) {
        return DescriptorService.getById(id);
    },
    
    // Guardar complementos del TH
    guardarComplementos: function(id, data) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.relacionesLaborales = data.relacionesLaborales;
            descriptor.requerimientosOrganizacionales = data.requerimientosOrganizacionales;
            descriptor.riesgosFisicos = data.riesgosFisicos;
            descriptor.complementadoPorTH = true;
            descriptor.fechaComplementoTH = new Date().toISOString();
            DescriptorService.update(id, descriptor);
            return true;
        }
        return false;
    },
    
    // Aprobar descriptor (enviar a Jefe de TH)
    aprobar: function(id, comentarios) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.estado = 'ACTIVO';
            descriptor.comentariosTH = comentarios;
            descriptor.fechaAprobacionTH = new Date().toISOString();
            // Limpiar observaciones de TH si las había
            if (descriptor.observacionesTH) {
                delete descriptor.observacionesTH;
            }
            DescriptorService.update(id, descriptor);
            return true;
        }
        return false;
    },
    
    // Observar descriptor (devolver al Jefe Inmediato con observaciones)
    observar: function(id, observaciones) {
        var descriptor = DescriptorService.getById(id);
        if (descriptor) {
            descriptor.estado = 'OBSERVADO_TH';
            descriptor.observacionesTH = observaciones;
            descriptor.fechaObservacionTH = new Date().toISOString();
            DescriptorService.update(id, descriptor);
            return true;
        }
        return false;
    }
};

window.THService = THService;